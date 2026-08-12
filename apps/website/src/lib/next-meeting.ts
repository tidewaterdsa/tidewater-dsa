import { addDays } from "date-fns"
import { getEvents } from "./events"
import { formatEventMeta } from "./format"
import type { SerializedEvent } from "@/types"
import { stegaClean } from "@sanity/client/stega"

/** Look-ahead window for the ribbon's "next meeting" lookup. */
const RIBBON_WINDOW_DAYS = 60

interface NextMeetingEnv {
  GOOGLE_CALENDAR_ID?: string
  GOOGLE_CALENDAR_API_KEY?: string
  USE_MOCK_DATA?: string
}

export interface RibbonMeeting {
  text: string
  href: string
  event: SerializedEvent
}

const normalize = (s: string | null | undefined): string =>
  s ? stegaClean(s).toLowerCase().trim() : ""

export const getNextMeeting = async (
  {
    match,
    label,
  }: {
    /** Free-text substring matched against an event's rsvpLink, eventType, and title (all normalized to lowercase, stega-stripped). */
    match: string
    label: string
  },
  runtimeEnv?: NextMeetingEnv
): Promise<RibbonMeeting | null> => {
  const searchTerm = normalize(match)
  if (!searchTerm) return null

  const now = new Date()
  const rangeEnd = addDays(now, RIBBON_WINDOW_DAYS)

  let events: SerializedEvent[] = []
  try {
    events = await getEvents({ rangeStart: now, rangeEnd }, runtimeEnv)
  } catch (err) {
    console.error("[next-meeting] Failed to fetch events:", err)
    return null
  }

  const meeting = events
    .filter((e) => new Date(e.endISO) >= now)
    .filter((e) => {
      const searchTargets = [e.rsvpLink, e.eventType, e.title]
      return searchTargets.some((t) => normalize(t).includes(searchTerm))
    })
    .sort((a, b) => a.startISO.localeCompare(b.startISO))[0]

  if (!meeting) return null

  return {
    text: `${label} · ${formatEventMeta(meeting.startISO, meeting.isAllDay)}`,
    href: meeting.rsvpLink || "/events",
    event: meeting,
  }
}
