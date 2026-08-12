import { parseUsDateToISO } from "./format"
import { detectSocialPlatform } from "./social"
import type {
  Resource,
  ResourceCategory,
  ResourceSocial,
  SocialPlatform,
} from "@/types"

type SheetHeader =
  | "Program or Resource Name"
  | "Organization"
  | "Description"
  | "Categories"
  | "Street Address"
  | "City"
  | "State"
  | "ZIP"
  | "Phone"
  | "Email"
  | "Website"
  | "Social"
  | "Cost Structure"
  | "Eligibility Details"
  | "Hours of Operation/How to Access"
  | "Next Event (if applicable)"
  | "Languages Offered"
  | "Required Documents"
  | "Additional Notes and Context"
  | "Last Verification Date"
  | "Next Verification Date"
  | "Internal Contact(s)"
  | "Internal Notes"
  | "Timestamp"

const FREE_KEYWORDS = ["free", "no cost", "no charge", "donation"] as const

/**
 * Column index from the first row of the sheet response.
 * Always treat row 0 as the header row.
 */
const buildHeaderMap = (firstRow: string[]): Map<string, number> => {
  const map = new Map<string, number>()
  firstRow.forEach((h, i) => map.set((h ?? "").trim(), i))
  return map
}

/** Read a value from a row by header name (not index). */
const get = (
  row: string[],
  headers: Map<string, number>,
  key: SheetHeader
): string => {
  const idx = headers.get(key)
  if (idx === undefined) return ""
  return (row[idx] ?? "").trim()
}

const normalizeCity = (raw: string): string => {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  // Guard: if a sheet author pasted a street address into the City column
  if (/^\d/.test(trimmed)) return ""
  return trimmed
}

const normalizeWebsite = (raw: string): string => {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`

  return trimmed
}

const phoneToLink = (phone: string): string => {
  if (!phone) return ""

  const digits = phone.replace(/\D/g, "")
  if (digits.length < 7) return ""

  return `+${digits.length === 10 ? "1" : ""}${digits}`
}

const parseCategories = (raw: string): ResourceCategory[] => {
  if (!raw) return []

  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((full) => {
      const dashIdx = full.indexOf(" - ")
      if (dashIdx === -1) return { group: full, label: full, full }

      return {
        group: full.slice(0, dashIdx).trim(),
        label: full.slice(dashIdx + 3).trim(),
        full,
      }
    })
}

const parseLanguages = (raw: string): string[] => {
  if (!raw) return []

  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((l) =>
      l.toLowerCase().includes("dropdown") ? "Multiple (see site)" : l
    )
}

const buildFullAddress = (
  street: string,
  city: string,
  state: string,
  zip: string
): string => {
  const line1 = street
  const line2 = [city, state].filter(Boolean).join(", ")
  const line3 = zip

  return [line1, [line2, line3].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(" · ")
}

const cleanHandle = (raw: string): string =>
  raw
    .trim()
    .replace(/^@+/, "")
    .replace(/[;,.]+$/, "")
    .trim()

const buildSocialUrl = (platform: SocialPlatform, handle: string): string => {
  const h = cleanHandle(handle)
  if (!h) return ""
  switch (platform) {
    case "instagram":
      return `https://instagram.com/${h}`
    case "facebook":
      return `https://facebook.com/${h}`
    case "twitter":
      return `https://x.com/${h}`
    case "bluesky":
      return h.includes(".") ? `https://bsky.app/profile/${h}` : ""
    case "linktree":
      return `https://linktr.ee/${h}`
    case "linkedin":
      return `https://linkedin.com/company/${h}`
    case "youtube":
      return `https://youtube.com/@${h}`
    default:
      return ""
  }
}

export const parseSocials = (raw: string): ResourceSocial[] => {
  if (!raw) return []
  const trimmed = raw.trim()
  const out: ResourceSocial[] = []
  const seen = new Set<string>()

  const pushSocial = (entry: ResourceSocial): void => {
    const key = `${entry.platform}|${entry.url || entry.handle}`

    if (seen.has(key) || (!entry.url && !entry.handle)) return

    seen.add(key)
    out.push(entry)
  }

  if (/^https?:\/\//i.test(trimmed) && !trimmed.includes(";")) {
    const platform = detectSocialPlatform(trimmed)
    pushSocial({ platform, handle: "", url: trimmed })
    return out
  }

  if (trimmed.includes(":") && /[;,]/.test(trimmed)) {
    const parts = trimmed
      .split(/[;,]/)
      .map((p) => p.trim())
      .filter(Boolean)

    for (const part of parts) {
      const colonIdx = part.indexOf(":")
      if (colonIdx === -1) continue

      const label = part.slice(0, colonIdx).trim()
      const value = part.slice(colonIdx + 1).trim()

      if (!value) continue

      const platform = detectSocialPlatform(label)

      if (/^https?:\/\//i.test(value)) {
        pushSocial({ platform, handle: "", url: value })
      } else {
        const handle = cleanHandle(value)

        if (!handle) continue

        pushSocial({
          platform,
          handle: `@${handle}`,
          url: buildSocialUrl(platform, handle),
        })
      }
    }

    return out
  }

  if (trimmed.includes(":")) {
    const colonIdx = trimmed.indexOf(":")
    const label = trimmed.slice(0, colonIdx).trim()
    const value = trimmed.slice(colonIdx + 1).trim()
    const platform = detectSocialPlatform(label)

    if (/^https?:\/\//i.test(value)) {
      pushSocial({ platform, handle: "", url: value })
    } else if (value) {
      const handle = cleanHandle(value)

      if (handle)
        pushSocial({
          platform,
          handle: `@${handle}`,
          url: buildSocialUrl(platform, handle),
        })
    }

    return out
  }

  if (trimmed.startsWith("@")) {
    const handle = cleanHandle(trimmed)

    if (handle) {
      pushSocial({
        platform: "instagram",
        handle: `@${handle}`,
        url: buildSocialUrl("instagram", handle),
      })
    }

    return out
  }

  if (/[\w-]+\.[a-z]{2,}/i.test(trimmed)) {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    pushSocial({ platform: detectSocialPlatform(url), handle: "", url })
  }

  return out
}

