import { defineField, defineType } from "sanity"

export const getInvolvedWayType = defineType({
  name: "getInvolvedWay",
  title: "Way to Get Involved",
  type: "object",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description:
        "Short card title (e.g. 'Become a member', 'Come to a meeting').",
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description:
        "A sentence or two explaining this path.",
      validation: (Rule) => Rule.required().max(280),
    }),
    defineField({
      name: "ctaText",
      title: "Button Text",
      type: "string",
      description:
        "Call-to-action label, e.g. 'Join DSA' or 'Next meeting'. A arrow is added automatically, don't include it here.",
    }),
    defineField({
      name: "ctaLink",
      title: "Button Link",
      type: "string",
      description:
        "Where the button goes. Internal paths ('/events') stay in the same tab; external links (https://, mailto:) open in a new tab automatically.",
    }),
  ],
  preview: {
    select: { title: "headline", subtitle: "description" },
  },
})
