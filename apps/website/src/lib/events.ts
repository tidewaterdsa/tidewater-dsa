/**
 * Unified events fetcher: pulls from Google Calendar (source of truth for event data)
 * and Sanity (source of truth for editorial metadata), then joins them on Google event ID.
 *
 * Events without a Sanity customization still render on the calendar;
 * they just use Google Calendar data and get no special styling or featured status.
 *
 * In dev without credentials, returns the same mock dataset used across the app.
 * Admins can walk through everything without needing real API keys.
 * Production throws on missing credentials; better a loud failure than silently serving fakes.
 */

import { sanityClient } from "sanity:client"
import { EVENT_CUSTOMIZATIONS_QUERY } from "@/sanity/queries"
import type { EVENT_CUSTOMIZATIONS_QUERY_RESULT } from "@/sanity/types"
import type {
  AttendanceType,
  EventCustomization,
  GetEventsOptions,
  GoogleCalendarEvent,
  SerializedEvent,
} from "@/types"
import { findActionNetworkUrl } from "./action-network"
import { fetchGoogleCalendarEvents } from "./google-calendar"
import { getMockEvents } from "./mocks/events"

interface EventsEnv {
  GOOGLE_CALENDAR_ID?: string
  GOOGLE_CALENDAR_API_KEY?: string
  USE_MOCK_DATA?: string
}

export const getEvents = async (
  { rangeStart, rangeEnd }: GetEventsOptions,
  runtimeEnv?: EventsEnv
): Promise<SerializedEvent[]> => {
  const useMockData =
    (runtimeEnv?.USE_MOCK_DATA ?? import.meta.env.USE_MOCK_DATA) === "true"

  // Demo / preview mode: return mocks unconditionally.
  // Set USE_MOCK_DATA=true in the deployment environment to show a populated site without real API credentials.
  if (useMockData) {
    return getMockEvents(rangeStart, rangeEnd)
  }

  const calendarId =
    runtimeEnv?.GOOGLE_CALENDAR_ID ??
    (import.meta.env.GOOGLE_CALENDAR_ID as string | undefined)
  const apiKey =
    runtimeEnv?.GOOGLE_CALENDAR_API_KEY ??
    (import.meta.env.GOOGLE_CALENDAR_API_KEY as string | undefined)

  if (!calendarId || !apiKey) {
    if (import.meta.env.DEV) {
      console.warn(
        "[events] GOOGLE_CALENDAR_ID or GOOGLE_CALENDAR_API_KEY not set — using mock data (dev only)."
      )
      return getMockEvents(rangeStart, rangeEnd)
    }
    throw new Error(
      "GOOGLE_CALENDAR_ID and GOOGLE_CALENDAR_API_KEY must be set in production."
    )
  }

  const [googleEvents, customizations] = await Promise.all([
    fetchGoogleCalendarEvents({
      calendarId,
      apiKey,
      timeMin: rangeStart,
      timeMax: rangeEnd,
    }),
    // Overlays aren't part of visual editing, so disabling stega keeps
    // URLs clean for href use and enum values comparable as plain strings
    sanityClient.fetch<EVENT_CUSTOMIZATIONS_QUERY_RESULT>(
      EVENT_CUSTOMIZATIONS_QUERY,
      {},
      { stega: false }
    ),
  ])

  const customizationById = new Map<string, EventCustomization>()
  for (const c of customizations ?? []) {
    if (c.googleEventId) customizationById.set(c.googleEventId, c)
  }

  return googleEvents
    .map((g) => merge(g, customizationById.get(g.id)))
    .sort((a, b) => a.startISO.localeCompare(b.startISO))
}

const merge = (
  g: GoogleCalendarEvent,
  customization: EventCustomization | undefined
): SerializedEvent => {
  const isAllDay = Boolean(g.start.date && !g.start.dateTime)
  const startISO = (g.start.dateTime ?? g.start.date) as string
  const endISO = (g.end.dateTime ?? g.end.date) as string

  const extractedActionNetworkUrl = findActionNetworkUrl(
    g.description,
    g.location
  )
  const rsvpLink = customization?.rsvpLink ?? extractedActionNetworkUrl ?? null

  return {
    id: g.id,
    title: g.summary ?? "Untitled event",
    description: g.description ?? null,
    location: g.location ?? null,
    startISO,
    endISO,
    isAllDay,
    googleUrl: g.htmlLink,
    featured: customization?.featured ?? false,
    eventType: customization?.eventType ?? null,
    attendance:
      (customization?.attendance as AttendanceType | undefined) ?? null,
    topics: customization?.topics ?? [],
    workingGroup: customization?.workingGroup ?? null,
    rsvpLink,
    summary: customization?.summary ?? null,
  }
}
