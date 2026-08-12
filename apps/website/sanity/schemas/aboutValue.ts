import { defineField, defineType } from "sanity"

export const aboutValueType = defineType({
  name: "aboutValue",
  title: "Chapter Value",
  type: "object",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: "Short value title",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description:
        "A sentence or two explaining this value.",
      validation: (Rule) => Rule.required().max(280),
    }),
  ],
  preview: {
    select: { title: "headline", subtitle: "description" },
  },
})
