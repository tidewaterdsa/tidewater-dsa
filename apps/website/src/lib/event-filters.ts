import type { AttendanceType, SerializedEvent } from "@/types"

export interface CalendarFilterState {
  search: string
  /**
   * Selected event type slugs. Plain strings because the set of valid types is admin-defined in Sanity.
   * We can't validate against a static union here.
   * Unknown values from the URL are accepted but simply won't match any events.
   */
  eventTypes: string[]
  attendance: AttendanceType[]
  workingGroups: string[]
  topics: string[]
}

export const EMPTY_FILTERS: CalendarFilterState = {
  search: "",
  eventTypes: [],
  attendance: [],
  workingGroups: [],
  topics: [],
}

export const isFilterActive = (f: CalendarFilterState): boolean => {
  return (
    f.search.trim().length > 0 ||
    f.eventTypes.length > 0 ||
    f.attendance.length > 0 ||
    f.workingGroups.length > 0 ||
    f.topics.length > 0
  )
}

/**
 * Apply filters to an event list.
 *
 * - Search is a case-insensitive substring match across title, location, description
 * - Event type / attendance / working group: event must match one of the selected values
 * - Topics: event must have *at least one* of the selected topics (OR, not AND)
 * - An event without an eventType (no Sanity customization) is filtered *out* when any event-type filter is on, since it doesn't match any type
 */
export const filterEvents = (
  events: SerializedEvent[],
  filters: CalendarFilterState
): SerializedEvent[] => {
  const searchQuery = filters.search.trim().toLowerCase()

  return events.filter((e) => {
    if (searchQuery) {
      const searchText = [e.title, e.description, e.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      if (!searchText.includes(searchQuery)) return false
    }

    if (filters.eventTypes.length > 0) {
      if (!e.eventType || !filters.eventTypes.includes(e.eventType))
        return false
    }

    if (filters.attendance.length > 0) {
      if (!e.attendance || !filters.attendance.includes(e.attendance))
        return false
    }

    if (filters.workingGroups.length > 0) {
      if (!e.workingGroup || !filters.workingGroups.includes(e.workingGroup))
        return false
    }

    if (filters.topics.length > 0) {
      if (!e.topics.some((t) => filters.topics.includes(t))) return false
    }

    return true
  })
}

export const EVENT_FILTER_URL_KEYS = [
  "q",
  "type",
  "attend",
  "wg",
  "topic",
] as const

/**
 * URL sync.
 * Encoding the filter state in the query string makes filtered views shareable and the browser back button work as expected.
 */
export const filtersToSearchParams = (
  f: CalendarFilterState
): URLSearchParams => {
  const p = new URLSearchParams()
  if (f.search.trim()) p.set("q", f.search.trim())
  if (f.eventTypes.length) p.set("type", f.eventTypes.join(","))
  if (f.attendance.length) p.set("attend", f.attendance.join(","))
  if (f.workingGroups.length) p.set("wg", f.workingGroups.join(","))
  if (f.topics.length) p.set("topic", f.topics.join(","))
  return p
}

// Attendance is a fixed set (hardcoded in the customization schema), so validate it strictly
const VALID_ATTENDANCE = new Set<AttendanceType>([
  "in_person",
  "virtual",
  "hybrid",
])

export const filtersFromSearchParams = (
  p: URLSearchParams
): CalendarFilterState => {
  const parseList = (raw: string | null): string[] =>
    raw
      ? raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

  return {
    search: p.get("q") ?? "",
    eventTypes: parseList(p.get("type")),
    attendance: parseList(p.get("attend")).filter((v): v is AttendanceType =>
      VALID_ATTENDANCE.has(v as AttendanceType)
    ),
    workingGroups: parseList(p.get("wg")),
    topics: parseList(p.get("topic")),
  }
}

/** Extract unique, sorted working group and topic lists from a set of events. */
export const deriveFilterOptions = (
  events: SerializedEvent[]
): {
  workingGroups: string[]
  topics: string[]
} => {
  const workingGroupSet = new Set<string>()
  const topicSet = new Set<string>()
  for (const e of events) {
    if (e.workingGroup) workingGroupSet.add(e.workingGroup)
    for (const t of e.topics) topicSet.add(t)
  }
  return {
    workingGroups: [...workingGroupSet].sort((a, b) => a.localeCompare(b)),
    topics: [...topicSet].sort((a, b) => a.localeCompare(b)),
  }
}
