import { useMemo } from "react"
import { SlidersHorizontalIcon } from "lucide-react"
import { Button } from "@tidewater-dsa/ui/components/button"
import { Badge } from "@tidewater-dsa/ui/components/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tidewater-dsa/ui/components/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@tidewater-dsa/ui/components/sheet"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import type { EventType, SerializedEvent, WorkingGroup } from "@/types"
import { getEventTypeStyle } from "@/lib/event-type-config"
import { ATTENDANCE_OPTIONS } from "@/lib/event-constants"
import {
  EMPTY_FILTERS,
  deriveFilterOptions,
  isFilterActive,
  type CalendarFilterState,
} from "@/lib/event-filters"
import { SearchInput } from "@/components/filters/SearchInput"
import {
  CheckboxList,
  FilterSectionHeading,
} from "@/components/filters/CheckboxList"
import { toggleArrayValue } from "@/components/filters/utils"

interface CalendarFiltersProps {
  events: SerializedEvent[]
  eventTypes: EventType[]
  workingGroups: WorkingGroup[]
  value: CalendarFilterState
  onChange: (next: CalendarFilterState) => void
  filteredCount: number
  totalCount: number
}

interface FilterBodyProps {
  value: CalendarFilterState
  onChange: (next: CalendarFilterState) => void
  workingGroupSlugs: string[]
  workingGroupLabelFor: (slug: string) => string
  topics: string[]
}

const FilterBody = ({
  value,
  onChange,
  workingGroupSlugs,
  workingGroupLabelFor,
  topics,
}: FilterBodyProps) => {
  const attendanceLabelFor = (v: string) =>
    ATTENDANCE_OPTIONS.find((o) => o.value === v)?.label ?? v

  return (
    <div className="divide-y-2 divide-border">
      <div className="p-5">
        <FilterSectionHeading>Attendance</FilterSectionHeading>
        <CheckboxList
          idPrefix="event-attendance"
          items={ATTENDANCE_OPTIONS.map((o) => ({
            value: o.value,
            renderLabel: attendanceLabelFor,
          }))}
          selected={value.attendance}
          onToggle={(v) =>
            onChange({
              ...value,
              attendance: toggleArrayValue(
                value.attendance,
                v as (typeof ATTENDANCE_OPTIONS)[number]["value"]
              ),
            })
          }
          emptyLabel="No attendance types"
        />
      </div>

      {workingGroupSlugs.length > 0 && (
        <div className="p-5">
          <FilterSectionHeading>Working Group</FilterSectionHeading>
          <CheckboxList
            idPrefix="event-wg"
            items={workingGroupSlugs.map((v) => ({
              value: v,
              renderLabel: workingGroupLabelFor,
            }))}
            selected={value.workingGroups}
            onToggle={(v) =>
              onChange({
                ...value,
                workingGroups: toggleArrayValue(value.workingGroups, v),
              })
            }
            emptyLabel="No working groups yet"
          />
        </div>
      )}

      {topics.length > 0 && (
        <div className="p-5">
          <FilterSectionHeading>Topics</FilterSectionHeading>
          <CheckboxList
            idPrefix="event-topic"
            items={topics}
            selected={value.topics}
            onToggle={(v) =>
              onChange({
                ...value,
                topics: toggleArrayValue(value.topics, v),
              })
            }
            emptyLabel="No topics yet"
          />
        </div>
      )}
    </div>
  )
}

