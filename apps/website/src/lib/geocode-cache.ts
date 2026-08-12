/**
 * Persistent geocode cache.
 *
 * Backed by Cloudflare KV in production (via the GEOCODE_CACHE binding) and
 * by an in-memory Map in local dev without a proxy, or when KV is otherwise unavailable.
 * Positive cache entries never expire, coordinates resolve deterministically.
 * Negatives expire after 30 days so the cache self-heals when admins fix bad addresses.
 */

export interface Coords {
  lat: number
  lng: number
}

export interface GeocodeCache {
  get: (key: string) => Promise<Coords | null | undefined>
  set: (key: string, value: Coords | null) => Promise<void>
}

/** Shape stored in KV. Keep this format stable, deployed caches contain it. */
interface CachePositive {
  lat: number
  lng: number
  missed?: false
}

interface CacheNegative {
  missed: true
}

type CacheValue = CachePositive | CacheNegative

const NEGATIVE_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 days

/**
 * Cache key version.
 * Bump this whenever the geocoder's validation rules change.
 * Ensures old cached results from a less-strict version get regenerated instead of served as-is.
 *
 * v1: initial (pre-region-validation)
 * v2: post-region-validation (rejects out-of-region matches)
 */
const CACHE_KEY_VERSION = "v2"

export const buildCacheKey = (
  street: string,
  city: string,
  state: string,
  zip: string
): string => {
  const parts = [street, city, state, zip].map((s) =>
    s.trim().toLowerCase().replace(/\s+/g, " ")
  )
  return `addr:${CACHE_KEY_VERSION}:${parts.join("|")}`
}

const isCachePositive = (v: CacheValue): v is CachePositive =>
  !("missed" in v && v.missed)

export const createKvGeocodeCache = (kv: KVNamespace): GeocodeCache => ({
  get: async (key) => {
    const value = await kv.get<CacheValue>(key, "json")

    if (value === null) return undefined
    return isCachePositive(value) ? { lat: value.lat, lng: value.lng } : null
  },
  set: async (key, value) => {
    if (value === null) {
      await kv.put(
        key,
        JSON.stringify({ missed: true } satisfies CacheNegative),
        { expirationTtl: NEGATIVE_CACHE_TTL_SECONDS }
      )
    } else {
      await kv.put(
        key,
        JSON.stringify({
          lat: value.lat,
          lng: value.lng,
        } satisfies CachePositive)
      )
    }
  },
})

/** In-memory cache for dev or when KV is unavailable. Scoped per isolate. */
export const createMemoryGeocodeCache = (): GeocodeCache => {
  const store = new Map<string, Coords | null>()

  return {
    get: async (key) => (store.has(key) ? store.get(key)! : undefined),
    set: async (key, value) => {
      store.set(key, value)
    },
  }
}
