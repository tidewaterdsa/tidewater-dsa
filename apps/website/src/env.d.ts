/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

/** Cloudflare Workers KV binding type. */
type KVNamespace = import("@cloudflare/workers-types").KVNamespace

/** Cloudflare runtime environment shape. Add bindings here as they're introduced. */
interface CloudflareEnv {
  GEOCODE_CACHE: KVNamespace
  GOOGLE_CALENDAR_ID?: string
  GOOGLE_CALENDAR_API_KEY?: string
  GOOGLE_SHEETS_API_KEY?: string
  MAPBOX_GEOCODER_TOKEN?: string
  ACTION_NETWORK_API_KEY?: string
  USE_MOCK_DATA?: string
}

/** The Astro.locals.runtime shape provided by @astrojs/cloudflare. */
type Runtime = import("@astrojs/cloudflare").Runtime<CloudflareEnv>

declare namespace App {
  type Locals = Runtime
}
