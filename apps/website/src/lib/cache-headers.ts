/**
 * Cache directives for server-rendered pages.
 *
 * `s-maxage` is what the edge cache in `middleware.ts` reads for its TTL, and
 * `max-age=0, must-revalidate` makes the browser re-ask on every load. The
 * middleware rewrites Cache-Control on the copy it stores — the Cache API reads
 * these directives as an instruction to itself and won't store a response that
 * says not to cache.
 *
 * The edge here is the Worker's own Cache API, not the CDN cache: Workers run
 * before cache, so Cache Rules never see a response Astro rendered.
 */

/**
 * Every page renders the next-meeting ribbon from `main.astro`, which reads
 * Google Calendar. A Sanity publish purges the edge, but a calendar edit
 * doesn't, so no page can outlive its calendar data by much. Sanity edits are
 * unaffected — publishing purges immediately.
 */
const EDGE_MAX_AGE_SECONDS = 300

export const setPageCacheHeaders = (headers: Headers): void => {
  headers.set(
    "Cache-Control",
    `public, max-age=0, must-revalidate, s-maxage=${EDGE_MAX_AGE_SECONDS}`
  )
}
