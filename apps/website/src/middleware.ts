import { defineMiddleware } from "astro:middleware"

/**
 * Response headers applied to every server-rendered route.
 *
 * Static assets are served by the ASSETS binding before the Worker runs, so
 * these cover pages and API routes only.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()

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
  if (context.locals.runtime?.env.ENVIRONMENT !== "production") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow")
  }

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Stops another site from framing the Studio at /admin and clickjacking a
  // signed-in editor. 'self' rather than 'none': Sanity presentation mode
  // frames site pages from the Studio, which is same-origin (studioUrl: "/admin").
  response.headers.set("Content-Security-Policy", "frame-ancestors 'self'")

  return response
})
