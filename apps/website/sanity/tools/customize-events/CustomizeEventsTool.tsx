import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@sanity/ui"
import { RefreshIcon } from "@sanity/icons"
import { useClient } from "sanity"
import { useRouter, useRouterState } from "sanity/router"
import type { RouterState } from "sanity/router"
import { EventRow } from "./EventRow"
import { Toolbar } from "./Toolbar"
import { EVENT_CUSTOMIZATION_TEMPLATE_ID, EVENT_SCHEMA_TYPE } from "./constants"
import type {
  Customization,
  CustomizationRow,
  EventWithCustomization,
  GoogleCalendarEventRow,
  StatusFilter,
  TimeFilter,
} from "./types"
import { SANITY_API_VERSION } from "@/lib/sanity-config"

const CUSTOMIZATIONS_QUERY = `
  *[_type == "event" && defined(googleEventId) && !(_id in path("versions.**"))]{
    _id,
    googleEventId,
    featured,
    eventType,
    attendance,
    topics,
    workingGroup,
    rsvpLink,
    summary
  }
`

const DRAFTS_PREFIX = "drafts."

/** True while a customization is open in the pane beside this list. */
const selectEditorIsOpen = (state: RouterState): boolean =>
  Array.isArray(state.panes) && state.panes.length > 0

const isEventPast = (event: GoogleCalendarEventRow, now: number): boolean => {
  const relevantISO = event.endISO ?? event.startISO
  if (!relevantISO) return false
  return new Date(relevantISO).getTime() < now
}

// googleEventId/titleHint are bookkeeping and `featured: false` is an initial value,
// so none of them count as customizing anything.
const customizesAnything = (customization: Customization): boolean =>
  customization.featured === true ||
  Boolean(customization.eventType) ||
  Boolean(customization.attendance) ||
  (customization.topics?.length ?? 0) > 0 ||
  Boolean(customization.workingGroup) ||
  Boolean(customization.rsvpLink) ||
  Boolean(customization.summary)

// The Studio client reads `raw`, so an edited customization comes back twice. Collapse
// to one row per event, draft wins - it has the newest values.
const indexCustomizations = (
  rows: CustomizationRow[]
): Map<string, Customization> => {
  const byGoogleEventId = new Map<string, Customization>()

  for (const { _id, ...fields } of rows) {
    const isDraft = _id.startsWith(DRAFTS_PREFIX)
    if (byGoogleEventId.has(fields.googleEventId) && !isDraft) continue

    byGoogleEventId.set(fields.googleEventId, {
      ...fields,
      publishedId: isDraft ? _id.slice(DRAFTS_PREFIX.length) : _id,
      currentId: _id,
    })
  }

  return byGoogleEventId
}

