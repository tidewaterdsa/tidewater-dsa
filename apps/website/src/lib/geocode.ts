import type { Resource } from "@/types"
import { buildCacheKey, type Coords, type GeocodeCache } from "./geocode-cache"
import { isInRegion, REGION_CENTER } from "./region"

/**
 * Mapbox geocoder with observability and sanity-check bounding box.
 *
 * Logs one summary line per SSR (look for `[geocode]`) plus specific warnings for auth, rate limit, and out-of-region results.
 *
 * Out-of-region rejection: Mapbox will happily return a best-effort match from anywhere in the US if an address has a typo.
 * "5360 Robinhood Rd, Norfolk, VA" (missing space, should be "Robin Hood") landed on a real Robinhood Rd in Winston-Salem NC.
 * To catch those, we reject any result whose coordinates fall outside a generous Hampton Roads / coastal VA / NE NC bounding box and cache them as negatives.
 */

const MAPBOX_BASE = "https://api.mapbox.com/geocoding/v5/mapbox.places"

export interface GeocodeOptions {
  mapboxToken: string
  cache: GeocodeCache
  /** Total time budget in ms. Default 10s. */
  timeoutMs?: number
  /** Max cache-miss geocodes per call. Default 200. */
  maxLookups?: number
}

export interface GeocodeStats {
  cacheHits: number
  cacheNegativeHits: number
  lookupsPerformed: number
  lookupsSucceeded: number
  lookupsFailed: number
  lookupsOutOfRegion: number
  authError: boolean
  rateLimited: boolean
}

interface MapboxResponse {
  features?: Array<{
    center?: [number, number]
    place_name?: string
  }>
  message?: string
}

let loggedAuthOnce = false

const geocodeAddress = async (
  query: string,
  token: string,
  signal: AbortSignal,
  stats: GeocodeStats
): Promise<Coords | null> => {
  // `proximity` biases (does not restrict) results toward Hampton Roads, which helps resolve ambiguous names like "Main St" to the nearest one.
  const url =
    `${MAPBOX_BASE}/${encodeURIComponent(query)}.json` +
    `?access_token=${token}` +
    `&limit=1&country=us&types=address` +
    `&proximity=${REGION_CENTER[0]},${REGION_CENTER[1]}`

  try {
    const res = await fetch(url, { signal })

    if (res.status === 401 || res.status === 403) {
      stats.authError = true

      if (!loggedAuthOnce) {
        loggedAuthOnce = true
        const body = await res.text().catch(() => "")
        console.error(
          `[geocode] Mapbox returned ${res.status} for "${query}". ` +
            `Token is invalid, revoked, or missing the 'geocoding:read' scope. ` +
            `Body: ${body.slice(0, 200)}`
        )
      }
      return null
    }

    if (res.status === 429) {
      stats.rateLimited = true
      console.warn(`[geocode] Mapbox rate-limited (429) for "${query}".`)
      return null
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      console.warn(
        `[geocode] Mapbox ${res.status} for "${query}": ${body.slice(0, 200)}`
      )
      return null
    }

    const data = (await res.json()) as MapboxResponse
    const feat = data.features?.[0]

    if (!feat?.center) return null

    const [lng, lat] = feat.center
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

    const coords: Coords = { lat, lng }

    // Reject wildly-wrong MapBox results
    if (!isInRegion(coords)) {
      stats.lookupsOutOfRegion++
      console.warn(
        `[geocode] Rejected out-of-region result for "${query}" → ` +
          `${feat.place_name ?? `${lat},${lng}`}. Check the address for typos.`
      )
      return null
    }

    return coords
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return null
    console.warn(
      `[geocode] Network error for "${query}":`,
      err instanceof Error ? err.message : err
    )
    return null
  }
}

export const geocodeResources = async (
  resources: Resource[],
  opts: GeocodeOptions
): Promise<GeocodeStats> => {
  const { mapboxToken, cache, timeoutMs = 10_000, maxLookups = 200 } = opts

  const stats: GeocodeStats = {
    cacheHits: 0,
    cacheNegativeHits: 0,
    lookupsPerformed: 0,
    lookupsSucceeded: 0,
    lookupsFailed: 0,
    lookupsOutOfRegion: 0,
    authError: false,
    rateLimited: false,
  }

  if (!mapboxToken) {
    console.error(
      "[geocode] MAPBOX_GEOCODER_TOKEN is empty. Pins will NOT appear. " +
        "Check apps/website/.env and restart the dev server."
    )
    return stats
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    for (const r of resources) {
      if (!r.streetAddress && !r.city && !r.zip) continue

      const key = buildCacheKey(r.streetAddress, r.city, r.state, r.zip)

      const cached = await cache.get(key)
      if (cached !== undefined) {
        r.coords = cached

        if (cached === null) stats.cacheNegativeHits++
        else stats.cacheHits++
        continue
      }

      if (controller.signal.aborted || stats.lookupsPerformed >= maxLookups) {
        break
      }

      if (stats.authError) break

      stats.lookupsPerformed++

      const query = [r.streetAddress, r.city, r.state, r.zip]
        .filter(Boolean)
        .join(", ")

      const coords = await geocodeAddress(
        query,
        mapboxToken,
        controller.signal,
        stats
      )

      r.coords = coords
      if (coords) stats.lookupsSucceeded++
      else stats.lookupsFailed++

      // Don't cache negatives when auth has failed.
      // Once the token is fixed, retry those addresses instead of serving stale negatives.
      if (!stats.authError) {
        await cache.set(key, coords)
      }
    }
  } finally {
    clearTimeout(timer)
  }

  const total = resources.length
  const withCoords = resources.filter((r) => r.coords).length

  console.log(
    `[geocode] ${withCoords}/${total} have coords · ` +
      `cache hits: ${stats.cacheHits} positive, ${stats.cacheNegativeHits} negative · ` +
      `network lookups: ${stats.lookupsPerformed} ` +
      `(${stats.lookupsSucceeded} ok, ${stats.lookupsFailed} fail` +
      (stats.lookupsOutOfRegion > 0
        ? `, ${stats.lookupsOutOfRegion} rejected out-of-region`
        : "") +
      `)` +
      (stats.authError ? " · AUTH ERROR — fix MAPBOX_GEOCODER_TOKEN" : "") +
      (stats.rateLimited ? " · RATE LIMITED" : "")
  )

  return stats
}
