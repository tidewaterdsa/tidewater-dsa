import { useState, useEffect, useMemo, useCallback } from "react"
import { addMonths, parseISO, subMonths } from "date-fns"
import type { EventType, SerializedEvent, WorkingGroup } from "@/types"
import { getEventTypeStyle, type EventTypeStyle } from "@/lib/event-type-config"
import {
  EMPTY_FILTERS,
  EVENT_FILTER_URL_KEYS,
  filterEvents,
  filtersFromSearchParams,
  filtersToSearchParams,
  type CalendarFilterState,
} from "@/lib/event-filters"
import { useUrlFilterState } from "@/hooks/useUrlFilterState"
import { InlineError } from "@/components/feedback/InlineError"
import { CalendarFilters } from "./CalendarFilters"
import { CalendarHeader, type ViewMode } from "./CalendarHeader"
import { EventDialog } from "./EventDialog"
import { FeaturedEvents } from "./FeaturedEvents"
import { ListView } from "./ListView"
import { MonthGrid } from "./MonthGrid"
import { classifyEventError } from "./event-error-classifier"
import { featuredForMonth, parseEvents } from "./utils"

type TransitionDir = "prev" | "next" | "fade"

const TRANSITION_CLASS: Record<TransitionDir, string> = {
  prev: "animate-in slide-in-from-left-4 fade-in duration-200",
  next: "animate-in slide-in-from-right-4 fade-in duration-200",
  fade: "animate-in fade-in duration-150",
}

/** Build a lookup that converts a given event into its render-ready style. */
const makeStyleLookup = (
  eventTypes: EventType[]
): ((event: SerializedEvent) => EventTypeStyle) => {
  const colorByValue = new Map<string, string | null>()

  for (const t of eventTypes) {
    if (t.value) colorByValue.set(t.value, t.color ?? null)
  }

  return (event) => {
    const color = event.eventType
      ? colorByValue.get(event.eventType)
      : undefined
    return getEventTypeStyle(color)
  }
}

interface EventCalendarProps {
  events: SerializedEvent[]
  eventTypes: EventType[]
  workingGroups: WorkingGroup[]
  error?: string | null
  /** Optional override for the initial visible month (defaults to today). */
  initialMonth?: string
  /**
   * Template for the Featured Events empty state.
   * Use `{month}` as a placeholder for the current month name.
   */
  noFeaturedEventsMessage?: string
}

export const EventCalendar = ({
  events,
  eventTypes,
  workingGroups,
  error,
  initialMonth,
  noFeaturedEventsMessage,
}: EventCalendarProps) => {
  const [viewMonth, setViewMonth] = useState<Date>(() =>
    initialMonth ? parseISO(initialMonth) : new Date()
  )
  const [view, setView] = useState<ViewMode>("month")
  const [selected, setSelected] = useState<SerializedEvent | null>(null)
  const [transition, setTransition] = useState<TransitionDir>("fade")

  const [filters, setFilters] = useUrlFilterState<CalendarFilterState>(
    EMPTY_FILTERS,
    filtersFromSearchParams,
    filtersToSearchParams,
    EVENT_FILTER_URL_KEYS
  )

  const styleFor = useMemo(() => makeStyleLookup(eventTypes), [eventTypes])

  const now = useMemo(() => new Date(), [])

  const filtered = useMemo(
    () => filterEvents(events, filters),
    [events, filters]
  )
  const parsed = useMemo(() => parseEvents(filtered), [filtered])

  // Featured events intersect the visible month. Not filtered by user filters.
  const featured = useMemo(
    () => featuredForMonth(events, viewMonth),
    [events, viewMonth]
  )

  const goPrev = useCallback(() => {
    setTransition("prev")
    setViewMonth((m) => subMonths(m, 1))
  }, [])

  const goNext = useCallback(() => {
    setTransition("next")
    setViewMonth((m) => addMonths(m, 1))
  }, [])

  const goToday = useCallback(() => {
    const today = new Date()
    setViewMonth((m) => {
      setTransition(today > m ? "next" : "prev")
      return today
    })
  }, [])

  const changeView = useCallback((v: ViewMode) => {
    setTransition("fade")
    setView(v)
  }, [])

  useEffect(() => {
    if (selected) return

    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          e.target.isContentEditable
        ) {
          return
        }
      }
      if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "ArrowRight") goNext()
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected, goPrev, goNext])

  if (error) {
    return <InlineError message={error} classify={classifyEventError} />
  }

  return (
    <div className="space-y-12">
      <div
        key={`featured-${viewMonth.toISOString()}`}
        className={TRANSITION_CLASS[transition]}
      >
        <FeaturedEvents
          events={featured}
          eventTypes={eventTypes}
          viewMonth={viewMonth}
          noEventsMessage={noFeaturedEventsMessage}
          onSelect={setSelected}
        />
      </div>

      <div className="space-y-4">
        <CalendarFilters
          events={events}
          eventTypes={eventTypes}
          workingGroups={workingGroups}
          value={filters}
          onChange={setFilters}
          filteredCount={filtered.length}
          totalCount={events.length}
        />

        <CalendarHeader
          viewMonth={viewMonth}
          onToday={goToday}
          onPrev={goPrev}
          onNext={goNext}
          view={view}
          onViewChange={changeView}
        />

        <div
          key={`grid-${viewMonth.toISOString()}-${view}`}
          className={TRANSITION_CLASS[transition]}
        >
          {view === "month" ? (
            <MonthGrid
              viewMonth={viewMonth}
              events={parsed}
              now={now}
              onSelect={setSelected}
              styleFor={styleFor}
            />
          ) : (
            <ListView
              events={parsed}
              viewMonth={viewMonth}
              now={now}
              onSelect={setSelected}
              styleFor={styleFor}
            />
          )}
        </div>
      </div>

      <EventDialog
        event={selected}
        eventTypes={eventTypes}
        workingGroups={workingGroups}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  )
}
