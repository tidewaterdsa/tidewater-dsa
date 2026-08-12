import type { Resource } from "@/types"

/**
 * CSV export for the resources directory.
 *
 * The column names here are intentionally distinct from the Google Sheet's source column names.
 * The sheet uses verbose internal labels ("Hours of Operation/How to Access", "Last Verification Date");
 * the CSV uses tighter export-friendly names ("Hours", "Last Verified").
 */
const CSV_COLUMNS: ReadonlyArray<{
  header: string
  get: (r: Resource) => string
}> = [
  { header: "Name", get: (r) => r.name },
  { header: "Organization", get: (r) => r.organization },
  { header: "Description", get: (r) => r.description },
  {
    header: "Categories",
    get: (r) => r.categories.map((c) => c.full).join("; "),
  },
  { header: "Address", get: (r) => r.streetAddress },
  { header: "City", get: (r) => r.city },
  { header: "State", get: (r) => r.state },
  { header: "ZIP", get: (r) => r.zip },
  { header: "Phone", get: (r) => r.phone },
  { header: "Email", get: (r) => r.email },
  { header: "Website", get: (r) => r.websiteLink },
  { header: "Cost", get: (r) => r.costStructure },
  { header: "Eligibility", get: (r) => r.eligibilityDetails },
  { header: "Hours", get: (r) => r.hours },
  { header: "Languages", get: (r) => r.languages.join("; ") },
  { header: "Required Documents", get: (r) => r.requiredDocuments },
  { header: "Last Verified", get: (r) => r.lastVerifiedISO ?? "" },
]

const escapeCsvCell = (raw: string): string => {
  if (raw == null) return ""
  // Newlines inside cells break CSV parsers; collapse to spaces.
  const s = String(raw).replace(/\r?\n/g, " ")
  // Cells containing commas or quotes must be quoted, with any internal quotes escaped by doubling.
  return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Build a CSV string from a resources list. */
export const buildResourceCsv = (resources: Resource[]): string => {
  const header = CSV_COLUMNS.map((c) => escapeCsvCell(c.header)).join(",")
  const rows = resources.map((r) =>
    CSV_COLUMNS.map((c) => escapeCsvCell(c.get(r))).join(",")
  )
  
  return [header, ...rows].join("\n")
}
