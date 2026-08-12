import { defineField, defineType } from "sanity"
import { defineRichTextBody } from "./richTextFields"
import { defineShowSignupField } from "./showSignupField"

export const chapterPrioritiesPageType = defineType({
  name: "chapterPrioritiesPage",
  title: "Chapter Priorities Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      description: "Used for internal routing and navigation menus",
      initialValue: "Chapter Priorities",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Page Eyebrow",
      type: "string",
      description:
        "Small mono label above the page headline (e.g. '2026 Resolutions'). Update annually when priorities are re-voted at convention.",
      initialValue: "2026 Resolutions",
    }),
    defineField({
      name: "headline",
      title: "Page Headline",
      type: "string",
      description:
        "Page-level h1. Wrap a phrase in *asterisks* to render it in red (e.g. 'Chapter *priorities*').",
      initialValue: "Chapter *priorities*",
      validation: (Rule) => Rule.required(),
    }),
    defineRichTextBody({
      name: "intro",
      title: "Intro Content",
      description:
        "Rich text content below the headline explaining how priorities are chosen and how members can plug in.",
    }),
    defineField({
      name: "priorities",
      title: "Priorities",
      type: "array",
      of: [{ type: "priority" }],
      description:
        "The chapter's priorities, in display order. Numbering ('01', '02', …) is derived from position in this array, reorder to renumber.",
      validation: (Rule) => Rule.min(1),
    }),
    defineShowSignupField({ initialValue: false }),
  ],
  preview: {
    prepare: () => ({ title: "Chapter Priorities Page" }),
  },
})
