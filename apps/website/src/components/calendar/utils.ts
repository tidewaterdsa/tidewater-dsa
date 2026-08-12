import { isSameDay, parseISO, startOfDay } from "date-fns"

import type { SerializedEvent } from "@/types"

/**
 * Event shape with parsed Date objects alongside the ISO strings.
 * Saves re-parsing on every render.
 */
export interface ParsedEvent extends SerializedEvent {
  start: Date
  end: Date
}

export const parseEvents = (events: SerializedEvent[]): ParsedEvent[] =>
  events.map((e) => ({
    ...e,
    start: parseISO(e.startISO),
    end: parseISO(e.endISO),
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
  const monthStart = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const monthEnd = new Date(
    viewMonth.getFullYear(),
    viewMonth.getMonth() + 1,
    0
  )
  return events.filter((e) => {
    if (!e.featured) return false
    const start = parseISO(e.startISO)
    const end = parseISO(e.endISO)

    return start <= monthEnd && end >= monthStart
  })
}

export { isSameDay }
