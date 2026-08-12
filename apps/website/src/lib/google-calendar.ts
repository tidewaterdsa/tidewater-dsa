import type { GoogleCalendarEvent } from "@/types"

const API_BASE = "https://www.googleapis.com/calendar/v3"

interface FetchOptions {
  calendarId: string
  apiKey: string
  timeMin: Date
  timeMax: Date
}

export const fetchGoogleCalendarEvents = async ({
  calendarId,
  apiKey,
  timeMin,
  timeMax,
}: FetchOptions): Promise<GoogleCalendarEvent[]> => {
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
