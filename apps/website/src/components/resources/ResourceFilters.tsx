import { SlidersHorizontalIcon, XIcon, DollarSignIcon } from "lucide-react"
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
import { SearchInput } from "@/components/filters/SearchInput"
import {
  CheckboxList,
  FilterSectionHeading,
} from "@/components/filters/CheckboxList"
import { toggleArrayValue } from "@/components/filters/utils"
import {
  getCategoryLabel,
  getCategoryTheme,
} from "@/lib/resource-category-config"
import {
  EMPTY_RESOURCE_FILTERS,
  isResourceFilterActive,
  type ResourceFilterState,
} from "@/lib/resource-filters"
import type { FilterOption } from "@/lib/resources"
import type { Resource } from "@/types"

interface FilterBodyProps {
  filters: ResourceFilterState
  setFilters: (next: ResourceFilterState) => void
  cities: FilterOption[]
  languages: FilterOption[]
}

const FilterBody = ({
  filters,
  setFilters,
  cities,
  languages,
}: FilterBodyProps) => (
  <div className="divide-y-2 divide-border">
    <div className="p-5">
      <FilterSectionHeading>City</FilterSectionHeading>
      <CheckboxList
        idPrefix="resource-city"
        items={cities}
        selected={filters.cities}
        onToggle={(v) =>
          setFilters({
            ...filters,
            cities: toggleArrayValue(filters.cities, v),
          })
        }
        emptyLabel="No cities found"
      />
    </div>

    <div className="p-5">
      <FilterSectionHeading>Languages</FilterSectionHeading>
      <CheckboxList
        idPrefix="resource-lang"
        items={languages}
        selected={filters.languages}
        onToggle={(v) =>
          setFilters({
            ...filters,
            languages: toggleArrayValue(filters.languages, v),
          })
        }
        emptyLabel="No languages found"
      />
    </div>
  </div>
)

interface ResourceFiltersProps {
  filters: ResourceFilterState
  setFilters: (next: ResourceFilterState) => void
  resources: Resource[]
  categoryCounts: { group: string; count: number }[]
  cities: FilterOption[]
  languages: FilterOption[]
  filteredCount: number
}

export const ResourceFilters = ({
  filters,
  setFilters,
  resources,
  categoryCounts,
  cities,
  languages,
  filteredCount,
}: ResourceFiltersProps) => {
  const active = isResourceFilterActive(filters)

  const toggleCategory = (group: string) =>
    setFilters({
      ...filters,
      categories: toggleArrayValue(filters.categories, group),
    })

  const toggleFree = () =>
    setFilters({ ...filters, freeOnly: !filters.freeOnly })

  const clearAll = () => setFilters(EMPTY_RESOURCE_FILTERS)

  const popoverBadgeCount = filters.cities.length + filters.languages.length

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SearchInput
          value={filters.search}
          onChange={(next) => setFilters({ ...filters, search: next })}
          placeholder="Search resources…"
          ariaLabel="Search community resources"
        />

        <Button
          variant="editorial"
          onClick={toggleFree}
          aria-pressed={filters.freeOnly}
          className={cn(
            "hover:border-foreground hover:bg-emerald-700",
            filters.freeOnly && "bg-emerald-600! text-white!"
          )}
        >
          <DollarSignIcon />
          <span className="-mb-0.5 max-[380px]:hidden">Free</span>
        </Button>

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
                filters={filters}
                setFilters={setFilters}
                cities={cities}
                languages={languages}
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
              className="flex h-[85vh] flex-col gap-0 rounded-none border-t-2 border-foreground bg-background p-0"
            >
              <SheetHeader className="border-b-2 border-foreground px-5 py-4">
                <SheetTitle className="heading-display text-xl">
                  Filters
                </SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <FilterBody
                  filters={filters}
                  setFilters={setFilters}
                  cities={cities}
                  languages={languages}
                />
              </div>
              {active && (
                <div className="border-t-2 border-foreground p-4">
                  <Button
                    variant="editorial"
                    size="lg"
                    className="w-full"
                    onClick={clearAll}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {categoryCounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoryCounts.map(({ group, count }) => {
            const theme = getCategoryTheme(group)
            const isActive = filters.categories.includes(group)

            return (
              <Button
                key={group}
                variant="editorial-chip"
                size="sm"
                className="text-xs"
                onClick={() => toggleCategory(group)}
                aria-pressed={isActive}
              >
                <span
                  className={cn("h-2 w-2 rounded-full", theme.accentClass)}
                  aria-hidden
                />
                {getCategoryLabel(group)}
                <span
                  className={cn(
                    "tabular-nums",
                    isActive ? "opacity-70" : "opacity-60"
                  )}
                >
                  {count}
                </span>
              </Button>
            )
          })}
        </div>
      )}

      {active && (
        <div className="ml-0.5 flex items-center justify-between">
          <p
            className="mono-eyebrow-sm text-foreground-soft"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {filteredCount === 0
              ? "No resources match your filters."
              : `Showing ${filteredCount} of ${resources.length} resources.`}
          </p>
          <Button
            variant="link"
            size="xs"
            onClick={clearAll}
            className="mono-eyebrow-sm text-link-soft gap-1"
          >
            <XIcon />
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
