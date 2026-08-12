import { defineField, defineType } from "sanity"
import { defineRichTextBody } from "./richTextFields"

export const priorityType = defineType({
  name: "priority",
  title: "Priority",
  type: "object",
  fields: [
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description:
        "Short label that appears after the auto-generated number (e.g. 'Mutual Aid' renders as '01 / Mutual Aid' on the first priority, '02 / Mutual Aid' on the second, etc).",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description:
        "Bold uppercase headline. Wrap a phrase in *asterisks* to render it in red (e.g. 'Solidarity, *not charity*.').",
      validation: (Rule) => Rule.required(),
    }),
    defineRichTextBody({
      name: "description",
      title: "Description",
      description:
        "Paragraph describing the priority and what the chapter is doing about it.",
      validation: (Rule) => Rule.required(),
      allowImages: false,
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description:
        "Photo or illustration representing this priority.",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ctaText",
      title: "Call-To-Action Text",
      type: "string",
      description:
        "Optional. Link text shown at the bottom of the priority block (e.g. 'Join the working group'). Leave both this and the link blank to hide the CTA.",
    }),
    defineField({
      name: "ctaLink",
      title: "Call-To-Action Link",
      type: "url",
      description:
        "Optional. Where the CTA points, can be internal (/events) or external (action network URL). External links open in a new tab automatically.",
      validation: (Rule) =>
        Rule.uri({
          allowRelative: true,
          scheme: ["http", "https", "mailto"],
        }),
    }),
  ],
  preview: {
    select: { category: "category", headline: "headline", image: "image" },
    prepare: ({ category, headline, image }) => ({
      title: category || "Priority",
      subtitle: headline || "(no headline yet)",
      media: image,
    }),
  },
})