export const CalendarFilters = ({
  events,
  eventTypes,
  workingGroups,
  value,
  onChange,
  filteredCount,
  totalCount,
}: CalendarFiltersProps) => {
  const { workingGroups: eventWorkingGroups, topics } = useMemo(
    () => deriveFilterOptions(events),
    [events]
  )

  const workingGroupLabelFor = useMemo(() => {
    const labelBySlug = new Map<string, string>()

    for (const g of workingGroups) {
      if (g.value && g.label) labelBySlug.set(g.value, g.label)
    }

    return (slug: string) => labelBySlug.get(slug) ?? slug
  }, [workingGroups])

  const active = isFilterActive(value)

  const toggleEventType = (t: string) =>
    onChange({ ...value, eventTypes: toggleArrayValue(value.eventTypes, t) })

  const clearAll = () => onChange(EMPTY_FILTERS)

  const popoverBadgeCount =
    value.attendance.length + value.workingGroups.length + value.topics.length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SearchInput
          value={value.search}
          onChange={(next) => onChange({ ...value, search: next })}
          placeholder="Search events..."
          ariaLabel="Search events"
        />

        <div className="hidden sm:block">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="editorial"
                  className="text-xs"
                  aria-pressed={popoverBadgeCount > 0}
                  aria-label={
                    popoverBadgeCount > 0
                      ? `Filters (${popoverBadgeCount} active)`
                      : "Filters"
                  }
                >
                  <SlidersHorizontalIcon className="size-3.5" />
                  Filters
                  {popoverBadgeCount > 0 && (
                    <Badge
                      variant="editorial-accent"
                      className="h-4 min-w-4 px-1"
                    >
                      {popoverBadgeCount}
                    </Badge>
                  )}
                </Button>
              }
            />
            <PopoverContent
              align="end"
              className="editorial-panel max-h-[70vh] w-80 overflow-y-auto rounded-none p-0"
            >
              <FilterBody
                value={value}
                onChange={onChange}
                workingGroupSlugs={eventWorkingGroups}
                workingGroupLabelFor={workingGroupLabelFor}
                topics={topics}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="editorial"
                  aria-pressed={popoverBadgeCount > 0}
                  aria-label={
                    popoverBadgeCount > 0
                      ? `Filters (${popoverBadgeCount} active)`
                      : "Filters"
                  }
                >
                  <SlidersHorizontalIcon />
                  <span className="sr-only sm:not-sr-only">Filters</span>
                  {popoverBadgeCount > 0 && (
                    <Badge
                      variant="editorial-accent"
                      className="h-4 min-w-4 px-1"
                    >
                      {popoverBadgeCount}
                    </Badge>
                  )}
                </Button>
              }
            />
            <SheetContent
              side="bottom"
              className="flex h-[85vh] flex-col rounded-none border-t-2 border-foreground bg-background p-0"
            >
              <SheetHeader className="border-b-2 border-foreground px-5 py-4">
                <SheetTitle className="heading-display text-xl">
                  Filters
                </SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <FilterBody
                  value={value}
                  onChange={onChange}
                  workingGroupSlugs={eventWorkingGroups}
                  workingGroupLabelFor={workingGroupLabelFor}
                  topics={topics}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {eventTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {eventTypes
            .filter((t): t is typeof t & { label: string; value: string } =>
              Boolean(t.label && t.value)
            )
            .map((type) => {
              const isActive = value.eventTypes.includes(type.value)
              const style = getEventTypeStyle(type.color)
              return (
                <Button
                  key={type.value}
                  variant="editorial-chip"
                  size="sm"
                  className="text-xs"
                  onClick={() => toggleEventType(type.value)}
                  aria-pressed={isActive}
                >
                  <span
                    className={cn("h-2 w-2 rounded-full", style.dot)}
                    aria-hidden
                  />
                  {type.label}
                </Button>
              )
            })}
        </div>
      )}

      {active && (
        <div className="ml-0.5 flex items-center justify-between">
          <p
            className="mono-eyebrow text-foreground-soft"
            role="status"
            aria-live="polite"
          >
            {filteredCount === 0
              ? "No events match your filters"
              : `Showing ${filteredCount} of ${totalCount} events.`}
          </p>
          <Button
            variant="link"
            size="xs"
            onClick={clearAll}
            className="mono-eyebrow-sm text-link-soft"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
