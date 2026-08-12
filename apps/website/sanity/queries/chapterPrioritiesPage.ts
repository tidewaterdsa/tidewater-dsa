import { defineQuery } from "groq"

export const CHAPTER_PRIORITIES_PAGE_QUERY =
  defineQuery(`*[_type == "chapterPrioritiesPage" && _id == "chapterPrioritiesPage"][0] {
  _id,
  title,
  eyebrow,
  headline,
  intro,
  priorities[] {
    _key,
    category,
    headline,
    description,
    image,
    ctaText,
    ctaLink
  }
}`)
