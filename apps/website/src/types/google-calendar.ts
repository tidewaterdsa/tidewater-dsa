/**
 * Google Calendar represents event boundaries as either a full-day date
 * (`date`) OR a timestamped datetime (`dateTime`), never both. 
 * This shape matches their JSON wire format exactly.
 */
export interface GoogleCalendarDateTime {
  dateTime?: string
  date?: string
  timeZone?: string
}

/**
 * A single event from the Google Calendar API. Matches their response shape, not our domain shape.
 * We translate to `SerializedEvent` at the boundary in `src/lib/events.ts`.
 *
 * Note: their field is `summary` but that's "event title" in their vocabulary.
 */
export interface GoogleCalendarEvent {
  id: string
  status: string
  htmlLink: string
  summary?: string
  description?: string
  location?: string
  start: GoogleCalendarDateTime
  end: GoogleCalendarDateTime
  recurringEventId?: string
}
