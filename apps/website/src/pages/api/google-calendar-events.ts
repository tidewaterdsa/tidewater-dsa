import type { APIRoute } from "astro"
import { addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns"
import { fetchGoogleCalendarEvents } from "@/lib/google-calendar"
import { getMockEvents } from "@/lib/mocks/events"

const MAX_WINDOW_MONTHS = 24

const clampMonths = (raw: string | null, fallback: number): number => {
  if (!raw) return fallback

  const n = parseInt(raw, 10)
  if (Number.isNaN(n)) return fallback

  return Math.max(1, Math.min(MAX_WINDOW_MONTHS, n))
}

const mocksResponse = (timeMin: Date, timeMax: Date): Response => {
  const mocks = getMockEvents(timeMin, timeMax)
  const trimmed = mocks.map((e) => ({
    id: e.id,
    title: e.title,
    location: e.location,
    startISO: e.startISO,
    endISO: e.endISO,
    isAllDay: e.isAllDay,
    htmlLink: e.googleUrl,
  }))

  return new Response(JSON.stringify({ events: trimmed }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

export const GET: APIRoute = async ({ url, locals }) => {
  const runtimeEnv = locals.runtime?.env
  const calendarId =
    runtimeEnv?.GOOGLE_CALENDAR_ID ??
    (import.meta.env.GOOGLE_CALENDAR_ID as string | undefined)
  const apiKey =
    runtimeEnv?.GOOGLE_CALENDAR_API_KEY ??
    (import.meta.env.GOOGLE_CALENDAR_API_KEY as string | undefined)
  const useMockData =
    (runtimeEnv?.USE_MOCK_DATA ?? import.meta.env.USE_MOCK_DATA) === "true"

  const monthsBack = clampMonths(url.searchParams.get("monthsBack"), 3)
  const monthsForward = clampMonths(url.searchParams.get("monthsForward"), 12)

  const now = new Date()
  const timeMin = startOfMonth(subMonths(now, monthsBack))
  const timeMax = endOfMonth(addMonths(now, monthsForward))

  if (useMockData) {
    return mocksResponse(timeMin, timeMax)
  }

  // Dev fallback, same mock dataset the events page uses
  if (!calendarId || !apiKey) {
    if (import.meta.env.DEV) {
      return mocksResponse(timeMin, timeMax)
    }

    return new Response(
      JSON.stringify({
        error: "Google Calendar credentials not configured.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    const events = await fetchGoogleCalendarEvents({
      calendarId,
      apiKey,
      timeMin,
      timeMax,
    })

    // Strip to only the fields the event customization panel needs
    const trimmed = events.map((e) => ({
      id: e.id,
      title: e.summary ?? "Untitled event",
      location: e.location ?? null,
      startISO: e.start.dateTime ?? e.start.date ?? null,
      endISO: e.end.dateTime ?? e.end.date ?? null,
      isAllDay: Boolean(e.start.date && !e.start.dateTime),
      htmlLink: e.htmlLink,
    }))

    return new Response(JSON.stringify({ events: trimmed }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60",
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
