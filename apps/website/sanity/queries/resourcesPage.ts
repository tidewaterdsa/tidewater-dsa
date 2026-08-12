import { defineQuery } from "groq"

export const RESOURCES_PAGE_QUERY = defineQuery(`{
  "page": *[_type == "resourcesPage" && _id == "resourcesPage"][0] {
    _id,
    title,
    eyebrow,
    headline,
    intro,
    memberEyebrow,
    memberHeadline,
    body,
    communityEyebrow,
    communityHeadline,
    communityIntro,
    disclaimerText,
    printFooterText,
    googleSheetId,
    googleSheetRange,
    showSignup
  },
}`)
