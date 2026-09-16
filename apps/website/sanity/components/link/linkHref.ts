/**
 * Shared analysis for the link fields admins fill in by hand.
 *
 * A pasted "actionnetwork.org/forms/x" has no scheme, so the browser treats it
 * as a path on this site and the visitor lands on the 404 page. Everything here
 * exists to tell those apart from real internal routes like "/events".
 */

import { DYNAMIC_ROUTES, STATIC_ROUTES } from "../../generated/routes"

/**
 * The one dynamic route we can check, because Sanity `page` documents supply
 * its slugs. Every other pattern is filled by something this file can't see.
 */
const SLUG_BACKED_ROUTE = "/[slug]"

const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i
const HOST_PATTERN = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i
const EMAIL_PATTERN = /^[^\s@/]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i

export type HrefAnalysis =
  /** Blank, or a scheme/protocol-relative/anchor value the browser already handles. */
  | { kind: "ok" }
  /** Leading slash that matches a page we publish. */
  | { kind: "internal"; path: string }
  /** Leading slash, but nothing on the site answers to it. */
  | { kind: "unknown-internal"; path: string }
  /** Looks like a host or an email, so we know which scheme it wants. */
  | { kind: "needs-scheme"; suggestion: string }
  /** Scheme-less, but it matches an internal route once you add the slash. */
  | { kind: "missing-slash"; suggestion: string }
  /**
   * Scheme-less and unrecognizable: only the admin knows what they meant.
   * `asExternal` is null when the value can't be a URL at all (it has spaces).
   */
  | { kind: "ambiguous"; asExternal: string | null; asInternal: string }

/** Drops the query string, hash, trailing slash and casing before comparing routes. */
const normalizePath = (path: string): string => {
  const bare = path.split(/[?#]/)[0].toLowerCase()
  if (bare === "/") return "/"
  return bare.replace(/\/+$/, "")
}

/** `/posts/[slug]` matches `/posts/anything`; `[...rest]` swallows what's left. */
const matchesPattern = (pattern: string, path: string): boolean => {
  const patternSegments = pattern.split("/").filter(Boolean)
  const pathSegments = path.split("/").filter(Boolean)

  let index = 0

  for (const segment of patternSegments) {
    if (segment.startsWith("[...")) return pathSegments.length > index
    if (index >= pathSegments.length) return false
    if (!segment.startsWith("[") && segment !== pathSegments[index])
      return false
    index += 1
  }

  return index === pathSegments.length
}

const isKnownRoute = (path: string, pageSlugs: string[]): boolean => {
  const normalized = normalizePath(path)

  if (STATIC_ROUTES.includes(normalized)) return true
  if (pageSlugs.some((slug) => `/${normalizePath(slug)}` === normalized)) {
    return true
  }

  // A pattern whose contents we can't look up gets the benefit of the doubt:
  // silence beats warning about a path that's probably fine.
  return DYNAMIC_ROUTES.some(
    (pattern) =>
      pattern !== SLUG_BACKED_ROUTE && matchesPattern(pattern, normalized)
  )
}

/**
 * `pageSlugs` is null while the Studio is still fetching them; unmatched paths
 * are given the benefit of the doubt until it resolves.
 */
export const analyzeHref = (
  raw: string | undefined,
  pageSlugs: string[] | null
): HrefAnalysis => {
  const value = (raw ?? "").trim()

  if (!value) return { kind: "ok" }
  if (SCHEME_PATTERN.test(value)) return { kind: "ok" }
  // "//example.com" and "#section" / "?tab=x" already mean what they say.
  if (/^(\/\/|[#?])/.test(value)) return { kind: "ok" }

  if (value.startsWith("/")) {
    if (!pageSlugs || isKnownRoute(value, pageSlugs)) {
      return { kind: "internal", path: value }
    }
    return { kind: "unknown-internal", path: value }
  }

  if (EMAIL_PATTERN.test(value)) {
    return { kind: "needs-scheme", suggestion: `mailto:${value}` }
  }

  const host = value.split("/")[0]
  if (HOST_PATTERN.test(host)) {
    return { kind: "needs-scheme", suggestion: `https://${value}` }
  }

  // Bare words are only worth flagging once we know which routes exist, so the
  // field stays quiet rather than flashing the wrong advice mid-fetch.
  if (!pageSlugs) return { kind: "ok" }

  if (isKnownRoute(`/${value}`, pageSlugs)) {
    return { kind: "missing-slash", suggestion: `/${value}` }
  }

  return {
    kind: "ambiguous",
    asExternal: /\s/.test(value) ? null : `https://${value}`,
    asInternal: `/${value}`,
  }
}
