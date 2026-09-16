import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import sanity from "@sanity/astro"
import cloudflare from "@astrojs/cloudflare"
import { loadEnv } from "vite"

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV,
  process.cwd(),
  ""
)

export default defineConfig({
  adapter: cloudflare(),
  output: "server",
  security: {
    // Astro rejects cross-origin POSTs by default, which blocks the Sanity
    // publish webhook to /api/revalidate — it arrives with no matching Origin.
    // Nothing here is cookie-authenticated, and that route checks a shared
    // secret header, which a cross-site form POST cannot set.
    checkOrigin: false,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // React 19 + Cloudflare Workers: Vite resolves react-dom/server to the browser build,
      // which calls MessageChannel at init. Workers don't have MessageChannel.
      // Force the edge build, which is designed for this runtime.
      alias: import.meta.env.PROD
        ? { "react-dom/server": "react-dom/server.edge" }
        : {},
    },
    optimizeDeps: {
      include: [
        "react/compiler-runtime",
        "lodash/isObject.js",
        "lodash/groupBy.js",
        "lodash/keyBy.js",
        "lodash/partition.js",
        "lodash/sortedIndex.js",
      ],
    },
  },
  integrations: [
    react(),
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
      apiVersion: "2026-04-10",
      studioBasePath: "/admin",
      stega: {
        studioUrl: "/admin",
      },
    }),
  ],
})
