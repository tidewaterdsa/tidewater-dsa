import { buildLegacyTheme, defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { visionTool } from "@sanity/vision"
import { presentationTool, defineLocations } from "sanity/presentation"
import { CalendarIcon } from "@sanity/icons"
import { schemaTypes } from "./sanity/schemas"
import { DSA_RED } from "./sanity/theme"
import { StudioLayout } from "./sanity/components/StudioLayout"
import { structure, SINGLETON_TYPES } from "./sanity/structure"
import { customizeEventsStructure } from "./sanity/tools/customize-events/structure"
import {
  CUSTOMIZE_TOOL_NAME,
  EVENT_CUSTOMIZATION_TEMPLATE_ID,
  EVENT_SCHEMA_TYPE,
} from "./sanity/tools/customize-events/constants"

const projectId =
  typeof process !== "undefined" && process.env.PUBLIC_SANITY_PROJECT_ID
    ? process.env.PUBLIC_SANITY_PROJECT_ID
    : import.meta.env.PUBLIC_SANITY_PROJECT_ID

const dataset =
  typeof process !== "undefined" && process.env.PUBLIC_SANITY_DATASET
    ? process.env.PUBLIC_SANITY_DATASET
    : import.meta.env.PUBLIC_SANITY_DATASET

const dsaTheme = buildLegacyTheme({
  "--brand-primary": DSA_RED,
  "--focus-color": DSA_RED,
  "--state-info-color": DSA_RED,
  "--default-button-primary-color": DSA_RED,
})

const isDev =
  typeof import.meta.env !== "undefined"
    ? import.meta.env.DEV
    : process.env.NODE_ENV !== "production"

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
    structureTool({
      name: CUSTOMIZE_TOOL_NAME,
      title: "Customize Events",
      icon: CalendarIcon,
      structure: customizeEventsStructure,
    }),
    ...(isDev ? [visionTool()] : []),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: EVENT_CUSTOMIZATION_TEMPLATE_ID,
        title: "Event customization from Google Calendar",
        schemaType: EVENT_SCHEMA_TYPE,
        // Declaring params also keeps this out of the "new document" menu.
        parameters: [
          { name: "googleEventId", type: "string" },
          { name: "titleHint", type: "string" },
        ],
        value: (params: { googleEventId: string; titleHint?: string }) => ({
          googleEventId: params.googleEventId,
          titleHint: params.titleHint,
        }),
      },
    ],
  },
  studio: {
    components: {
      layout: StudioLayout,
    },
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
