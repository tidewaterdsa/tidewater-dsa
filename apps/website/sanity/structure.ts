import type { ComponentType } from "react"
import type { StructureBuilder, StructureResolver } from "sanity/structure"

export const SINGLETON_IDS: Record<string, string> = {
  eventTypes: "eventTypes",
  eventsPage: "eventsPage",
  homePage: "homePage",
  chapterPrioritiesPage: "chapterPrioritiesPage",
  resourcesPage: "resourcesPage",
  getInvolvedPage: "getInvolvedPage",
  aboutPage: "aboutPage",
  siteSettings: "siteSettings",
  workingGroups: "workingGroups",
}

export const SINGLETON_TYPES = new Set(Object.keys(SINGLETON_IDS))

/** Build a list item that opens a specific singleton document. */
const singletonItem = (
  S: StructureBuilder,
  type: string,
  title: string,
  icon?: ComponentType
) =>
  S.listItem()
    .title(title)
    .id(type)
    .icon(icon)
    .child(
      S.document().schemaType(type).documentId(SINGLETON_IDS[type]).title(title)
    )

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              singletonItem(S, "homePage", "Home Page"),
              singletonItem(
                S,
                "chapterPrioritiesPage",
                "Chapter Priorities Page"
              ),
              singletonItem(S, "eventsPage", "Events Page"),
              singletonItem(S, "resourcesPage", "Resources Page"),
              singletonItem(S, "getInvolvedPage", "Get Involved Page"),
              singletonItem(S, "aboutPage", "About Page"),
              S.divider(),
              S.documentTypeListItem("page").title("Other Pages"),
            ])
        ),

      S.documentTypeListItem("post").title("Posts"),

      S.divider(),

      S.listItem()
        .title("Settings")
        .child(
          S.list()
            .title("Settings")
            .items([
              singletonItem(S, "siteSettings", "Site Settings"),
              singletonItem(S, "eventTypes", "Event Types"),
              singletonItem(S, "workingGroups", "Working Groups"),
            ])
        ),
    ])
