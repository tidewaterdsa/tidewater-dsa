import type {
  EVENT_TYPES_QUERY_RESULT,
  WORKING_GROUPS_QUERY_RESULT,
} from "@/sanity/types"

/** Event type slug. Plain string because the actual set of types is admin-defined in the Sanity event types taxonomy. */
export type EventTypeTag = string

export type AttendanceType = "in_person" | "virtual" | "hybrid"

/**
 * Shape of an event as passed from the server to the client.
 *
 * This is the merged result: Google Calendar data (title, time, location)
 * joined with the Sanity customization document for editorial fields (featured flag, event type, RSVP override).
 * Dates are ISO strings so the shape serializes cleanly across the Astro server/client boundary.
 */
export interface SerializedEvent {
  id: string
  title: string
  description: string | null
  location: string | null
  startISO: string
  endISO: string
  isAllDay: boolean
  googleUrl: string
  featured: boolean
  eventType: EventTypeTag | null
  attendance: AttendanceType | null
  topics: string[]
  workingGroup: string | null
  rsvpLink: string | null
  summary: string | null
}

export interface GetEventsOptions {
  rangeStart: Date
  rangeEnd: Date
}

export type EventType = NonNullable<EVENT_TYPES_QUERY_RESULT>[number]

export type WorkingGroup = NonNullable<WORKING_GROUPS_QUERY_RESULT>[number]
