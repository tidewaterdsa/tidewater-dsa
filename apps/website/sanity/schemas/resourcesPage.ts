import { defineField, defineType } from "sanity"
import { defineRichTextBody } from "./richTextFields"
import { defineShowSignupField } from "./showSignupField"

export const resourcesPageType = defineType({
  name: "resourcesPage",
  title: "Resources Page",
  type: "document",
  groups: [
    { name: "header", title: "Page Header", default: true },
    { name: "member", title: "Member Resources" },
    { name: "community", title: "Community Resources" },
    { name: "data", title: "Data Source" },
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
      initialValue: "Resources",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Page Eyebrow",
      type: "string",
      description:
        "Small mono label above the page headline (e.g. 'Local support').",
      group: "header",
      initialValue: "Local support",
    }),
    defineField({
      name: "headline",
      title: "Page Headline",
      type: "string",
      description:
        "Page-level h1. Wrap a phrase in *asterisks* to render it in red (e.g. '*Resources*').",
      group: "header",
      initialValue: "Resources",
      validation: (Rule) => Rule.required(),
    }),
    defineRichTextBody({
      name: "intro",
      title: "Page Intro",
      description: "Rich text content below the page headline.",
      group: "header",
      allowImages: false,
    }),

    // Member Section
    defineField({
      name: "memberEyebrow",
      title: "Member Section Eyebrow",
      type: "string",
      description:
        "Small mono label above the Member Resources section heading.",
      group: "member",
      initialValue: "For members",
    }),
    defineField({
      name: "memberHeadline",
      title: "Member Section Headline",
      type: "string",
      description:
        "Section h2 for the member resources block. Asterisk syntax supported (e.g. 'Member *resources*').",
      group: "member",
      initialValue: "Member *resources*",
      validation: (Rule) => Rule.required(),
    }),
    defineRichTextBody({
      title: "Member Resources Content",
      description:
        "Rich text that appears in the Member Resources section (chapter constitution, working group handbooks, etc).",
      group: "member",
    }),

    // Community Resources Section
    defineField({
      name: "communityEyebrow",
      title: "Community Section Eyebrow",
      type: "string",
      description:
        "Small mono label above the Community Resources section heading.",
      group: "community",
      initialValue: "For everyone",
    }),
    defineField({
      name: "communityHeadline",
      title: "Community Section Headline",
      type: "string",
      description:
        "Section h2 for the community resources directory. Asterisk syntax supported (e.g. 'Community *resources*').",
      group: "community",
      initialValue: "Community *resources*",
      validation: (Rule) => Rule.required(),
    }),
    defineRichTextBody({
      name: "communityIntro",
      title: "Community Section Intro",
      description:
        "Short rich-text intro shown above the resource directory toolbar.",
      group: "community",
      allowImages: false,
    }),
    defineField({
      name: "disclaimerText",
      title: "Disclaimer Text",
      type: "string",
      group: "community",
      description:
        "Disclaimer shown below the filters before the resources list.",
      initialValue:
        "Resources change. Please verify details directly with each organization before visiting.",
    }),
    defineField({
      name: "printFooterText",
      title: "Print Footer Text",
      type: "string",
      group: "community",
      description:
        "Shown at the bottom of the printed / downloaded version of this directory.",
      initialValue:
        "Resources compiled by Tidewater DSA. Verify details before visiting. Data may change — visit our website for the latest.",
    }),

    // Data source
    defineField({
      name: "googleSheetId",
      title: "Google Sheet ID",
      type: "string",
      group: "data",
      description:
        "The long ID from the sheet URL: docs.google.com/spreadsheets/d/THIS_PART/edit. The sheet must be shared as 'Anyone with the link, Viewer'.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "googleSheetRange",
      title: "Sheet Range (A1 notation)",
      type: "string",
      group: "data",
      description:
        "A1-notation range, e.g. 'Program Form Responses!A:X'. Defaults to 'A:X' if left blank.",
      initialValue: "Program Form Responses!A:X",
    }),
    defineShowSignupField({ initialValue: false, group: "signup" }),
  ],
  preview: {
    prepare: () => ({ title: "Resources Page" }),
  },
})
