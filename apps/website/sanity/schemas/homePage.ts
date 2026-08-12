import { defineField, defineType } from "sanity"
import { defineRichTextBody } from "./richTextFields"

export const homePageType = defineType({
  name: "homePage",
  title: "Homepage",
  type: "document",
  groups: [
    { name: "hero", title: "Hero Section", default: true },
    { name: "content", title: "Page Content" },
    { name: "events", title: "Events Section" },
  ],
  fields: [
    // Hero Section
    defineField({
      name: "heroHeadline",
      title: "Headline",
      type: "string",
      description:
        "The main heading overlaid on the hero image. Wrap a phrase in *asterisks* to highlight it (e.g. 'Building working-class power across the *757*.').",
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroSubheadline",
      title: "Subheadline",
      type: "text",
      rows: 3,
      description: "A short supporting line below the headline",
      group: "hero",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      description:
        "Full-width background image (recommended 1920×800 or wider)",
      options: { hotspot: true },
      group: "hero",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroCtaText",
      title: "Primary Button Text",
      type: "string",
      description:
        "Text for the primary CTA (e.g. 'Start Organizing'). Leave empty to hide.",
      group: "hero",
    }),
    defineField({
      name: "heroCtaLink",
      title: "Primary Button Link",
      type: "url",
      description: "Where the primary button links to (e.g. /get-involved)",
      group: "hero",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
    }),
    defineField({
      name: "heroCta2Text",
      title: "Secondary Button Text",
      type: "string",
      description:
        "Optional secondary CTA shown next to the primary button (e.g. 'Upcoming events').",
      group: "hero",
    }),
    defineField({
      name: "heroCta2Link",
      title: "Secondary Button Link",
      type: "url",
      description: "Where the secondary button links to (e.g. /events).",
      group: "hero",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
    }),
    defineField({
      name: "heroCtaPosition",
      title: "Content Position",
      type: "string",
      description: "Where the headline + CTAs sit on the hero image",
      group: "hero",
      options: {
        list: [
          { title: "Bottom Left", value: "bottom-left" },
          { title: "Center", value: "center" },
          { title: "Bottom Right", value: "bottom-right" },
        ],
        layout: "radio",
      },
      initialValue: "bottom-left",
    }),

    // Content
    defineField({
      name: "contentEyebrow",
      title: "Content Eyebrow",
      type: "string",
      description:
        "Small label above the content headline (e.g. 'Who we are').",
      group: "content",
      initialValue: "Who we are",
    }),
    defineField({
      name: "contentHeadline",
      title: "Content Headline",
      type: "string",
      description:
        "Section heading. Wrap a phrase in *asterisks* to render it in red (e.g. 'A chapter of *organizers*.').",
      group: "content",
      initialValue: "A chapter of *organizers*.",
    }),
    defineRichTextBody({
      description:
        "Body copy under the content headline. The first paragraph automatically renders with a large red drop-cap.",
      group: "content",
    }),
    defineField({
      name: "bodyImage",
      title: "Content Image",
      type: "image",
      description: "Image displayed alongside the rich text body content copy.",
      options: { hotspot: true },
      group: "content",
    }),

    // Events Section
    defineField({
      name: "eventsEyebrow",
      title: "Events Eyebrow",
      type: "string",
      group: "events",
      initialValue: "Coming up",
    }),
    defineField({
      name: "eventsHeadline",
      title: "Events Headline",
      type: "string",
      description:
        "Section heading. Wrap a phrase in *asterisks* to render it in red (e.g. 'Upcoming *events*').",
      group: "events",
      initialValue: "Upcoming *events*",
    }),
    defineField({
      name: "eventsImage",
      title: "Events Section Image",
      type: "image",
      description: "Image displayed alongside the in-page event details view.",
      options: { hotspot: true },
      group: "events",
    }),
    defineField({
      name: "noEventsHeadline",
      title: "No Events Headline",
      type: "string",
      description: "Shown when there are no upcoming events",
      group: "events",
      initialValue: "We're planning our next move.",
    }),
    defineField({
      name: "noEventsBody",
      title: "No Events Description",
      type: "text",
      rows: 2,
      description: "Supporting text when there are no upcoming events",
      group: "events",
      initialValue:
        "No events are scheduled right now, but we're always organizing. Join our mailing list below to be the first to know when something's coming up.",
    }),
    defineField({
      name: "noRsvpMessage",
      title: "No RSVP Message",
      type: "string",
      description: "Shown on non-Action Network events that don't require RSVP",
      group: "events",
      initialValue: "No RSVP required — just show up!",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home Page" }),
  },
})
