import { defineField, defineType } from "sanity"
import { defineRichTextBody } from "./richTextFields"
import { defineShowSignupField } from "./showSignupField"

export const eventsPageType = defineType({
  name: "eventsPage",
  title: "Events Page",
  type: "document",
  groups: [
    { name: "content", title: "Page Content", default: true },
    { name: "calendar", title: "Calendar Section" },
    { name: "signup", title: "Signup Section" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Page Title",
      type: "string",
      description: "Used for internal routing and navigation menus.",
      group: "content",
      initialValue: "Events",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Page Eyebrow",
      type: "string",
      description:
        "Small mono label above the page headline (e.g. 'Calendar', 'Schedule').",
      group: "content",
      initialValue: "Calendar",
    }),
    defineField({
      name: "headline",
      title: "Page Headline",
      type: "string",
      description:
        "Page-level h1. Wrap a phrase in *asterisks* to render it in red (e.g. 'Upcoming *events*').",
      group: "content",
      initialValue: "Upcoming *events*",
      validation: (Rule) => Rule.required(),
    }),
    defineRichTextBody({
      name: "intro",
      title: "Intro",
      description: "Rich text content below the page headline.",
      group: "content",
      allowImages: false,
    }),
    defineField({
      name: "noFeaturedEventsMessage",
      title: "Empty state for Featured Events",
      type: "string",
      group: "calendar",
      description:
        "Shown in the Featured Events carousel when the visible month has no featured events. Use {month} as a placeholder for the month name.",
      initialValue:
        "No featured events in {month}. Use the arrows above the calendar to look ahead.",
      validation: (Rule) => Rule.max(200),
    }),
    defineShowSignupField({ initialValue: true, group: "signup" }),
  ],
  preview: {
    prepare: () => ({ title: "Events Page" }),
  },
})