/**
 * Build a stable, human-readable ID for a sheet row.
 *
 * Format: `${rowIdx}-${slug-of-name}` (e.g. `12-thrive-peninsula`).
 * The Google Sheet has no row IDs of its own, so we synthesize them.
 */
const buildResourceId = (rowIdx: number, name: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)

  return `${rowIdx}-${slug || "row"}`
}

const isPublishable = (r: Resource): boolean => {
  if (r.description) return true
  if (r.categories.length > 0) return true
  if (r.phone || r.email || r.websiteLink) return true
  if (r.streetAddress || r.city || r.zip) return true
  return false
}

export const parseResourceRows = (rows: string[][]): Resource[] => {
  if (!rows.length) return []

  const headers = buildHeaderMap(rows[0])
  const dataRows = rows.slice(1)

  const resources: Resource[] = []

  for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
    const row = dataRows[rowIdx]
    const name = get(row, headers, "Program or Resource Name")

    if (!name) continue

    const organization = get(row, headers, "Organization")
    const streetAddress = get(row, headers, "Street Address")
    const city = normalizeCity(get(row, headers, "City"))
    const state = get(row, headers, "State")
    const zip = get(row, headers, "ZIP")
    const phone = get(row, headers, "Phone")
    const website = get(row, headers, "Website")
    const costStructure = get(row, headers, "Cost Structure")
    const costLower = costStructure.toLowerCase()
    const categories = parseCategories(get(row, headers, "Categories"))

    const resource: Resource = {
      id: buildResourceId(rowIdx, name),
      name,
      organization,
      description: get(row, headers, "Description"),
      categories,
      categoryGroups: Array.from(new Set(categories.map((c) => c.group))),
      streetAddress,
      city,
      state,
      zip,
      fullAddress: buildFullAddress(streetAddress, city, state, zip),
      phone,
      phoneLink: phoneToLink(phone),
      email: get(row, headers, "Email"),
      website,
      websiteLink: normalizeWebsite(website),
      socials: parseSocials(get(row, headers, "Social")),
      costStructure,
      isFree: FREE_KEYWORDS.some((k) => costLower.includes(k)),
      eligibilityDetails: get(row, headers, "Eligibility Details"),
      hours: get(row, headers, "Hours of Operation/How to Access"),
      nextEvent: get(row, headers, "Next Event (if applicable)"),
      languages: parseLanguages(get(row, headers, "Languages Offered")),
      requiredDocuments: get(row, headers, "Required Documents"),
      additionalNotes: get(row, headers, "Additional Notes and Context"),
      lastVerifiedISO: parseUsDateToISO(
        get(row, headers, "Last Verification Date")
      ),
      coords: null,
    }

    if (!isPublishable(resource)) continue
    resources.push(resource)
  }

  resources.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  )

  return resources
}

export interface FilterOption {
  value: string
  count: number
}

export const collectCities = (resources: Resource[]): FilterOption[] => {
  const counts = new Map<string, number>()

  for (const r of resources) {
    if (!r.city) continue
    counts.set(r.city, (counts.get(r.city) ?? 0) + 1)
  }
  
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}

export const collectCategoryGroups = (
  resources: Resource[]
): { group: string; count: number }[] => {
  const counts = new Map<string, number>()

  for (const r of resources) {
    for (const g of r.categoryGroups) {
      counts.set(g, (counts.get(g) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([group, count]) => ({ group, count }))
    .sort((a, b) => b.count - a.count || a.group.localeCompare(b.group))
}

export const collectLanguages = (resources: Resource[]): FilterOption[] => {
  const counts = new Map<string, number>()

  for (const r of resources) {
    for (const l of r.languages) counts.set(l, (counts.get(l) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => a.value.localeCompare(b.value))
}
