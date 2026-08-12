import { Box, Button, Flex, Stack, TextInput } from "@sanity/ui"
import { CloseIcon, SearchIcon } from "@sanity/icons"
import { FilterDropdown } from "./FilterDropdown"
import type { StatusFilter, TimeFilter } from "./types"

interface FacetCounts {
  /** Total events across all status/time buckets (unfiltered). */
  total: number
  /** Events matching the current time+search filter, split by status. */
  byStatus: Record<StatusFilter, number>
  /** Events matching the current status+search filter, split by time. */
  byTime: Record<TimeFilter, number>
}

interface ToolbarProps {
  search: string
  onSearch: (s: string) => void
  statusFilter: StatusFilter
  onStatusChange: (s: StatusFilter) => void
  timeFilter: TimeFilter
  onTimeChange: (t: TimeFilter) => void
  counts: FacetCounts
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export const Toolbar = ({
  search,
  onSearch,
  statusFilter,
  onStatusChange,
  timeFilter,
  onTimeChange,
  counts,
  hasActiveFilters,
  onResetFilters,
}: ToolbarProps) => (
  <Stack space={2}>
    <Flex gap={2} align="center" wrap="wrap">
      <Box flex={1} style={{ minWidth: 240 }}>
        <TextInput
          icon={SearchIcon}
          placeholder="Search title or location…"
          value={search}
          onChange={(e) => onSearch(e.currentTarget.value)}
          clearButton={search.length > 0}
          onClear={() => onSearch("")}
        />
      </Box>
      <FilterDropdown
        label="Status"
        value={statusFilter}
        options={[
          { value: "all", label: `All (${counts.byStatus.all})` },
          {
            value: "uncustomized",
            label: `Not customized (${counts.byStatus.uncustomized})`,
          },
          {
            value: "customized",
            label: `Customized (${counts.byStatus.customized})`,
          },
        ]}
        onChange={(v) => onStatusChange(v as StatusFilter)}
      />
      <FilterDropdown
        label="Time"
        value={timeFilter}
        options={[
          { value: "upcoming", label: `Upcoming (${counts.byTime.upcoming})` },
          { value: "past", label: `Past (${counts.byTime.past})` },
          { value: "all", label: `All (${counts.byTime.all})` },
        ]}
        onChange={(v) => onTimeChange(v as TimeFilter)}
      />
      {hasActiveFilters && (
        <Button
          mode="ghost"
          icon={CloseIcon}
          text="Reset"
          onClick={onResetFilters}
          title="Reset filters to defaults"
        />
      )}
    </Flex>
  </Stack>
)
