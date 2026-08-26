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

/** Raw row from CUSTOMIZATIONS_QUERY. */
export interface CustomizationRow {
  _id: string
  googleEventId: string
  featured?: boolean
  eventType?: string
  attendance?: string
  topics?: string[]
  workingGroup?: string
  rsvpLink?: string
  summary?: string
}

/** Customization doc joined onto a Google Calendar event row. */
export interface Customization extends Omit<CustomizationRow, "_id"> {
  /** Open the editor with this - Studio resolves the draft from it. */
  publishedId: string
  /** What actually exists right now: `drafts.<id>` until published. Patch this one. */
  currentId: string
}

/** Google Calendar event joined with its Sanity customization (if any). */
export interface EventWithCustomization extends GoogleCalendarEventRow {
  customization: Customization | null
  /** A doc can exist without setting anything; that doesn't count as customized. */
  isCustomized: boolean
}

export type StatusFilter = "all" | "uncustomized" | "customized"
export type TimeFilter = "upcoming" | "past" | "all"
