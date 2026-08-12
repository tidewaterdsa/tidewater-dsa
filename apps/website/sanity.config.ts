import { buildLegacyTheme, defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { presentationTool, defineLocations } from "sanity/presentation"
import { CalendarIcon } from "@sanity/icons"
import { schemaTypes } from "./sanity/schemas"
import { structure, SINGLETON_TYPES } from "./sanity/structure"
import { CustomizeEventsTool } from "./sanity/tools/customize-events/CustomizeEventsTool"

const projectId =
  typeof process !== "undefined" && process.env.PUBLIC_SANITY_PROJECT_ID
    ? process.env.PUBLIC_SANITY_PROJECT_ID
    : import.meta.env.PUBLIC_SANITY_PROJECT_ID

const dataset =
  typeof process !== "undefined" && process.env.PUBLIC_SANITY_DATASET
    ? process.env.PUBLIC_SANITY_DATASET
    : import.meta.env.PUBLIC_SANITY_DATASET

const dsaRed = "#ec1f27"

const dsaTheme = buildLegacyTheme({
  "--brand-primary": dsaRed,
  "--focus-color": dsaRed,
  "--state-info-color": dsaRed,
  "--default-button-primary-color": dsaRed,
})

export default defineConfig({
  name: "tidewater-dsa",
  title: "Tidewater DSA",
  projectId: projectId,
  dataset: dataset,
  theme: dsaTheme,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: location.origin,
      resolve: {
        locations: {
          homePage: defineLocations({
            message: "This document is used on the homepage",
            tone: "caution",
            locations: [{ title: "Homepage", href: "/" }],
          }),
          siteSettings: defineLocations({
            message: "These settings are used on every page",
            tone: "caution",
            locations: [
              { title: "View global changes (via Homepage)", href: "/" },
            ],
          }),
          page: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || "Untitled", href: `/${doc?.slug}` },
              ],
            }),
          }),
          post: defineLocations({
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "Untitled",
                  href: `/posts/${doc?.slug}`,
                },
              ],
            }),
          }),
          eventsPage: defineLocations({
            message: "This document is used on the /events page",
            tone: "caution",
            locations: [{ title: "Events Page", href: "/events" }],
          }),
        },
      },
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
  tools: (prev) => {
    const presentationIndex = prev.findIndex((t) => t.name === "presentation")
    const customizeTool = {
      name: "customize",
      title: "Customize Events",
      icon: CalendarIcon,
      component: CustomizeEventsTool,
    }

    return [
      ...prev.slice(0, presentationIndex + 1),
      customizeTool,
      ...prev.slice(presentationIndex + 1),
    ]
  },
  document: {
    actions: (input, context) => {
      if (SINGLETON_TYPES.has(context.schemaType)) {
        return input.filter(
          (a) => a.action !== "delete" && a.action !== "duplicate"
        )
      }
      return input
    },
    newDocumentOptions: (input) =>
      input.filter(
        (creationOption) => !SINGLETON_TYPES.has(creationOption.templateId)
      ),
  },
})
