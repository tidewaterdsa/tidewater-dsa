import { defineField, defineType } from "sanity"
import type { SlugIsUniqueValidator } from "sanity"
import { defineRichTextBody } from "./richTextFields"
import { SANITY_API_VERSION } from "@/lib/sanity-config"

const siteUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : import.meta.env.PUBLIC_SITE_URL || "https://your-domain.com"

const isUniquePageSlug: SlugIsUniqueValidator = async (slug, context) => {
  const { document, getClient } = context
  const id = document?._id

  if (!id) return true

  const client = getClient({ apiVersion: SANITY_API_VERSION })
  const publishedId = id.replace(/^drafts\./, "")
  const draftId = `drafts.${publishedId}`

  const params = { slug, publishedId, draftId }
  const query = `count(*[
    _type == "page"
    && slug.current == $slug
    && !(_id in [$publishedId, $draftId])
  ])`

  const conflictCount = await client.fetch<number>(query, params)
  return conflictCount === 0
}

export const pageType = defineType({
  name: "page",
  title: "Static Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
        isUnique: isUniquePageSlug,
      },
      validation: (Rule) => Rule.required(),
      description: `This defines the URL. E.g., 'about-us' becomes ${siteUrl}/about-us`,
    }),
    defineRichTextBody({ description: "Page content." }),
  ],
})
