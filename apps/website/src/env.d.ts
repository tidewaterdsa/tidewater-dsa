/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

/** Cloudflare Workers KV binding type. */
type KVNamespace = import("@cloudflare/workers-types").KVNamespace

/** Cloudflare runtime environment shape. Add bindings here as they're introduced. */
interface CloudflareEnv {
  GEOCODE_CACHE: KVNamespace
  /** "production" | "staging". Anything else is treated as non-production. */
  ENVIRONMENT?: string
  GOOGLE_CALENDAR_ID?: string
  GOOGLE_CALENDAR_API_KEY?: string
  GOOGLE_SHEETS_API_KEY?: string
  MAPBOX_GEOCODER_TOKEN?: string
  USE_MOCK_DATA?: string
  PUBLIC_SANITY_VISUAL_EDITING_ENABLED?: string
  SANITY_API_READ_TOKEN?: string
}

/** The Astro.locals.runtime shape provided by @astrojs/cloudflare. */
type Runtime = import("@astrojs/cloudflare").Runtime<CloudflareEnv>

declare namespace App {
  type Locals = Runtime
}
