import { defineQuery } from "groq"

export const GET_INVOLVED_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "getInvolvedPage" && _id == "getInvolvedPage"][0] {
    _id,
    title,
    eyebrow,
    headline,
    intro,
    waysEyebrow,
    waysHeadline,
    ways[] {
      headline,
      description,
      ctaText,
      ctaLink
    },
    showSignup
  },
}`)
