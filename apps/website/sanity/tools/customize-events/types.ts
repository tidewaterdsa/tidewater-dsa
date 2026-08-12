/**
 * Shape returned by the /api/google-calendar-events endpoint.
 * Trimmed down from the full GoogleCalendarEvent
 */
export interface GoogleCalendarEventRow {
  id: string
  title: string
  location: string | null
  startISO: string | null
  endISO: string | null
  isAllDay: boolean
  htmlLink: string
}

/** Customization doc joined onto a Google Calendar event row. */
export interface Customization {
  _id: string
  googleEventId: string
  featured?: boolean
  eventType?: string
}

/** Google Calendar event joined with its Sanity customization (if any). */
export interface EventWithCustomization extends GoogleCalendarEventRow {
  customization: Customization | null
}

export type StatusFilter = "all" | "uncustomized" | "customized"
export type TimeFilter = "upcoming" | "past" | "all"
