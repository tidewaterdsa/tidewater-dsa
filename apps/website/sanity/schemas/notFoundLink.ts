import { defineField, defineType } from "sanity"

export const notFoundLinkType = defineType({
  name: "notFoundLink",
  title: "Suggested Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "The link text, e.g. 'Events calendar'.",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "blurb",
      title: "Blurb",
      type: "string",
      description: "One short line describing where the link goes.",
      validation: (Rule) => Rule.required().max(120),
    }),
    defineField({
      name: "href",
      title: "Path or URL",
      type: "string",
      description:
        "Site path starting with / (e.g. /events), or a full https:// URL.",
      validation: (Rule) =>
        Rule.required().custom((value) =>
          typeof value === "string" &&
          (value.startsWith("/") || value.startsWith("https://"))
            ? true
            : "Must start with / or https://"
        ),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
})
