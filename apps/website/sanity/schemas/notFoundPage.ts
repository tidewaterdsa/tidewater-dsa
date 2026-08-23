import { defineArrayMember, defineField, defineType } from "sanity"

export const notFoundPageType = defineType({
  name: "notFoundPage",
  title: "404 Page",
  type: "document",
  groups: [
    { name: "header", title: "Page Header", default: true },
    { name: "links", title: "Suggested Links" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      description: "Browser tab title.",
      group: "header",
      initialValue: "Page not found",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Page Eyebrow",
      type: "string",
      description: "Small mono label above the headline.",
      group: "header",
      initialValue: "Error 404",
    }),
    defineField({
      name: "headline",
      title: "Page Headline",
      type: "string",
      description:
        "Wrap words in *asterisks* to highlight them in red, e.g. That page *isn't here*.",
      group: "header",
      initialValue: "That page *isn't here*",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      description: "Reassuring line shown under the headline.",
      group: "header",
      initialValue:
        "The link may be out of date, or the page may have moved. Nothing is broken on your end.",
    }),
    defineField({
      name: "linksEyebrow",
      title: "Links Eyebrow",
      type: "string",
      description: "Label above the suggested links grid.",
      group: "links",
      initialValue: "Try one of these",
    }),
    defineField({
      name: "links",
      title: "Suggested Links",
      type: "array",
      description:
        "Where to send someone who hit a dead link. Two or four reads best in the grid.",
      group: "links",
      of: [defineArrayMember({ type: "notFoundLink" })],
      validation: (Rule) => Rule.max(6),
    }),
  ],
  preview: {
    prepare: () => ({ title: "404 Page" }),
  },
})
