import { eventType } from "./event"
import { eventsPageType } from "./eventsPage"
import { eventTypesType } from "./eventTypes"
import { homePageType } from "./homePage"
import { pageType } from "./page"
import { postType } from "./post"
import { priorityType } from "./priority"
import { chapterPrioritiesPageType } from "./chapterPrioritiesPage"
import { resourcesPageType } from "./resourcesPage"
import { siteSettingsType } from "./siteSettings"
import { workingGroupsType } from "./workingGroups"
import { getInvolvedPageType } from "./getInvolvedPage"
import { getInvolvedWayType } from "./way"
import { aboutValueType } from "./aboutValue"
import { aboutPageType } from "./aboutPage"

/**
 * Registration order matters for Sanity's TypeGen
 *
 * Object types that are referenced by document types MUST appear earlier in this array
 * than the documents that use them. If a document is declared before the objects it references,
 * TypeGen resolves those references to `never` and the entire downstream type chain breaks.
 */

export const schemaTypes = [
  // Object types (must come first)
  priorityType,
  getInvolvedWayType,
  aboutValueType,

  // Document types
  postType,
  pageType,
  siteSettingsType,
  homePageType,
  eventType,
  eventsPageType,
  eventTypesType,
  workingGroupsType,
  resourcesPageType,
  chapterPrioritiesPageType,
  getInvolvedPageType,
  aboutPageType,
]
