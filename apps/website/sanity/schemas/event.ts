import { defineField, defineType } from "sanity"
import { EventTypeInput } from "../components/EventTypeInput"
import { WorkingGroupInput } from "../components/WorkingGroupInput"
import { EventFormHeader } from "../components/EventFormHeader"

export const eventType = defineType({
  name: "event",
  title: "Event Customization",
  type: "document",

  // Wrap the whole form with a header that includes a "Back to Customize Events" link
  // so admins have a clear, always-visible way back to the tool after editing
  // as Sanity does not handle this well
  components: {
    input: EventFormHeader,
  },
  fields: [
    defineField({
      name: "googleEventId",
      title: "Google Calendar Event ID",
      type: "string",
      description:
        "Links this customization to a specific Google Calendar event. Auto-filled when customizations are created from the Customize Events tool. You shouldn't need to set this by hand.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "titleHint",
      title: "Event Title (for reference)",
      type: "string",
      description:
        "The event's title at the time this customization was created. Helps identify this document in Studio lists. NOT displayed on the website. The site always uses the live title from Google Calendar.",
    }),
    defineField({
      name: "featured",
      title: "Feature on the events page",
      type: "boolean",
      description:
        "When on, this event appears in the 'Featured Events' section at the top of the calendar page.",
      initialValue: false,
    }),
    defineField({
      name: "eventType",
      title: "Event Type",
      type: "string",
      description:
        "Used for the colored pill on the calendar and filter chips. Types are managed in the 'Event Types' document under Settings. Go there to add, rename, or recolor types.",
      components: {
        input: EventTypeInput,
      },
    }),
    defineField({
      name: "attendance",
      title: "Attendance",
      type: "string",
      options: {
        list: [
          { title: "In-person", value: "in_person" },
          { title: "Virtual", value: "virtual" },
          { title: "Hybrid", value: "hybrid" },
        ],
      },
    }),
    defineField({
      name: "topics",
      title: "Topics",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description:
        "Free-form tags for filtering. e.g. 'housing', 'mutual aid', 'labor'. Keep them short and consistent.",
    }),
    defineField({
      name: "workingGroup",
      title: "Working Group",
      type: "string",
      description:
        "The working group or committee organizing this event. Choose from the list managed in the 'Working Groups' document under Settings. Go there to add or rename groups.",
      components: {
        input: WorkingGroupInput,
      },
    }),
    defineField({
      name: "rsvpLink",
      title: "RSVP / Action Network URL",
      type: "url",
      description:
        "Paste the full Action Network URL (or any RSVP link). The event detail dialog shows an RSVP button that links here. Leave blank to auto-extract from the Google Calendar event description (most events have their AN link there already).",
    }),
    defineField({
      name: "summary",
      title: "Short Summary (optional override)",
      type: "text",
      rows: 3,
      description:
        "Shown in the Featured Events cards. If left blank, the site falls back to the first couple lines of the Google Calendar description.",
    }),
  ],
  preview: {
    select: {
      title: "titleHint",
      subtitle: "googleEventId",
      featured: "featured",
    },
    prepare({ title, subtitle, featured }) {
      return {
        title: title ?? "Untitled customization",
        subtitle: `${featured ? "★ " : ""}${subtitle ?? "no google calendar id"}`,
      }
    },
  },
})
