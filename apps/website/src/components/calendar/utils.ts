import {
  endOfMonth,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns"
import { toZonedTime } from "date-fns-tz"
import { REGION_TIMEZONE } from "@/lib/region"

import type { SerializedEvent } from "@/types"

/**
 * Event shape with the ISO strings plus Dates shifted to the region's wall
 * clock, so `format` and day comparisons read correctly on both the UTC Worker
 * and the visitor's browser. Saves re-parsing on every render.
 *
 * These Dates are NOT the original instants — their epoch is offset on purpose.
 * Compare them only against other region-zoned Dates (see `isPast`, which takes
 * `now` from the caller), never against a raw `new Date()`.
 */
export interface ParsedEvent extends SerializedEvent {
  start: Date
  end: Date
}

/**
 * Instants are converted to the region's wall clock here, once, so every
 * downstream comparison and `format` call reads the right day and hour on both
 * the UTC Worker and the visitor's browser.
 */
export const parseEvents = (events: SerializedEvent[]): ParsedEvent[] =>
  events.map((e) => ({
    ...e,
    start: toZonedTime(parseISO(e.startISO), REGION_TIMEZONE),
    end: toZonedTime(parseISO(e.endISO), REGION_TIMEZONE),
  }))

/** Accounts for multi-day events. */
export const occursOnDay = (event: ParsedEvent, day: Date): boolean => {
  const dayStart = startOfDay(day)
  const dayEnd = startOfDay(new Date(dayStart.getTime() + 24 * 60 * 60 * 1000))
  return event.start < dayEnd && event.end >= dayStart
}

export const isPast = (event: ParsedEvent, now: Date): boolean =>
  event.end < now

/** Filter: featured events that intersect the visible month. */
export const featuredForMonth = (
  events: SerializedEvent[],
  viewMonth: Date
): SerializedEvent[] => {
  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  return events.filter((e) => {
    if (!e.featured) return false
    const start = toZonedTime(parseISO(e.startISO), REGION_TIMEZONE)
    const end = toZonedTime(parseISO(e.endISO), REGION_TIMEZONE)

    return start <= monthEnd && end >= monthStart
  })
}

export { isSameDay }