export const CustomizeEventsTool = () => {
  const [events, setEvents] = useState<GoogleCalendarEventRow[] | null>(null)
  const [customizations, setCustomizations] = useState<
    CustomizationRow[] | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [featuring, setFeaturing] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("uncustomized")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming")

  const client = useClient({ apiVersion: SANITY_API_VERSION })
  const router = useRouter()
  const toast = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [googleCalendarRes, customizedRes] = await Promise.all([
        fetch("/api/google-calendar-events", {
          credentials: "same-origin",
        }).then(async (r) => {
          if (!r.ok) {
            throw new Error(
              `Failed to fetch events: ${r.status} ${r.statusText}`
            )
          }
          return r.json() as Promise<{ events: GoogleCalendarEventRow[] }>
        }),
        client.fetch<CustomizationRow[]>(CUSTOMIZATIONS_QUERY),
      ])
      setEvents(googleCalendarRes.events)
      setCustomizations(customizedRes ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    load()
  }, [load])

  // The list stays mounted while the editor is open next to it, so refetch on close or
  // the row just edited stays stale.
  const editorIsOpen = useRouterState(selectEditorIsOpen)
  const editorWasOpen = useRef(editorIsOpen)

  useEffect(() => {
    if (editorWasOpen.current && !editorIsOpen) load()
    editorWasOpen.current = editorIsOpen
  }, [editorIsOpen, load])

  const joined: EventWithCustomization[] = useMemo(() => {
    if (!events || !customizations) return []
    const customizationById = indexCustomizations(customizations)
    return events.map((e) => {
      const customization = customizationById.get(e.id) ?? null
      return {
        ...e,
        customization,
        isCustomized: customization ? customizesAnything(customization) : false,
      }
    })
  }, [events, customizations])

  const searchMatches = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return joined

    return joined.filter((e) => {
      const searchText = [e.title, e.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return searchText.includes(q)
    })
  }, [joined, search])

  const counts = useMemo(() => {
    const now = Date.now()

    const timeFiltered = searchMatches.filter((e) => {
      if (timeFilter === "all") return true
      const past = isEventPast(e, now)
      return timeFilter === "upcoming" ? !past : past
    })
    const statusAll = timeFiltered.length
    const statusCustomized = timeFiltered.filter((e) => e.isCustomized).length

    const statusFiltered = searchMatches.filter((e) => {
      if (statusFilter === "all") return true
      return statusFilter === "customized" ? e.isCustomized : !e.isCustomized
    })
    const timeAll = statusFiltered.length
    const timePast = statusFiltered.filter((e) => isEventPast(e, now)).length

    return {
      total: joined.length,
      byStatus: {
        all: statusAll,
        customized: statusCustomized,
        uncustomized: statusAll - statusCustomized,
      },
      byTime: {
        all: timeAll,
        past: timePast,
        upcoming: timeAll - timePast,
      },
    }
  }, [joined, searchMatches, timeFilter, statusFilter])

  // Final filtered set for rendering
  const filtered = useMemo(() => {
    const now = Date.now()

    return searchMatches.filter((e) => {
      if (statusFilter === "uncustomized" && e.isCustomized) return false
      if (statusFilter === "customized" && !e.isCustomized) return false
      if (timeFilter !== "all") {
        const past = isEventPast(e, now)
        if (timeFilter === "upcoming" && past) return false
        if (timeFilter === "past" && !past) return false
      }
      return true
    })
  }, [searchMatches, statusFilter, timeFilter])

  const hasActiveFilters =
    search.trim().length > 0 ||
    statusFilter !== "uncustomized" ||
    timeFilter !== "upcoming"

  const resetFilters = useCallback(() => {
    setSearch("")
    setStatusFilter("uncustomized")
    setTimeFilter("upcoming")
  }, [])

  const openEditor = useCallback(
    (event: EventWithCustomization) => {
      const existing = event.customization

      router.navigate({
        panes: [
          [
            {
              id: `__edit__${existing ? existing.publishedId : crypto.randomUUID()}`,
              params: existing
                ? { type: EVENT_SCHEMA_TYPE }
                : {
                    type: EVENT_SCHEMA_TYPE,
                    template: EVENT_CUSTOMIZATION_TEMPLATE_ID,
                  },
              payload: existing
                ? undefined
                : { googleEventId: event.id, titleHint: event.title },
            },
          ],
        ],
      })
    },
    [router]
  )

  /**
   * One-click featured toggle, optimistic so the star flips instantly.
   *
   * A customization created here skips drafts and goes live immediately - there's no
   * editorial judgment to review on one boolean. An existing one is patched wherever it
   * lives: writing to published while a draft is open gets clobbered on the next publish.
   */
  const toggleFeatured = useCallback(
    async (event: EventWithCustomization) => {
      setFeaturing(event.id)

      try {
        if (event.customization) {
          const { currentId } = event.customization
          const next = !event.customization.featured
          await client.patch(currentId).set({ featured: next }).commit()

          setCustomizations((prev) =>
            prev
              ? prev.map((c) =>
                  c._id === currentId ? { ...c, featured: next } : c
                )
              : prev
          )
        } else {
          const created = await client.create({
            _type: EVENT_SCHEMA_TYPE,
            googleEventId: event.id,
            titleHint: event.title,
            featured: true,
          })

          setCustomizations((prev) => [
            ...(prev ?? []),
            {
              _id: created._id,
              googleEventId: event.id,
              featured: true,
            },
          ])
        }
      } catch (err) {
        toast.push({
          status: "error",
          title: "Could not update featured status",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      } finally {
        setFeaturing(null)
      }
    },
    [client, toast]
  )

  return (
    <Box padding={4} style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Stack space={4}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
          <Stack space={2}>
            <Heading size={2}>Customize Events</Heading>
            <Text size={1} muted>
              Browse events from Google Calendar and customize how they appear
              on the website (feature them, categorize them, add RSVP links or
              summaries).
            </Text>
          </Stack>
          <Button
            icon={RefreshIcon}
            mode="ghost"
            text="Refresh"
            onClick={load}
            disabled={loading}
          />
        </Flex>

        <Toolbar
          search={search}
          onSearch={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          timeFilter={timeFilter}
          onTimeChange={setTimeFilter}
          counts={counts}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />

        {error ? (
          <Card tone="critical" padding={3} radius={2}>
            <Text size={1}>Could not load events: {error}</Text>
          </Card>
        ) : loading && !events ? (
          <Flex justify="center" padding={5}>
            <Spinner muted />
          </Flex>
        ) : filtered.length === 0 ? (
          <Card tone="transparent" padding={5} radius={2} border>
            <Stack space={3}>
              <Text align="center" size={1} muted>
                No events match these filters.
              </Text>
              {hasActiveFilters && (
                <Flex justify="center">
                  <Button
                    mode="ghost"
                    text="Clear filters"
                    onClick={resetFilters}
                  />
                </Flex>
              )}
              {counts.total === 0 && (
                <Text align="center" size={1} muted>
                  The Google Calendar returned no events in the default window
                  (3 months back, 12 months forward).
                </Text>
              )}
            </Stack>
          </Card>
        ) : (
          <Stack space={3}>
            {filtered.map((e) => (
              <EventRow
                key={e.id}
                event={e}
                featuring={featuring === e.id}
                onOpen={() => openEditor(e)}
                onToggleFeatured={() => toggleFeatured(e)}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
