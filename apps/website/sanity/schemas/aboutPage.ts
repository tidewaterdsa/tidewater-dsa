import { defineField, defineType } from "sanity"
import { defineRichTextBody } from "./richTextFields"
import { defineShowSignupField } from "./showSignupField"

export const aboutPageType = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  groups: [
    { name: "header", title: "Page Header", default: true },
    { name: "body", title: "Story" },
    { name: "values", title: "Values" },
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
      initialValue: "About Us",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Page Eyebrow",
      type: "string",
      description:
        "Small mono label above the page headline (e.g. 'Our story').",
      group: "header",
      initialValue: "Our story",
    }),
    defineField({
      name: "headline",
      title: "Page Headline",
      type: "string",
      description:
        "Page-level h1. Wrap a phrase in *asterisks* to render it in red (e.g. 'About *Tidewater DSA*').",
      group: "header",
      initialValue: "About *Tidewater DSA*",
      validation: (Rule) => Rule.required(),
    }),
    defineRichTextBody({
      name: "intro",
      title: "Page Intro",
      description: "Rich text content below the page headline.",
      group: "header",
      allowImages: false,
    }),

    // Content
    defineRichTextBody({
      name: "body",
      title: "About Content",
      description:
        "The main rich text About content. ",
      group: "body",
      allowQuotes: true,
    }),

    // Values Section
    defineField({
      name: "valuesEyebrow",
      title: "Values Section Eyebrow",
      type: "string",
      description: "Small mono label above the values section heading.",
      group: "values",
      initialValue: "What we believe",
    }),
    defineField({
      name: "valuesHeadline",
      title: "Values Section Headline",
      type: "string",
      description:
        "Section h2 above the values grid. Asterisk syntax supported (e.g. 'Our *values*').",
      group: "values",
      initialValue: "Our *values*",
    }),
    defineField({
      name: "values",
      title: "Chapter Values",
      type: "array",
      of: [{ type: "aboutValue" }],
      description:
        "The cards in the values grid. Drag to reorder. Leave empty to hide the values section entirely.",
      group: "values",
    }),

    defineShowSignupField({ initialValue: true, group: "signup" }),
  ],
  preview: {
    prepare: () => ({ title: "About Page" }),
  },
})
