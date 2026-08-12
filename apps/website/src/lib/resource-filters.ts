import type { Resource } from "@/types"

export interface ResourceFilterState {
  search: string
  categories: string[]
  cities: string[]
  languages: string[]
  freeOnly: boolean
}

export const EMPTY_RESOURCE_FILTERS: ResourceFilterState = {
  search: "",
  categories: [],
  cities: [],
  languages: [],
  freeOnly: false,
}

export const isResourceFilterActive = (f: ResourceFilterState): boolean =>
  f.search.trim().length > 0 ||
  f.categories.length > 0 ||
  f.cities.length > 0 ||
  f.languages.length > 0 ||
  f.freeOnly

/** Count of filter categories with at least one active selection. */
export const countActiveResourceFilterCategories = (
  f: ResourceFilterState
): number => {
  let n = 0
  if (f.search.trim()) n++
  if (f.categories.length) n++
  if (f.cities.length) n++
  if (f.languages.length) n++
  if (f.freeOnly) n++
  return n
}

/**
 * Apply filters to a resource list.
 *
 * - Search is a case-insensitive substring match across name, organization, description, city, categories, hours, eligibility
 * - Categories: resource must have at least one of the selected categoryGroups (OR, not AND)
 * - Cities / Languages: resource must match one of the selected values
 * - freeOnly: when true, only resources with isFree === true pass through
 */
export const filterResources = (
  resources: Resource[],
  filters: ResourceFilterState
): Resource[] => {
  const searchQuery = filters.search.trim().toLowerCase()

  return resources.filter((r) => {
    if (searchQuery) {
      const searchText = [
        r.name,
        r.organization,
        r.description,
        r.city,
        r.hours,
        r.eligibilityDetails,
        ...r.categories.map((c) => c.full),
      ]
        .join(" ")
        .toLowerCase()
      if (!searchText.includes(searchQuery)) return false
    }

    if (filters.freeOnly && !r.isFree) return false

    if (
      filters.categories.length &&
      !r.categoryGroups.some((g) => filters.categories.includes(g))
    ) {
      return false
    }

    if (filters.cities.length && !filters.cities.includes(r.city)) {
      return false
    }

    if (
      filters.languages.length &&
      !r.languages.some((l) => filters.languages.includes(l))
    ) {
      return false
    }

    return true
  })
}

export const RESOURCE_FILTER_URL_KEYS = [
  "q",
  "category",
  "city",
  "lang",
  "free",
] as const

export const resourceFiltersToSearchParams = (
  f: ResourceFilterState
): URLSearchParams => {
  const p = new URLSearchParams()
  if (f.search.trim()) p.set("q", f.search.trim())
  if (f.categories.length) p.set("category", f.categories.join(","))
  if (f.cities.length) p.set("city", f.cities.join(","))
  if (f.languages.length) p.set("lang", f.languages.join(","))
  if (f.freeOnly) p.set("free", "1")
  return p
}

export const resourceFiltersFromSearchParams = (
  p: URLSearchParams
): ResourceFilterState => {
  const parseList = (raw: string | null): string[] =>
    raw
      ? raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : []

  return {
    search: p.get("q") ?? "",
    categories: parseList(p.get("category")),
    cities: parseList(p.get("city")),
    languages: parseList(p.get("lang")),
    freeOnly: p.get("free") === "1",
  }
}
