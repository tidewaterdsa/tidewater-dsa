import {
  endOfMonth,
  format,
  isToday,
  isWithinInterval,
  parseISO,
  startOfMonth,
} from "date-fns"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import type { SerializedEvent } from "@/types"
import type { EventTypeStyle } from "@/lib/event-type-config"
import { isPast, type ParsedEvent } from "./utils"

interface ListViewProps {
  events: ParsedEvent[]
  viewMonth: Date
  now: Date
  onSelect: (e: SerializedEvent) => void
  styleFor: (e: SerializedEvent) => EventTypeStyle
}

export const ListView = ({
  events,
  viewMonth,
  now,
  onSelect,
  styleFor,
}: ListViewProps) => {
  const start = startOfMonth(viewMonth)
  const end = endOfMonth(viewMonth)

  const visible = events
    .filter(
      (e) =>
        isWithinInterval(e.start, { start, end }) ||
        isWithinInterval(e.end, { start, end }) ||
        (e.start < start && e.end > end)
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  if (visible.length === 0) {
    return (
      <div className="editorial-panel px-6 py-16 text-center text-sm text-foreground-soft">
        No events in {format(viewMonth, "MMMM yyyy")}.
      </div>
    )
  }

  const groups = new Map<string, ParsedEvent[]>()
  for (const e of visible) {
    const key = format(e.start, "yyyy-MM-dd")
    const existing = groups.get(key) ?? []
    existing.push(e)
    groups.set(key, existing)
  }

  return (
    <div className="editorial-panel divide-y-2 divide-border">
      {Array.from(groups.entries()).map(([key, pe]) => {
        const day = parseISO(key)
        const today = isToday(day)

        return (
          <div key={key} className="flex gap-5 px-5 py-5 sm:px-7">
            <div className="w-16 shrink-0 text-left">
              <div className="mono-eyebrow text-foreground-soft">
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "heading-display text-4xl leading-none tabular-nums",
                  today && "text-primary"
                )}
              >
                {format(day, "d")}
              </div>
            </div>

            <ul className="flex-1 space-y-2">
              {pe.map((e) => {
                const style = styleFor(e)
                const past = isPast(e, now)

                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(e)}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-3 rounded-sm px-3 py-2.5 text-left text-sm font-medium text-white transition-opacity",
                        style.dot,
                        past && "opacity-60"
                      )}
                    >
                      <span className="mono-eyebrow-sm w-16 shrink-0 text-white/85 tabular-nums">
                        {e.isAllDay ? "all day" : format(e.start, "h:mm a")}
                      </span>
                      <span className="flex-1">
                        <span
                          className={cn(
                            "block leading-tight",
                            past && "line-through decoration-current/60"
                          )}
                        >
                          {e.title}
                        </span>
                        {e.location && (
                          <span className="mono-eyebrow-sm mt-1 block text-white/75">
                            {e.location}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
