/**
 * Date-pinned Sanity API version used across all Sanity client calls.
 *
 * Sanity's API is versioned by date.
 * Passing a specific date tells their API to return the shape of data as it existed on that date,
 * so the code doesn't break when they ship new features.
 * Bump this deliberately after testing with a new Sanity version, not per-file.
 *
 * See: https://www.sanity.io/docs/api-versioning
 */
export const SANITY_API_VERSION = "2026-04-10"
