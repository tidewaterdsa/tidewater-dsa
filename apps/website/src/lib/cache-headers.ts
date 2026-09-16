/**
 * Cache directives for server-rendered pages.
 *
 * `s-maxage` drives how long the edge keeps the page; `max-age=0,
 * must-revalidate` makes the browser re-ask every load. Browsers ignore
 * `s-maxage`, shared caches prefer it, so one header serves both.
 *
 * The edge here is the Worker's own Cache API (see `middleware.ts`), not the
 * CDN cache — Workers run before cache, so Cache Rules never see a response
 * Astro rendered. The Cache API reads these same directives for its TTL.
 *
 * The TTL can be this long because publishing purges (see
 * `pages/api/revalidate.ts`).
 */

const EDGE_MAX_AGE_SECONDS = 60 * 60 // 1 hour

interface CacheOptions {
  /** Override for pages whose content changes outside of a Sanity publish. */
  edgeMaxAge?: number
}

export const setPageCacheHeaders = (
  headers: Headers,
  { edgeMaxAge = EDGE_MAX_AGE_SECONDS }: CacheOptions = {}
): void => {
  headers.set(
    "Cache-Control",
    `public, max-age=0, must-revalidate, s-maxage=${edgeMaxAge}`
  )
}
