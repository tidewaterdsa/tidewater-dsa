import { endOfMonth, startOfMonth } from "date-fns"
import type { GoogleCalendarEvent } from "@/types"

const API_BASE = "https://www.googleapis.com/calendar/v3"

/**
 * Cache TTL. Short enough that a newly added calendar event shows up almost
 * immediately, long enough to bound Google calls under any amount of traffic.
 */
const CACHE_TTL_SECONDS = 60

interface FetchOptions {
  calendarId: string
  apiKey: string
  timeMin: Date
  timeMax: Date
  /** Omit to bypass the cache (local dev without a KV binding). */
  cache?: KVNamespace
}

type RawFetchOptions = Omit<FetchOptions, "cache">

const fetchFromGoogle = async ({
  calendarId,
  apiKey,
  timeMin,
  timeMax,
}: RawFetchOptions): Promise<GoogleCalendarEvent[]> => {
  const url = new URL(
    `${API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`
  )
  url.searchParams.set("key", apiKey)
  url.searchParams.set("timeMin", timeMin.toISOString())
  url.searchParams.set("timeMax", timeMax.toISOString())
  // Expand recurring events into individual instances so the calendar grid renders each occurrence as its own row
  url.searchParams.set("singleEvents", "true")
  url.searchParams.set("orderBy", "startTime")
  url.searchParams.set("maxResults", "250")

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Google Calendar API ${res.status}: ${body.slice(0, 400)}`)
  }

  const data = (await res.json()) as { items?: GoogleCalendarEvent[] }
  return (data.items ?? []).filter((e) => e.status !== "cancelled")
}

/**
 * Fetch calendar events, served from KV when a recent copy is available.
 */
export const fetchGoogleCalendarEvents = async ({
  calendarId,
  apiKey,
  timeMin,
  timeMax,
  cache,
}: FetchOptions): Promise<GoogleCalendarEvent[]> => {
  const from = startOfMonth(timeMin)
  const to = endOfMonth(timeMax)

  if (!cache) {
    return fetchFromGoogle({ calendarId, apiKey, timeMin: from, timeMax: to })
  }

  const key = `gcal:v1:${calendarId}:${from.toISOString()}:${to.toISOString()}`

  const hit = await cache.get<GoogleCalendarEvent[]>(key, "json")
  if (hit) return hit

  const events = await fetchFromGoogle({
    calendarId,
    apiKey,
    timeMin: from,
    timeMax: to,
  })

  await cache.put(key, JSON.stringify(events), {
    expirationTtl: CACHE_TTL_SECONDS,
  })

  return events
}
