import { defineField, defineType } from "sanity"
import { ColorPickerInput } from "../components/ColorPickerInput"
import { AutoSlugFromLabelInput } from "../components/AutoSlugFromLabelInput"

interface EntryShape {
  label?: string
  value?: { current?: string }
  color?: string
}

export const eventTypesType = defineType({
  name: "eventTypes",
  title: "Event Types",
  type: "document",
  fields: [
    defineField({
      name: "types",
      title: "Event Types",
      description:
        "Define the categories of events. Each type gets a colored pill on the calendar and a filter chip. Drag to reorder, the order here is the order they appear in the filter bar.",
      type: "array",
      of: [
        {
          type: "object",
          name: "eventTypeEntry",
          fields: [
            defineField({
              name: "label",
              title: "Display Label",
              type: "string",
              description:
                "Shown on the calendar (e.g. 'Training', '101 / Intro').",
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
              name: "color",
              title: "Color",
              type: "string",
              description: "Pill color on the calendar and filter chip.",
              initialValue: "blue",
              components: {
                input: ColorPickerInput,
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description (internal)",
              type: "text",
              rows: 2,
              description:
                "Optional note for admins. Not shown on the website. Useful for clarifying when to use this type.",
            }),
          ],
          preview: {
            select: {
              title: "label",
              slug: "value.current",
              color: "color",
            },
            prepare({ title, slug, color }) {
              return {
                title: title ?? "Untitled type",
                subtitle: `${color ?? "—"} · ${slug ?? "no-slug"}`,
              }
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.custom((types) => {
          if (!Array.isArray(types)) return true
          // Sanity's Rule.custom hands us an untyped array, narrow it to the partial shape
          const entries = types as EntryShape[]

          // Ensure slug values are unique
          const seen = new Set<string>()
          for (const entry of entries) {
            const slug = entry?.value?.current
            if (!slug) continue
            if (seen.has(slug)) {
              return `Duplicate value "${slug}". Each event type must have a unique value.`
            }
            seen.add(slug)
          }
          return true
        }),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Event Types" }
    },
  },
})
