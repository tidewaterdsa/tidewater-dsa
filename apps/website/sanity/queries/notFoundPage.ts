import { defineQuery } from "groq"

export const NOT_FOUND_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "notFoundPage" && _id == "notFoundPage"][0] {
    _id,
    title,
    eyebrow,
    headline,
    intro,
    linksEyebrow,
    links[] {
      label,
      blurb,
      href
    }
  },
}`)
