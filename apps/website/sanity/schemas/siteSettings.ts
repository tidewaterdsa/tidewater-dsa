import { defineField, defineType } from "sanity"

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "cta", title: "Call-To-Action" },
    { name: "ribbon", title: "Top Ribbon" },
    { name: "banner", title: "Chapter Banner" },
    { name: "signup", title: "Signup Section" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      title: "Site Full Name",
      type: "string",
      description:
        "The chapter's full official name (e.g. 'Tidewater Democratic Socialists of America'). Used for SEO metadata, browser tab titles, and image alt text.",
    }),
    defineField({
      name: "siteShortName",
      title: "Site Short Name",
      type: "string",
      description:
        "Wordmark shown next to the logo in the header and footer (e.g. 'Tidewater DSA'). Leave blank to use Site Full Name in both places. Doesn't affect SEO, browser tab titles, or image alt text, those always use the full name.",
      initialValue: "Tidewater DSA",
    }),
    defineField({
      name: "logo",
      title: "Site Logo",
      type: "image",
      description:
        "Upload the main navigation logo (transparent PNG or SVG preferred)",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "logoTagline",
      title: "Logo Tagline",
      type: "string",
      description:
        "Small line shown next to the logo in the header (e.g. 'Hampton Roads · VA'). Leave blank to hide.",
      initialValue: "Hampton Roads · VA",
    }),

    // Navbar Section
    defineField({
      name: "mainNav",
      title: "Main Navigation",
      description: "Select the pages to appear in the top menu",
      type: "array",
      of: [
        {
          type: "reference",
          to: [
            { type: "page" },
            { type: "eventsPage" },
            { type: "chapterPrioritiesPage" },
            { type: "resourcesPage" },
            { type: "getInvolvedPage" },
            { type: "aboutPage" },
          ],
        },
      ],
    }),
    defineField({
      name: "callToActionText",
      title: "Header Call-To-Action Button Text",
      type: "string",
      description:
        "The text shown on the button in the navbar (e.g. 'Join Us', 'Donate')",
      group: "cta",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "callToActionLink",
      title: "Header Call-To-Action Button Link",
      type: "url",
      description:
        "Where the navbar button links to (e.g. a signup form, donation link)",
      group: "cta",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
    }),

    // Top ribbon
    defineField({
      name: "showRibbon",
      title: "Show Ribbon",
      type: "boolean",
      description:
        "When off, the small black bar at the very top of every page is hidden entirely.",
      group: "ribbon",
      initialValue: true,
    }),
    defineField({
      name: "ribbonText",
      title: "Ribbon Text",
      type: "string",
      description:
        "Short tagline shown on the left side of the ribbon (e.g. 'Hampton Roads, VA · Founded 2021'). Leave blank to hide the left side only.",
      group: "ribbon",
      initialValue: "Hampton Roads, VA · Founded 2021",
    }),
    defineField({
      name: "nextMeetingLabel",
      title: "Next Meeting Label",
      type: "string",
      description:
        "Prefix text before the auto-derived meeting date (e.g. 'Next general meeting'). The date and time are fetched from Google Calendar.",
      group: "ribbon",
      initialValue: "Next general meeting",
    }),
    defineField({
      name: "nextMeetingMatch",
      title: "Next Meeting Match",
      type: "string",
      description:
        "Substring used to identify which calendar event is the 'next meeting'. The site checks this (case-insensitive) against each event's RSVP link, event type, and title. Leave blank to skip the calendar lookup entirely.",
      group: "ribbon",
      initialValue: "general-meeting",
    }),
    defineField({
      name: "nextMeetingTextOverride",
      title: "Next Meeting Text Override",
      type: "string",
      description:
        "Optional. If filled, this string is shown verbatim on the right side of the ribbon, overriding the auto-derived value. Useful when you want to advertise something other than the next meeting.",
      group: "ribbon",
    }),
    defineField({
      name: "nextMeetingLinkOverride",
      title: "Next Meeting Link Override",
      type: "url",
      description:
        "Optional. Where the ribbon's right side links to. Defaults to the matched event's RSVP link, or /events if there's no RSVP.",
      group: "ribbon",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https"] }),
    }),

    // Chapter motto banner
    defineField({
      name: "bannerWords",
      title: "Banner Words",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Optional. Short words shown as the chapter-motto strip on the home page (e.g. 'Educate', 'Agitate', 'Organize'). They are separated by red star glyphs and rendered twice in a row to fill the band.",
      group: "banner",
      validation: (Rule) =>
        Rule.unique()
          .min(0)
          .custom((words) => {
            if (!words || words.length === 0) return true
            const empty = words.findIndex(
              (w) => typeof w !== "string" || w.trim().length === 0
            )
            return empty === -1 ? true : "Banner words can't be blank."
          }),
    }),

    // Signup Section
    defineField({
      name: "signupLink",
      title: "Action Network Newsletter Signup URL",
      description:
        "Paste the URL of your Action Network form exactly as it appears in your browser when you visit the form page (e.g. https://actionnetwork.org/forms/your-form-slug). The site handles the rest, you don't need an 'embed' or 'widget' URL.",
      type: "url",
      group: "signup",
      validation: (Rule) =>
        Rule.uri({ allowRelative: false, scheme: ["https"] }).custom(
          (value) => {
            // Empty is fine, the signup section renders a graceful fallback when no URL is set
            if (!value) return true

            let parsed: URL
            try {
              parsed = new URL(value)
            } catch {
              return "Must be a valid URL"
            }

            if (!parsed.hostname.endsWith("actionnetwork.org")) {
              return "Must be an actionnetwork.org URL. Other embed providers aren't currently supported."
            }

            const section = parsed.pathname.split("/")[1]
            if (section !== "forms") {
              return section === "events"
                ? "This is an event URL, not a signup form. Paste the URL of your newsletter form from Action Network."
                : "The URL should be an Action Network form page, like https://actionnetwork.org/forms/your-form-slug"
            }

            return true
          }
        ),
    }),
    defineField({
      name: "signupEyebrow",
      title: "Signup Eyebrow",
      type: "string",
      description:
        "Small mono label above the signup headline (e.g. 'Newsletter').",
      group: "signup",
      initialValue: "Newsletter",
    }),
    defineField({
      name: "signupHeadline",
      title: "Signup Headline",
      type: "string",
      description: "Heading shown above the email signup form.",
      group: "signup",
      initialValue: "Join the 757 with us.",
    }),
    defineField({
      name: "signupDescription",
      title: "Signup Description",
      type: "text",
      rows: 2,
      description: "Supporting text below the signup headline",
      group: "signup",
      initialValue:
        "Get the latest on meetings, events, and actions across the seven cities — straight to your inbox. Member-written, no spam, unsubscribe anytime.",
    }),

    // Footer
    defineField({
      name: "socialLinks",
      title: "Social Media Links",
      type: "array",
      description:
        "Add links to your social media profiles. These appear in the site footer.",
      group: "footer",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "platform",
              type: "string",
              title: "Platform (e.g., Instagram, X)",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "url",
              type: "url",
              title: "URL",
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "socialIconStyle",
      title: "Social Icon Style",
      type: "string",
      description: "How social media icons appear across the site",
      group: "footer",
      options: {
        list: [
          { title: "Outline — colored icons on white", value: "outline" },
          {
            title: "Filled — white icons on colored background",
            value: "filled",
          },
        ],
        layout: "radio",
      },
      initialValue: "outline",
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
      description:
        "Public email shown in the footer (e.g. tidewaterdsa@gmail.com)",
      group: "footer",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "contactEmailSubject",
      title: "Contact Email Subject Line",
      type: "string",
      description:
        "Pre-filled subject when someone clicks the email link (optional)",
      group: "footer",
    }),
    defineField({
      name: "footerTagline",
      title: "Footer Tagline",
      type: "text",
      rows: 3,
      description: "Short paragraph shown next to the footer logo.",
      group: "footer",
      initialValue:
        "Tidewater DSA is the Hampton Roads chapter of the Democratic Socialists of America. Workers organizing across the 757.",
    }),
    defineField({
      name: "footerNoteLeft",
      title: "Footer Note (Left)",
      type: "string",
      description:
        "Optional. Small text shown on the left side of the bottom footer bar. Leave blank to hide.",
      group: "footer",
      initialValue: "Tidewater DSA · Built by members",
    }),
    defineField({
      name: "footerNoteRight",
      title: "Footer Note (Right)",
      type: "string",
      description:
        "Optional. Small text shown on the right side of the bottom footer bar. Leave blank to hide.",
      group: "footer",
      initialValue: "In Solidarity",
    }),
    defineField({
      name: "footerColumns",
      title: "Footer Link Columns",
      type: "array",
      description:
        "Create columns of links for the footer. A good rule of thumb is to dedicate one column to chapter information (e.g., 'About Us', 'Who We Are') and another to actionable items (e.g., 'Get Involved', 'Resources').",
      group: "footer",
      validation: (Rule) =>
        Rule.max(4).error(
          "You can only add up to 4 columns to the footer to keep the design from breaking."
        ),
      initialValue: [
        { title: "Chapter", links: [] },
        { title: "Get Involved", links: [] },
      ],
      of: [
        {
          type: "object",
          name: "footerColumn",
          fields: [
            {
              name: "title",
              type: "string",
              title: "Column Title",
              description:
                "The public-facing heading displayed above this list of links (e.g., 'Chapter', 'Get Involved', 'Campaigns').",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "links",
              type: "array",
              title: "Links",
              of: [
                {
                  type: "object",
                  name: "footerLink",
                  fields: [
                    {
                      name: "label",
                      type: "string",
                      title: "Label",
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: "href",
                      type: "string",
                      title: "URL",
                      description:
                        "Path (like '/about-us') or full URL (like 'https://...').",
                      validation: (Rule) => Rule.required(),
                    },
                  ],
                  preview: { select: { title: "label", subtitle: "href" } },
                },
              ],
            },
          ],
          preview: { select: { title: "title" } },
        },
      ],
    }),
  ],

  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
})
