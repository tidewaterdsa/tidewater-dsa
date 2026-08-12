import { MapPinIcon, MonitorIcon } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@tidewater-dsa/ui/components/card"
import { Badge } from "@tidewater-dsa/ui/components/badge"
import type { SerializedEvent } from "@/types"
import { splitEventDate, formatEventCardMeta } from "@/lib/format"
import { cn } from "@tidewater-dsa/ui/lib/utils"

export const isVirtualEvent = (event: SerializedEvent): boolean =>
  event.attendance === "virtual" || event.attendance === "hybrid"

export interface EventCardProps {
  event: SerializedEvent
  eventTypeLabel: string | null
  onSelect: (e: SerializedEvent) => void
  className?: string
}

export const EventCard = ({
  event,
  eventTypeLabel,
  onSelect,
  className,
}: EventCardProps) => {
  const { day, monthYear } = splitEventDate(event.startISO)
  const { timeLine, location } = formatEventCardMeta(
    event.startISO,
    event.isAllDay,
    event.location
  )
  const isVirtual = isVirtualEvent(event)

  return (
    <Card
      variant="editorial"
      className={cn("h-full gap-3", className)}
      render={
        <button
          type="button"
          onClick={() => onSelect(event)}
          aria-label={`View details for ${event.title}`}
        />
      }
    >
      <CardHeader className="gap-3 text-left">
        {eventTypeLabel && (
          <Badge
            variant="editorial-accent"
            className="w-fit transition-colors group-hover/card:border-white group-hover/card:bg-primary group-hover/card:text-white"
          >
            {eventTypeLabel}
          </Badge>
        )}

        <div className="flex items-baseline gap-2.5 font-heading text-4xl leading-none font-extrabold text-primary">
          {day}
          <span className="mono-eyebrow-sm text-foreground-soft transition-colors group-hover/card:text-white/70">
            {monthYear}
          </span>
        </div>

        <CardTitle className="heading-display text-xl">{event.title}</CardTitle>
      </CardHeader>

      <CardContent className="mono-eyebrow-sm mt-auto text-left text-foreground-soft transition-colors group-hover/card:text-white/75">
        <span>{timeLine}</span>
        {location && (
          <>
            <br />
            <span className="mt-1 inline-flex items-center gap-1.5 tracking-normal normal-case">
              {isVirtual ? (
                <MonitorIcon className="size-3 shrink-0" />
              ) : (
                <MapPinIcon className="size-3 shrink-0" />
              )}
              {location}
            </span>
          </>
        )}
      </CardContent>
    </Card>
  )
}
