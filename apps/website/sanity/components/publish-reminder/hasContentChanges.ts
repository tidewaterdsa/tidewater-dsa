import type { SanityDocument } from "sanity"

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

// Bookkeeping that always differs between a draft and its published twin.
const SYSTEM_FIELDS = new Set([
  "_id",
  "_rev",
  "_createdAt",
  "_updatedAt",
  "_system",
])

/** Sorted keys and no bookkeeping, so two documents stringify identically. */
const canonical = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return value.map(canonical)
  if (value === null || typeof value !== "object") return value

  return Object.keys(value)
    .filter((key) => !SYSTEM_FIELDS.has(key))
    .sort()
    .reduce<{ [key: string]: JsonValue }>((acc, key) => {
      acc[key] = canonical(value[key])
      return acc
    }, {})
}

/**
 * Sanity keeps the draft around after an edit is undone, so "a draft exists"
 * is not the same as "something changed" — compare the content itself.
 */
export const hasContentChanges = (
  draft: SanityDocument | null | undefined,
  published: SanityDocument | null | undefined
): boolean => {
  if (!draft) return false
  if (!published) return true

  return (
    JSON.stringify(canonical(draft as JsonValue)) !==
    JSON.stringify(canonical(published as JsonValue))
  )
}
