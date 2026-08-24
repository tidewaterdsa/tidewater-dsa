import { differenceInDays, format, parse, parseISO } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { REGION_TIMEZONE } from "./region"

/** Format an instant in the chapter's timezone, so SSR and the browser agree. */
const fmt = (iso: string, pattern: string): string =>
  formatInTimeZone(parseISO(iso), REGION_TIMEZONE, pattern)

/**
 * "Tue, Apr 22" when the event is in the current year.
 * "Tue, Apr 22, 2027" when it's in a different year (to avoid ambiguity).
 */
export const formatEventDate = (iso: string): string => {
  const sameYear =
    fmt(iso, "yyyy") === formatInTimeZone(new Date(), REGION_TIMEZONE, "yyyy")
  return fmt(iso, sameYear ? "EEE, MMM d" : "EEE, MMM d, yyyy")
}

/** "7:00 PM" — 12-hour format, uppercase AM/PM. */
export const formatEventTime = (iso: string): string => {
  return fmt(iso, "h:mm a")
}

/**
 * Combined "Tue, Apr 22 @ 7:00 PM" or "Tue, Apr 22 — all day" depending on whether the event is all-day. */
export const formatEventDateTime = (iso: string, isAllDay: boolean): string => {
  const datePart = formatEventDate(iso)
  if (isAllDay) return `${datePart} — all day`
  return `${datePart} @ ${formatEventTime(iso)}`
}

/**
 * Short form used in tight spaces (event pills, compact row meta):
 * "Tue, Apr 22 · 7:00 PM" or "Tue, Apr 22 · all day"
 */
export const formatEventMeta = (iso: string, isAllDay: boolean): string => {
  const datePart = formatEventDate(iso)
  if (isAllDay) return `${datePart} · all day`
  return `${datePart} · ${formatEventTime(iso)}`
}

/** Date-stamp pieces for an editorial event card. */
export interface EventCardDate {
  day: string
  monthYear: string
  weekday: string
}

export const splitEventDate = (iso: string): EventCardDate => {
  return {
    day: fmt(iso, "d"),
    monthYear: fmt(iso, "MMM yyyy").toUpperCase(),
    weekday: fmt(iso, "EEE").toUpperCase(),
  }
}

/** Meta-line pieces for an editorial event card. */
export interface EventCardMeta {
  timeLine: string
  location: string | null
}

/** Build the meta-line pieces for an editorial event card. */
export const formatEventCardMeta = (
  iso: string,
  isAllDay: boolean,
  location: string | null
): EventCardMeta => {
  const weekday = fmt(iso, "EEE").toUpperCase()
  const time = isAllDay
    ? "All day"
    : fmt(iso, "h:mm a").toLowerCase().replace(":00", "")
  return {
    timeLine: `${weekday} · ${time}`,
    location: location || null,
  }
}

/**
 * Parse a US-format date string (M/D/YYYY) from the Google Sheet into an ISO date string (YYYY-MM-DD).
 * Returns null for empty input or unparseable values.
 * Used during sheet parsing.
 */
export const parseUsDateToISO = (raw: string): string | null => {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  const parsed = parse(trimmed, "M/d/yyyy", new Date())
  if (Number.isNaN(parsed.getTime())) return null
  // Reject sentinel dates (form defaults from before 2020).
  if (parsed.getFullYear() < 2020) return null
  return format(parsed, "yyyy-MM-dd")
}

// formatVerifiedDate / formatVerifiedDateLong / parseUsDateToISO take date-only
// strings (YYYY-MM-DD). parseISO gives them local midnight and `format` reads
// local fields, so they round-trip on any runtime. Converting them to a zone
// would shift them into the previous day.
export const formatVerifiedDate = (iso: string): string =>
  format(parseISO(iso), "MMM yyyy")

export const formatVerifiedDateLong = (iso: string): string =>
  format(parseISO(iso), "MMMM d, yyyy")

export const formatRefreshedAt = (iso: string): string =>
  fmt(iso, "MMM d, yyyy, h:mm a")

/**
 * Default freshness window for the verification badge.
 * Verification dates older than this are considered stale and the badge is hidden,
 * since a "verified" claim from over six months ago no longer means much for a
 * directory of mutual-aid contacts whose hours and addresses change.
 */
export const VERIFICATION_FRESHNESS_DAYS = 180

export const isVerificationFresh = (
  iso: string,
  freshnessDays: number = VERIFICATION_FRESHNESS_DAYS
): boolean => {
  const verified = parseISO(iso)
  if (Number.isNaN(verified.getTime())) return false
  return differenceInDays(new Date(), verified) <= freshnessDays
}
