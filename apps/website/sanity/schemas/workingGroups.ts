import { defineField, defineType } from "sanity"
import { AutoSlugFromLabelInput } from "../components/AutoSlugFromLabelInput"

interface EntryShape {
  label?: string
  value?: { current?: string }
}

export const workingGroupsType = defineType({
  name: "workingGroups",
  title: "Working Groups",
  type: "document",
  fields: [
    defineField({
      name: "groups",
      title: "Working Groups",
      description:
        "Define the working groups and committees that organize events. Each entry shows up as a badge on event details and as a filter checkbox on the events page. Drag to reorder — the order here is the order they appear in the filter list.",
      type: "array",
      of: [
        {
          type: "object",
          name: "workingGroupEntry",
          fields: [
            defineField({
              name: "label",
              title: "Display Label",
              type: "string",
              description:
                "Shown on the site (e.g. 'Deflock', 'Mutual Aid').",
              validation: (Rule) => Rule.required().max(40),
            }),
            defineField({
              name: "value",
              title: "Value (slug)",
              type: "slug",
              description:
                "Internal identifier. Auto-filled from the label when empty, usually you don't need to touch it. Click Edit if you need to change it manually, but be aware: changing an in-use slug strands any events tagged with the old value.",
              components: {
                input: AutoSlugFromLabelInput,
              },
              options: {
                source: (_doc, options) => {
                  const parent = options.parent as
                    | { label?: string }
                    | undefined
                  return parent?.label ?? ""
                },
                maxLength: 30,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description (internal)",
              type: "text",
              rows: 2,
              description:
                "Optional note for admins. Not shown on the website. Useful for clarifying what the group does or when to use this tag.",
            }),
          ],
          preview: {
            select: {
              title: "label",
              slug: "value.current",
            },
            prepare({ title, slug }) {
              return {
                title: title ?? "Untitled working group",
                subtitle: slug ?? "no-slug",
              }
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((groups) => {
          if (!Array.isArray(groups)) return true
          // Sanity's Rule.custom hands us an untyped array, narrow it to the partial shape
          const entries = groups as EntryShape[]

          // Ensure slug values are unique
          const seen = new Set<string>()
          for (const entry of entries) {
            const slug = entry?.value?.current
            if (!slug) continue
            if (seen.has(slug)) {
              return `Duplicate value "${slug}". Each working group must have a unique slug.`
            }
            seen.add(slug)
          }
          return true
        }),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Working Groups" }
    },
  },
})
