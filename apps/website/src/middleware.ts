import { defineMiddleware } from "astro:middleware"

/**
 * Keep every non-production deployment out of search results.
 *
 * This is a header rather than a robots.txt on purpose: one bundle is deployed
 * to both environments, so the decision has to be made at runtime, and the
 * header also covers the Studio at /admin, which robots.txt alone would not
 * keep out of an index once a URL has been discovered.
 *
 * Fails closed — anything that isn't explicitly production is noindex, so a
 * missing ENVIRONMENT var can't accidentally expose a preview to crawlers.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()

  if (context.locals.runtime?.env.ENVIRONMENT !== "production") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow")
  }

  return response
})
