import type { ComponentType } from "react"
import type {
  ListItemBuilder,
  StructureBuilder,
  StructureResolver,
} from "sanity/structure"
import {
  unpublishedIndicator,
  type StatusTarget,
} from "./components/publish-reminder/UnpublishedIndicator"

interface Singleton {
  /** Doubles as the document id — a singleton owns exactly one document. */
  type: string
  title: string
  icon?: ComponentType
}

interface SingletonGroup {
  title: string
  singletons: Singleton[]
  /** Anything else that belongs in the folder, listed after a divider. */
  extras?: (S: StructureBuilder) => ListItemBuilder[]
}

const PAGES: SingletonGroup = {
  title: "Pages",
  singletons: [
    { type: "homePage", title: "Home Page" },
    { type: "chapterPrioritiesPage", title: "Chapter Priorities Page" },
    { type: "eventsPage", title: "Events Page" },
    { type: "resourcesPage", title: "Resources Page" },
    { type: "getInvolvedPage", title: "Get Involved Page" },
    { type: "aboutPage", title: "About Page" },
    { type: "notFoundPage", title: "404 Page" },
  ],
  extras: (S) => [S.documentTypeListItem("page").title("Other Pages")],
}

const SETTINGS: SingletonGroup = {
  title: "Settings",
  singletons: [
    { type: "siteSettings", title: "Site Settings" },
    { type: "eventTypes", title: "Event Types" },
    { type: "workingGroups", title: "Working Groups" },
  ],
}

const GROUPS = [PAGES, SETTINGS]

/** Drives which types lose their delete, duplicate, and create actions. */
export const SINGLETON_TYPES = new Set(
  GROUPS.flatMap((group) => group.singletons.map((singleton) => singleton.type))
)

const target = ({ type }: Singleton): StatusTarget => ({
  documentId: type,
  documentType: type,
})

/** Build a list item that opens a specific singleton document. */
const singletonItem = (S: StructureBuilder, singleton: Singleton) =>
  S.listItem()
    .title(singleton.title)
    .id(singleton.type)
    .icon(unpublishedIndicator([target(singleton)], singleton.icon))
    .child(
      S.document()
        .schemaType(singleton.type)
        .documentId(singleton.type)
        .title(singleton.title)
    )

/** A folder of singletons, marked when anything inside is waiting to publish. */
const singletonGroup = (S: StructureBuilder, group: SingletonGroup) => {
  const extras = group.extras?.(S) ?? []

  return S.listItem()
    .title(group.title)
    .icon(unpublishedIndicator(group.singletons.map(target)))
    .child(
      S.list()
        .title(group.title)
        .items([
          ...group.singletons.map((singleton) => singletonItem(S, singleton)),
          ...(extras.length > 0 ? [S.divider(), ...extras] : []),
        ])
    )
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      singletonGroup(S, PAGES),

      // S.documentTypeListItem("post").title("Posts"),

      S.divider(),

      singletonGroup(S, SETTINGS),
    ])
