import { format } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "@tidewater-dsa/ui/components/button"
import { cn } from "@tidewater-dsa/ui/lib/utils"

export type ViewMode = "month" | "list"

interface CalendarHeaderProps {
  viewMonth: Date
  onToday: () => void
  onPrev: () => void
  onNext: () => void
  view: ViewMode
  onViewChange: (v: ViewMode) => void
}

export const CalendarHeader = ({
  viewMonth,
  onToday,
  onPrev,
  onNext,
  view,
  onViewChange,
}: CalendarHeaderProps) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center gap-1.5">
      <Button variant="editorial" onClick={onToday}>
        Today
      </Button>
      <Button
        variant="editorial"
        size="icon"
        onClick={onPrev}
        aria-label="Previous month"
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        variant="editorial"
        size="icon"
        onClick={onNext}
        aria-label="Next month"
      >
        <ChevronRightIcon />
      </Button>
    </div>

    <h3 className="heading-display flex-1 text-center text-xl leading-none tabular-nums">
      {format(viewMonth, "MMMM yyyy")}
    </h3>

    <div
      className="inline-flex items-stretch"
      role="group"
      aria-label="Calendar view"
    >
      {(["month", "list"] as const).map((mode, idx) => (
        <Button
          key={mode}
          variant="editorial"
          onClick={() => onViewChange(mode)}
          aria-pressed={view === mode}
          className={cn(
            idx === 0 ? "rounded-r-none" : "rounded-l-none",
            view === mode
              ? "bg-foreground text-background"
              : "bg-background text-foreground hover:bg-foreground/10 hover:text-foreground"
          )}
        >
          {mode}
        </Button>
      ))}
    </div>
  </div>
)
