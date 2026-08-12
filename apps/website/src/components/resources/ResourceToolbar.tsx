import {
  PrinterIcon,
  DownloadIcon,
  Grid3x3Icon,
  MapIcon,
  ChevronUpIcon,
  FileSpreadsheetIcon,
} from "lucide-react"
import { Button } from "@tidewater-dsa/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@tidewater-dsa/ui/components/dropdown-menu"
import { cn } from "@tidewater-dsa/ui/lib/utils"

export type ResourceView = "directory" | "map"

interface ResourceToolbarProps {
  view: ResourceView
  onViewChange: (next: ResourceView) => void
  allExpanded: boolean
  onToggleExpandAll: () => void
  /** Only relevant in directory view + when there's more than one category. */
  canToggleExpand: boolean
  onPrint: () => void
  onDownloadCsv: () => void
}

export const ResourceToolbar = ({
  view,
  onViewChange,
  allExpanded,
  onToggleExpandAll,
  canToggleExpand,
  onPrint,
  onDownloadCsv,
}: ResourceToolbarProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div
      className="inline-flex items-stretch"
      role="group"
      aria-label="Resource view"
    >
      {(["directory", "map"] as const).map((mode, idx) => (
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
          {mode === "directory" ? <Grid3x3Icon /> : <MapIcon />}
          {mode}
        </Button>
      ))}
    </div>

    <div className="flex flex-wrap items-center gap-2">
      {canToggleExpand && (
        <Button
          variant="link"
          size="sm"
          onClick={onToggleExpandAll}
          className="mono-eyebrow-sm text-foreground-soft hover:text-foreground"
        >
          <ChevronUpIcon
            className={cn("transition-transform", allExpanded && "rotate-180")}
          />
          {allExpanded ? "Collapse all" : "Expand all"}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="editorial">
              <DownloadIcon />
              Download
            </Button>
          }
        />
        <DropdownMenuContent
          align="end"
          className="editorial-panel rounded-none p-0 shadow-none"
        >
          <DropdownMenuItem
            onClick={onPrint}
            className="mono-eyebrow-sm cursor-pointer gap-2 rounded-none px-3 py-2 text-foreground hover:bg-foreground/10 focus:bg-foreground/10"
          >
            <PrinterIcon className="size-3.5" /> Print / Save as PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDownloadCsv}
            className="mono-eyebrow-sm cursor-pointer gap-2 rounded-none border-t border-border px-3 py-2 text-foreground hover:bg-foreground/10 focus:bg-foreground/10"
          >
            <FileSpreadsheetIcon className="size-3.5" /> Download CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
)
