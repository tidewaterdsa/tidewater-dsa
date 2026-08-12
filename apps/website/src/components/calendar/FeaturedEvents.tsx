import { format } from "date-fns"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselArrows,
} from "@tidewater-dsa/ui/components/carousel"
import type { EventType, SerializedEvent } from "@/types"
import { EventCard } from "@/components/events/EventCard"

const DEFAULT_EMPTY_MESSAGE =
  "No featured events in {month}. Use the arrows above the calendar to look ahead."

const renderMessage = (template: string, viewMonth: Date): string =>
  template.replace(/\{month\}/gi, format(viewMonth, "MMMM"))

interface FeaturedEventsProps {
  events: SerializedEvent[]
  eventTypes: EventType[]
  viewMonth: Date
  onSelect: (e: SerializedEvent) => void
  noEventsMessage?: string
}

export const FeaturedEvents = ({
  events,
  eventTypes,
  viewMonth,
  onSelect,
  noEventsMessage,
}: FeaturedEventsProps) => {
  const labelForType = (slug: string | null): string | null => {
    if (!slug) return null
    const match = eventTypes.find((t) => t.value === slug)
    return match?.label ?? slug
  }

  const emptyText = renderMessage(
    noEventsMessage?.trim() || DEFAULT_EMPTY_MESSAGE,
    viewMonth
  )

  return (
    <section aria-labelledby="featured-heading">
      <h2
        id="featured-heading"
        className="mono-eyebrow mb-5 flex items-center gap-2 text-primary"
      >
        <span aria-hidden="true">★</span>
        Featured events
      </h2>

      {events.length === 0 ? (
        <p className="border-l-2 border-border bg-background/40 px-4 py-6 text-sm text-foreground-soft">
          {emptyText}
        </p>
      ) : (
        <Carousel
          opts={{ align: "start", containScroll: "trimSnaps", dragFree: true }}
        >
          <CarouselContent className="-ml-4 items-stretch">
            {events.map((event) => (
              <CarouselItem
                key={event.id}
                className="pl-4 sm:basis-75 md:basis-80"
              >
                <EventCard
                  event={event}
                  eventTypeLabel={labelForType(event.eventType)}
                  onSelect={onSelect}
                  className="w-full"
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselArrows
            variant="editorial"
            size="icon"
            className="mt-5 justify-end"
          />
        </Carousel>
      )}
    </section>
  )
}
