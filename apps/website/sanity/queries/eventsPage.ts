import { defineQuery } from "groq"

/**
 * Singleton fetch. `intro` is a PortableText block array (rich text) — projected
 * as a plain field reference so blocks round-trip naturally through GROQ, same
 * pattern as the chapter priorities page intro and the home page body.
 */
export const EVENTS_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "eventsPage" && _id == "eventsPage"][0] {
    _id,
    title,
    eyebrow,
    headline,
    intro,
    noFeaturedEventsMessage,
    showSignup
  },
}`)