import { defineCliConfig } from "sanity/cli"
import { loadEnv } from "vite"

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "")

export default defineCliConfig({
  api: {
    projectId: env.PUBLIC_SANITY_PROJECT_ID,
    dataset: env.PUBLIC_SANITY_DATASET,
  },
  typegen: {
    path: "./sanity/queries/**/*.ts",
    generates: "./sanity/types.ts",
    schema: "./sanity/schema.json",
  },
})
