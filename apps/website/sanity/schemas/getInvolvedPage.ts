import { defineField, defineType } from "sanity"
import { defineRichTextBody } from "./richTextFields"
import { defineShowSignupField } from "./showSignupField"

export const getInvolvedPageType = defineType({
  name: "getInvolvedPage",
  title: "Get Involved Page",
  type: "document",
  groups: [
    { name: "header", title: "Page Header", default: true },
    { name: "ways", title: "Ways to Get Involved" },
    { name: "signup", title: "Signup Section" },
  ],
  fields: [
    // Page Header
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      description: "Used for internal routing and navigation menus.",
      group: "header",
      initialValue: "Get Involved",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Page Eyebrow",
      type: "string",
      description: "Small mono label above the page headline (e.g. 'Join Us').",
      group: "header",
      initialValue: "Join Us",
    }),
    defineField({
      name: "headline",
      title: "Page Headline",
      type: "string",
      description:
        "Page-level h1. Wrap a phrase in *asterisks* to render it in red (e.g. 'Get *involved*').",
      group: "header",
      initialValue: "Get *involved*",
      validation: (Rule) => Rule.required(),
    }),
    defineRichTextBody({
      name: "intro",
      title: "Page Intro",
      description: "Rich text content below the page headline.",
      group: "header",
      allowImages: false,
    }),

    // Ways Section
    defineField({
      name: "waysEyebrow",
      title: "Ways Section Eyebrow",
      type: "string",
      description:
        "Small mono label above the ways-to-get-involved section heading.",
      group: "ways",
      initialValue: "Three ways to start",
    }),
    defineField({
      name: "waysHeadline",
      title: "Ways Section Headline",
      type: "string",
      description:
        "Section h2 above the ways grid. Asterisk syntax supported (e.g. 'Take *action*.').",
      group: "ways",
      initialValue: "Take *action*.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ways",
      title: "Ways to Get Involved",
      type: "array",
      of: [{ type: "getInvolvedWay" }],
      description:
        "The numbered cards in the ways grid. Drag to reorder. Three reads best, but any number works.",
      group: "ways",
      validation: (Rule) => Rule.min(1),
    }),

    defineShowSignupField({ initialValue: true, group: "signup" }),
  ],
  preview: {
    prepare: () => ({ title: "Get Involved Page" }),
  },
})
