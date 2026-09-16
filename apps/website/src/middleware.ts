import { defineMiddleware } from "astro:middleware"

/**
 * Response headers and edge caching for every server-rendered route.
 *
 * Static assets are served by the ASSETS binding before the Worker runs, so
 * these cover pages and API routes only.
 */

/**
 * Never cached: the Studio renders per-editor state, and API routes include the
 * purge webhook, which has to reach the Worker every time.
 */
const UNCACHEABLE_PREFIXES = ["/admin", "/api"]

const applySecurityHeaders = (response: Response, isProduction: boolean) => {
  /**
   * Keep every non-production deployment out of search results.
   *
   * A header rather than robots.txt: one bundle is deployed to both
   * environments, so the decision has to be made at runtime, and the header
   * also covers /admin, which robots.txt would not keep out of an index once a
   * URL has been discovered.
   *
   * Anything not explicitly production is noindex, so a missing
   * ENVIRONMENT var cannot accidentally expose a preview to crawlers.
   */
  if (!isProduction) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow")
  }

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Stops another site from framing the Studio at /admin and clickjacking a
  // signed-in editor. 'self' rather than 'none': Sanity presentation mode
  // frames site pages from the Studio, which is same-origin (studioUrl: "/admin").
  response.headers.set("Content-Security-Policy", "frame-ancestors 'self'")
}

/**
 * What the browser sees on hits and misses alike: revalidate every load.
 * The stored copy gets a real TTL instead — see the note in onRequest.
 */
const BROWSER_CACHE_CONTROL = "public, max-age=0, must-revalidate"

/** The edge TTL a page asked for via setPageCacheHeaders, if any. */
const edgeTtlFrom = (response: Response): number | null => {
  const match = response.headers.get("Cache-Control")?.match(/s-maxage=(\d+)/)
  return match ? Number(match[1]) : null
}

/**
 * Staging is excluded so visual editing always renders live content, and
 * because its cache would otherwise survive a production-triggered purge.
 */
const isCacheable = (request: Request, isProduction: boolean): boolean => {
  if (!isProduction || request.method !== "GET") return false

  const { pathname } = new URL(request.url)
  return !UNCACHEABLE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export const onRequest = defineMiddleware(async (context, next) => {
  const isProduction = context.locals.runtime?.env.ENVIRONMENT === "production"
  const cacheable = isCacheable(context.request, isProduction)
  const cache = caches.default

  if (cacheable) {
    const hit = await cache.match(context.request)
    if (hit) {
      // Rebuilt rather than returned directly: a cached Response is immutable.
      const response = new Response(hit.body, hit)
      applySecurityHeaders(response, isProduction)
      response.headers.set("Cache-Control", BROWSER_CACHE_CONTROL)
      response.headers.set("X-Edge-Cache", "HIT")
      return response
    }
  }

  const response = await next()
  applySecurityHeaders(response, isProduction)

  // Only 200s, and only when the page asked to be cached via setPageCacheHeaders.
  const ttl =
    cacheable && response.status === 200 ? edgeTtlFrom(response) : null

  if (ttl !== null) {
    response.headers.set("X-Edge-Cache", "MISS")

    /**
     * The stored copy carries a plain `max-age`, not the `max-age=0,
     * must-revalidate` the browser gets: the Cache API reads Cache-Control as
     * an instruction to itself and silently declines to store a response that
     * says not to cache. Miniflare is more permissive, so this only shows up
     * once deployed — a MISS on every request is the symptom.
     */
    const toStore = new Response(response.clone().body, response)
    toStore.headers.set("Cache-Control", `public, max-age=${ttl}`)

    context.locals.runtime?.ctx.waitUntil(
      cache.put(context.request, toStore).catch((err) => {
        const message = err instanceof Error ? err.message : "Unknown error"
        console.error("[middleware] cache.put failed:", message)
      })
    )
  }

  return response
})
