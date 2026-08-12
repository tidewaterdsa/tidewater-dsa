import { useCallback, useEffect, useMemo, useState } from "react"
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
import { useRouter } from "sanity/router"
import { EventRow } from "./EventRow"
import { Toolbar } from "./Toolbar"
import type {
  Customization,
  EventWithCustomization,
  GoogleCalendarEventRow,
  StatusFilter,
  TimeFilter,
} from "./types"
import { SANITY_API_VERSION } from "@/lib/sanity-config"

const CUSTOMIZATIONS_QUERY = `
  *[_type == "event" && defined(googleEventId)]{
    _id,
    googleEventId,
    featured,
    eventType
  }
`

const isEventPast = (event: GoogleCalendarEventRow, now: number): boolean => {
  const relevantISO = event.endISO ?? event.startISO
  if (!relevantISO) return false
  return new Date(relevantISO).getTime() < now
}

export const CustomizeEventsTool = () => {
  const [events, setEvents] = useState<GoogleCalendarEventRow[] | null>(null)
  const [customizations, setCustomizations] = useState<Customization[] | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState<string | null>(null)
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
        client.fetch<Customization[]>(CUSTOMIZATIONS_QUERY),
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

  const joined: EventWithCustomization[] = useMemo(() => {
    if (!events || !customizations) return []
    const customizationById = new Map<string, Customization>()
    for (const c of customizations) customizationById.set(c.googleEventId, c)
    return events.map((e) => ({
      ...e,
      customization: customizationById.get(e.id) ?? null,
    }))
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
    const statusCustomized = timeFiltered.filter((e) => e.customization).length

    const statusFiltered = searchMatches.filter((e) => {
      if (statusFilter === "all") return true
      const hasCustomization = Boolean(e.customization)
      return statusFilter === "customized"
        ? hasCustomization
        : !hasCustomization
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
      if (statusFilter === "uncustomized" && e.customization) return false
      if (statusFilter === "customized" && !e.customization) return false
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

  /** Create a minimal customization doc and navigate to its editor. */
  const customize = useCallback(
    async (event: GoogleCalendarEventRow) => {
      setCreating(event.id)
      try {
        const created = await client.create({
          _type: "event",
          googleEventId: event.id,
          titleHint: event.title,
        })
        toast.push({
          status: "success",
          title: "Customization created",
          description: `Opening ${event.title}…`,
        })
        router.navigateIntent("edit", { id: created._id, type: "event" })
      } catch (err) {
        toast.push({
          status: "error",
          title: "Could not create customization",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      } finally {
        setCreating(null)
      }
    },
    [client, router, toast]
  )

  const openCustomization = useCallback(
    (customization: Customization) => {
      router.navigateIntent("edit", {
        id: customization._id,
        type: "event",
      })
    },
    [router]
  )

  /**
   * One-click featured toggle.
   *
   * Creates a customization if needed (with featured=true), or patches the existing one to flip the flag.
   * Auto-publishes so the change is live immediately. Mo draft state for this single boolean, since there's no editorial judgment to review.
   *
   * Local state updates optimistically so the star flips instantly.
   */
  const toggleFeatured = useCallback(
    async (event: EventWithCustomization) => {
      setFeaturing(event.id)

      try {
        if (event.customization) {
          const next = !event.customization.featured
          await client
            .patch(event.customization._id)
            .set({ featured: next })
            .commit()

          setCustomizations((prev) =>
            prev
              ? prev.map((c) =>
                  c._id === event.customization!._id
                    ? { ...c, featured: next }
                    : c
                )
              : prev
          )
        } else {
          const created = await client.create({
            _type: "event",
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
                creating={creating === e.id}
                featuring={featuring === e.id}
                onCustomize={() => customize(e)}
                onOpen={() =>
                  e.customization && openCustomization(e.customization)
                }
                onToggleFeatured={() => toggleFeatured(e)}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
