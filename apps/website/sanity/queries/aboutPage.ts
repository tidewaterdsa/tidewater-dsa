import { defineQuery } from "groq"

export const ABOUT_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "aboutPage" && _id == "aboutPage"][0] {
    _id,
    title,
    eyebrow,
    headline,
    intro,
    body,
    valuesEyebrow,
    valuesHeadline,
    values[] {
      headline,
      description
    },
    showSignup
  },
}`)
