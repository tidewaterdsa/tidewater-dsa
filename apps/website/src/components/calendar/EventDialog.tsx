import { useMemo, useState, type ReactNode } from "react"
import { parseISO, isSameDay } from "date-fns"
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  ExternalLinkIcon,
  UsersIcon,
  TagIcon,
  WrenchIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tidewater-dsa/ui/components/dialog"
import { Button } from "@tidewater-dsa/ui/components/button"
import { Badge } from "@tidewater-dsa/ui/components/badge"
import type { EventType, SerializedEvent, WorkingGroup } from "@/types"
import { ATTENDANCE_LABEL } from "@/lib/event-constants"
import { formatEventDate, formatEventTime } from "@/lib/format"

interface InfoRowProps {
  icon: ReactNode
  children: ReactNode
}

const InfoRow = ({ icon, children }: InfoRowProps) => (
  <div className="flex items-start gap-3 text-foreground">
    <span className="mt-0.5 text-primary">{icon}</span>
    <div className="flex-1">{children}</div>
  </div>
)

interface EventDetailsProps {
  event: SerializedEvent
  eventTypes: EventType[]
  workingGroups: WorkingGroup[]
}

const EventDetails = ({
  event,
  eventTypes,
  workingGroups,
}: EventDetailsProps) => {
  const start = parseISO(event.startISO)
  const end = parseISO(event.endISO)
  const sameDay = isSameDay(start, end)

  const eventTypeLabel = useMemo(() => {
    if (!event.eventType) return null

    const match = eventTypes.find((t) => t.value === event.eventType)

    return match?.label ?? event.eventType
  }, [event.eventType, eventTypes])

  const workingGroupLabel = useMemo(() => {
    if (!event.workingGroup) return null

    const match = workingGroups.find((g) => g.value === event.workingGroup)

    return match?.label ?? event.workingGroup
  }, [event.workingGroup, workingGroups])

  const dateLine = event.isAllDay
    ? sameDay
      ? formatEventDate(event.startISO)
      : `${formatEventDate(event.startISO)} – ${formatEventDate(event.endISO)}`
    : formatEventDate(event.startISO)

  const timeLine = event.isAllDay
    ? "All day"
    : sameDay
      ? `${formatEventTime(event.startISO)} – ${formatEventTime(event.endISO)}`
      : `${formatEventDate(event.startISO)}, ${formatEventTime(event.startISO)} – ${formatEventDate(event.endISO)}, ${formatEventTime(event.endISO)}`

  const attendanceLabel = event.attendance
    ? ATTENDANCE_LABEL[event.attendance]
    : null

  return (
    <>
      <DialogHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {eventTypeLabel && (
            <Badge variant="editorial-accent">{eventTypeLabel}</Badge>
          )}
          {attendanceLabel && (
            <Badge variant="editorial">
              <UsersIcon className="size-3" />
              {attendanceLabel}
            </Badge>
          )}
          {workingGroupLabel && (
            <Badge variant="editorial">
              <WrenchIcon className="size-3" />
              {workingGroupLabel}
            </Badge>
          )}
        </div>
        <DialogTitle className="heading-display text-2xl">
          {event.title}
        </DialogTitle>
        {event.summary && (
          <DialogDescription className="text-base leading-relaxed text-foreground-soft">
            {event.summary}
          </DialogDescription>
        )}
      </DialogHeader>

      <div className="space-y-3 border-t-2 border-border pt-4 text-sm">
        <InfoRow icon={<CalendarDaysIcon className="size-4" />}>
          {dateLine}
        </InfoRow>
        <InfoRow icon={<ClockIcon className="size-4" />}>{timeLine}</InfoRow>
        {event.location && (
          <InfoRow icon={<MapPinIcon className="size-4" />}>
            {event.location}
          </InfoRow>
        )}
        {event.topics.length > 0 && (
          <InfoRow icon={<TagIcon className="size-4" />}>
            <div className="flex flex-wrap gap-1.5">
              {event.topics.map((t) => (
                <Badge key={t} variant="editorial">
                  {t}
                </Badge>
              ))}
            </div>
          </InfoRow>
        )}
      </div>

      {event.description && !event.summary && (
        <div className="max-h-56 overflow-y-auto border-l-2 border-primary bg-muted/40 px-4 py-3 text-sm leading-relaxed whitespace-pre-line text-foreground-soft">
          {event.description}
        </div>
      )}

      <DialogFooter className="flex-col gap-2 border-t-2 border-border pt-4 sm:flex-row sm:justify-between">
        <Button
          variant="editorial"
          nativeButton={false}
          render={
            <a
              href={event.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <ExternalLinkIcon />
          Open in Google Calendar
        </Button>
        {event.rsvpLink && (
          <Button
            variant="editorial-primary"
            nativeButton={false}
            render={
              <a
                href={event.rsvpLink}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLinkIcon />
            RSVP
          </Button>
        )}
      </DialogFooter>
    </>
  )
}

interface EventDialogProps {
  event: SerializedEvent | null
  eventTypes: EventType[]
  workingGroups: WorkingGroup[]
  onOpenChange: (open: boolean) => void
}

export const EventDialog = ({
  event,
  eventTypes,
  workingGroups,
  onOpenChange,
}: EventDialogProps) => {
  const [preservedEvent, setPreservedEvent] = useState<SerializedEvent | null>(
    event
  )

  if (event && event !== preservedEvent) {
    setPreservedEvent(event)
  }

  const current = event ?? preservedEvent
  const open = Boolean(event)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="editorial-panel w-[calc(100%-2rem)] gap-5 rounded-none p-6 shadow-none sm:w-full sm:max-w-lg sm:p-7">
        {current && (
          <EventDetails
            event={current}
            eventTypes={eventTypes}
            workingGroups={workingGroups}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
