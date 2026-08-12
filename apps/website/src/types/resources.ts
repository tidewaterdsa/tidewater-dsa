/** A parsed category, e.g. "Shelter - Emergency" → { group, label, full }. */
export interface ResourceCategory {
  group: string
  label: string
  full: string
}

/** A single parsed social handle/link. */
export interface ResourceSocial {
  platform: SocialPlatform
  /** Raw handle or label (e.g. "@tidewaterdsa", "ThriveUMC"). Empty string if only a URL was provided. */
  handle: string
  /** Best-effort URL to link to. Always populated. */
  url: string
}

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "twitter"
  | "bluesky"
  | "linktree"
  | "linkedin"
  | "youtube"
  | "other"

export interface Resource {
  id: string
  name: string
  organization: string
  description: string
  categories: ResourceCategory[]
  /** Deduped top-level groups for fast filtering (e.g. ["Shelter", "Health"]). */
  categoryGroups: string[]
  streetAddress: string
  city: string
  state: string
  zip: string
  /** Human-readable combined address, empty if nothing to show. */
  fullAddress: string
  phone: string
  /** tel:-safe version, empty if no phone. */
  phoneLink: string
  email: string
  website: string
  /** URL-safe website (with https:// prefix), empty if none. */
  websiteLink: string
  /** Parsed, structured social handles/links. */
  socials: ResourceSocial[]
  costStructure: string
  isFree: boolean
  eligibilityDetails: string
  hours: string
  nextEvent: string
  languages: string[]
  requiredDocuments: string
  additionalNotes: string
  lastVerifiedISO: string | null
  /** Populated by the geocoder when available. */
  coords: { lat: number; lng: number } | null
}

export interface ResourcesMeta {
  fetchedAt: string
  totalCount: number
  withAddressCount: number
  geocodedCount: number
  sourceSheetId: string
  sourceRange: string
}
