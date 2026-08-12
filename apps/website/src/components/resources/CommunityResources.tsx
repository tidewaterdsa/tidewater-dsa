import { useCallback, useMemo, useRef, useState } from "react"
import { Button } from "@tidewater-dsa/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@tidewater-dsa/ui/components/card"
import { useUrlFilterState } from "@/hooks/useUrlFilterState"
import {
  collectCategoryGroups,
  collectCities,
  collectLanguages,
} from "@/lib/resources"
import { buildResourceCsv } from "@/lib/resource-csv"
import {
  EMPTY_RESOURCE_FILTERS,
  filterResources,
  RESOURCE_FILTER_URL_KEYS,
  resourceFiltersFromSearchParams,
  resourceFiltersToSearchParams,
  type ResourceFilterState,
} from "@/lib/resource-filters"
import { InlineError } from "@/components/feedback/InlineError"
import { classifyResourceError } from "./resource-error-classifier"
import { ResourceDialog } from "./ResourceDialog"
import { ResourceFilters } from "./ResourceFilters"
import { ResourceToolbar, type ResourceView } from "./ResourceToolbar"
import { ResourceDirectory } from "./ResourceDirectory"
import { ResourceMap } from "./ResourceMap"
import { PrintableResources } from "./PrintableResources"
import {
  categorySlug,
  type ResourceCategoryGroup,
} from "./ResourceCategoryAccordion"
import type { Resource, ResourcesMeta } from "@/types"
import {
  Tabs,
  TabsContent,
  TabsContents,
} from "@tidewater-dsa/ui/components/motion-tabs"

const EmptyState = ({ onClear }: { onClear: () => void }) => (
  <Card variant="editorial" className="gap-3 px-6 py-16 text-center">
    <CardHeader>
      <CardTitle className="heading-display! text-xl leading-tight">
        No resources match your filters
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-foreground-soft">
        Try clearing filters or searching a broader term.
      </p>
      <Button variant="editorial" onClick={onClear} className="mx-auto mt-2">
        Clear all filters
      </Button>
    </CardContent>
  </Card>
)

interface CommunityResourcesProps {
  resources: Resource[]
  meta: ResourcesMeta | null
  error: string | null
  initialView: ResourceView
  disclaimerText: string
  printFooterText: string
  communityHeadline: string
}

export const CommunityResources = ({
  resources,
  error,
  initialView,
  disclaimerText,
  printFooterText,
  communityHeadline,
}: CommunityResourcesProps) => {
  const [view, setView] = useState<ResourceView>(initialView)
  const [selected, setSelected] = useState<Resource | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [filters, setFilters] = useUrlFilterState<ResourceFilterState>(
    EMPTY_RESOURCE_FILTERS,
    resourceFiltersFromSearchParams,
    resourceFiltersToSearchParams,
    RESOURCE_FILTER_URL_KEYS
  )

  const [openValues, setOpenValues] = useState<string[]>(() => {
    const first = collectCategoryGroups(resources)[0]?.group
    return first ? [categorySlug(first)] : []
  })

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const categoryCounts = useMemo(
    () => collectCategoryGroups(resources),
    [resources]
  )

  const cities = useMemo(() => collectCities(resources), [resources])

  const languages = useMemo(() => collectLanguages(resources), [resources])

  const filtered = useMemo(
    () => filterResources(resources, filters),
    [resources, filters]
  )

  const grouped = useMemo((): ResourceCategoryGroup[] => {
    const order = categoryCounts.map((c) => c.group)
    const map = new Map<string, Resource[]>()

    for (const r of filtered) {
      const primary = r.categoryGroups[0] ?? "Other"
      if (!map.has(primary)) map.set(primary, [])
      map.get(primary)!.push(r)
    }

    const result: ResourceCategoryGroup[] = []

    for (const g of order) {
      if (map.has(g)) {
        result.push({ group: g, items: map.get(g)! })
        map.delete(g)
      }
    }

    for (const [g, items] of map) result.push({ group: g, items })

    return result
  }, [filtered, categoryCounts])

  const allSlugs = useMemo(
    () => grouped.map((g) => categorySlug(g.group)),
    [grouped]
  )

  const allExpanded =
    allSlugs.length > 0 && allSlugs.every((s) => openValues.includes(s))

  const setViewAndSync = useCallback((next: ResourceView) => {
    setView(next)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (next === "map") params.set("view", "map")
      else params.delete("view")
      const qs = params.toString()
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`
      )
    }
  }, [])

  const toggleExpandAll = useCallback(() => {
    setOpenValues((prev) => (prev.length === allSlugs.length ? [] : allSlugs))
  }, [allSlugs])

  const expandCategory = useCallback((slug: string) => {
    setOpenValues((prev) => (prev.includes(slug) ? prev : [...prev, slug]))
  }, [])

  const handleOpenResource = useCallback((r: Resource) => {
    setSelected(r)
    setDialogOpen(true)
  }, [])

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") window.print()
  }, [])

  const handleDownloadCsv = useCallback(() => {
    const csv = buildResourceCsv(filtered)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const stamp = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `community-resources-${stamp}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [filtered])

  const showEmpty = view === "directory" && filtered.length === 0

  return (
    <>
      <ResourceToolbar
        view={view}
        onViewChange={setViewAndSync}
        allExpanded={allExpanded}
        onToggleExpandAll={toggleExpandAll}
        canToggleExpand={view === "directory" && grouped.length > 1}
        onPrint={handlePrint}
        onDownloadCsv={handleDownloadCsv}
      />

      {error && (
        <div className="mt-4">
          <InlineError message={error} classify={classifyResourceError} />
        </div>
      )}

      <div className="mt-4">
        <ResourceFilters
          filters={filters}
          setFilters={setFilters}
          resources={resources}
          categoryCounts={categoryCounts}
          cities={cities}
          languages={languages}
          filteredCount={filtered.length}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-foreground-soft italic">
        {disclaimerText}
      </p>

      <div className="mt-4">
        {showEmpty ? (
          <EmptyState onClear={() => setFilters(EMPTY_RESOURCE_FILTERS)} />
        ) : (
          <Tabs value={view} className="w-full">
            <TabsContents transition={{ duration: 0.5, ease: "easeInOut" }}>
              <TabsContent value="directory">
                <ResourceDirectory
                  groups={grouped}
                  openValues={openValues}
                  onOpenChange={setOpenValues}
                  onOpenResource={handleOpenResource}
                  onExpandCategory={expandCategory}
                  scrollContainerRef={scrollContainerRef}
                />
              </TabsContent>
              <TabsContent value="map">
                <ResourceMap resources={filtered} onOpen={handleOpenResource} />
              </TabsContent>
            </TabsContents>
          </Tabs>
        )}
      </div>

      <ResourceDialog
        resource={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <PrintableResources
        resources={filtered}
        communityHeadline={communityHeadline}
        filters={filters}
        footerText={printFooterText ?? undefined}
      />
    </>
  )
}
