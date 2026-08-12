import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import type { Resource } from "@/types"
import type { ResourceFilterState } from "@/lib/resource-filters"
import { format } from "date-fns"

interface PrintableResourcesProps {
  resources: Resource[]
  communityHeadline: string
  filters: ResourceFilterState
  footerText?: string
}

export const PrintableResources = ({
  resources,
  communityHeadline,
  filters,
  footerText,
}: PrintableResourcesProps) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null

  const today = format(new Date(), "MMMM d, yyyy")

  const activeFilters: string[] = []

  if (filters.search) activeFilters.push(`Search: "${filters.search}"`)
  if (filters.categories.length)
    activeFilters.push(`Categories: ${filters.categories.join(", ")}`)
  if (filters.cities.length)
    activeFilters.push(`Cities: ${filters.cities.join(", ")}`)
  if (filters.languages.length)
    activeFilters.push(`Languages: ${filters.languages.join(", ")}`)
  if (filters.freeOnly) activeFilters.push("Free only")

  // Group by primary category
  const grouped = new Map<string, Resource[]>()

  for (const r of resources) {
    const g = r.categoryGroups[0] ?? "Other"
    if (!grouped.has(g)) grouped.set(g, [])
    grouped.get(g)!.push(r)
  }

  return createPortal(
    <div id="printable-resources" aria-hidden>
      <header className="print-header">
        <h1>{communityHeadline}</h1>
        <p className="print-meta">
          Printed {today} · {resources.length}{" "}
          {resources.length === 1 ? "resource" : "resources"}
        </p>
        {activeFilters.length > 0 && (
          <p className="print-filters">Filters: {activeFilters.join(" · ")}</p>
        )}
      </header>

      {Array.from(grouped.entries()).map(([group, items]) => (
        <section key={group} className="print-group">
          <h2>{group}</h2>
          <ul>
            {items.map((r) => (
              <li key={r.id} className="print-resource">
                <h3>{r.name}</h3>
                {r.organization && r.organization !== r.name && (
                  <p className="print-org">{r.organization}</p>
                )}
                <p className="print-categories">
                  {r.categories.map((c) => c.full).join(" · ")}
                </p>
                {r.description && <p className="print-desc">{r.description}</p>}
                <dl className="print-dl">
                  {r.fullAddress && (
                    <>
                      <dt>Address</dt>
                      <dd>{r.fullAddress.replace(/ · /g, ", ")}</dd>
                    </>
                  )}
                  {r.phone && (
                    <>
                      <dt>Phone</dt>
                      <dd>{r.phone}</dd>
                    </>
                  )}
                  {r.email && (
                    <>
                      <dt>Email</dt>
                      <dd>{r.email}</dd>
                    </>
                  )}
                  {r.websiteLink && (
                    <>
                      <dt>Website</dt>
                      <dd>{r.websiteLink.replace(/^https?:\/\//, "")}</dd>
                    </>
                  )}
                  {r.hours && (
                    <>
                      <dt>Hours</dt>
                      <dd>{r.hours}</dd>
                    </>
                  )}
                  {r.costStructure && (
                    <>
                      <dt>Cost</dt>
                      <dd>{r.costStructure}</dd>
                    </>
                  )}
                  {r.eligibilityDetails && (
                    <>
                      <dt>Eligibility</dt>
                      <dd>{r.eligibilityDetails}</dd>
                    </>
                  )}
                  {r.languages.length > 0 && (
                    <>
                      <dt>Languages</dt>
                      <dd>{r.languages.join(", ")}</dd>
                    </>
                  )}
                  {r.requiredDocuments && (
                    <>
                      <dt>Documents</dt>
                      <dd>{r.requiredDocuments}</dd>
                    </>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {footerText && <footer className="print-footer">{footerText}</footer>}
    </div>,
    document.body
  )
}
