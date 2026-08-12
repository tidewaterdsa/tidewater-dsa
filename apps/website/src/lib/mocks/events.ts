import type { SerializedEvent } from "@/types"

/**
 * Mock events for local development without Google Calendar credentials.
 *
 * Spread from 1 month back to 3 months forward so the calendar's
 * navigation works naturally in dev.
 *
 * Note on taxonomy fields: `eventType` and `workingGroup` here are slugs (kebab-case),
 * matching what the app expects post-taxonomy.
 * For dev admins to see friendly labels on the rendered page,
 * the Event Types and Working Groups singletons in Studio need entries whose slugs match the ones used here:
 *   - Event types: meeting, training, social, mutual-aid, fundraiser,
 *     canvass, rally, 101-intro
 *   - Working groups: labor, mutual-aid, political-education, healthcare
 * If the taxonomy entries don't exist yet, the filter chips still
 * work (against slug strings) and the dialog falls back to showing the slug as the badge label.
 */

const now = new Date()
const thisMonth = now.getMonth()
const thisYear = now.getFullYear()

/** Build an ISO string from month offset + day of month + time. */
const dateAt = (
  monthOffset: number,
  dayOfMonth: number,
  hour = 0,
  minute = 0
): string => {
  const d = new Date(
    thisYear,
    thisMonth + monthOffset,
    dayOfMonth,
    hour,
    minute
  )
  return d.toISOString()
}

export const getMockEvents = (
  rangeStart: Date,
  rangeEnd: Date
): SerializedEvent[] => {
  return ALL_MOCKS.filter((e) => {
    const start = new Date(e.startISO)
    const end = new Date(e.endISO)
    return start <= rangeEnd && end >= rangeStart
  })
}

const ALL_MOCKS: SerializedEvent[] = [
  // ----- Last month -----
  {
    id: "mock-prev-1",
    title: "Solidarity Picket: Amazon Warehouse",
    description:
      "Join us in solidarity with striking Amazon workers. Bring signs.",
    location: "Amazon Fulfillment Center, Chesapeake",
    startISO: dateAt(-1, 15, 10, 0),
    endISO: dateAt(-1, 15, 12, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=1",
    featured: false,
    eventType: "action",
    attendance: "in_person",
    topics: ["labor", "solidarity"],
    workingGroup: "labor",
    rsvpLink: null,
    summary: null,
  },
  {
    id: "mock-prev-2",
    title: "General Body Meeting",
    description: "Monthly GBM. Agenda posted in Slack the day before.",
    location: "Slover Library, Norfolk",
    startISO: dateAt(-1, 22, 18, 30),
    endISO: dateAt(-1, 22, 20, 30),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=2",
    featured: false,
    eventType: "meeting",
    attendance: "hybrid",
    topics: [],
    workingGroup: null,
    rsvpLink: null,
    summary: null,
  },

  // ----- This month -----
  {
    id: "mock-1",
    title: "Member Leader 101 & 201",
    description:
      "Free brake light repairs for the community. Donations accepted but not required.\n\nBring snacks if you can.",
    location: null,
    startISO: dateAt(0, 25, 18, 0),
    endISO: dateAt(0, 25, 19, 30),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=3",
    featured: true,
    eventType: "meeting",
    attendance: "virtual",
    topics: ["mutual aid", "community"],
    workingGroup: "mutual-aid",
    rsvpLink: "https://actionnetwork.org/events/member-leader-101-201-3/",
    summary:
      "Learn how to get more active at TDSA and increase your activism and political efficacy at our Member Leader 101 and 201 training sessions! These seminars aim to increase the robustness and knowledgeability of our membership while also helping teach the basic principles of socialism.",
  },
  {
    id: "mock-2",
    title: "UNITE HERE Organizing Training",
    description:
      "Join us for labor organizing training hosted by UNITE HERE. Please note that space is limited to 10 participant",
    location: "Jordan-Newby Library - 1425 Norchester Ave, Norfolk",
    startISO: dateAt(0, 27, 11, 0),
    endISO: dateAt(0, 27, 13, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=3",
    featured: true,
    eventType: "meeting",
    attendance: "in_person",
    topics: ["political education"],
    workingGroup: "political-education",
    rsvpLink: "https://actionnetwork.org/events/unite-here-organizing-training",
    summary: null,
  },
  // {
  //   id: "mock-3",
  //   title: "Deflock Debrief Meeting",
  //   description:
  //     "IThis meeting is to discuss the result of Tidewater DSA's participation in a Norfolk Deflock campaign, what worked, what didn't work, what we have learned, what changes we should make based on what we learned.",
  //   location: null,
  //   startISO: dateAt(1, 1, 11, 0),
  //   endISO: dateAt(1, 1, 14, 0),
  //   isAllDay: false,
  //   googleUrl: "https://calendar.google.com/event?mock=5",
  //   featured: false,
  //   eventType: "meeting",
  //   attendance: "virtual",
  //   topics: ["deflock"],
  //   workingGroup: null,
  //   rsvpLink: "https://actionnetwork.org/events/deflock-debrief-meeting",
  //   summary:
  //     "Annual May Day march and rally. Workers' holiday, workers' power.",
  // },

  // ----- Next month -----
  {
    id: "mock-next-1",
    title: "Mutual Aid Day at Kearney Park",
    description:
      "We will be distributing food and supplies to anyone who needs it.",
    location: "Kearney Park, W County St, Hampton, VA 23663",
    startISO: dateAt(1, 11, 11, 30),
    endISO: dateAt(1, 11, 13, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=6",
    featured: true,
    eventType: "action",
    attendance: "in_person",
    topics: ["mutual-aid"],
    workingGroup: "mutual-aid",
    rsvpLink: null,
    summary: null,
  },
  {
    id: "mock-next-2",
    title: "Fascism and Social Revolution: Session 5: Sections IX and X",
    description:
      "Join us for a discussion for everything we need to improve our mutual aid program, strategize its growth, and keep it running smoothly.",
    location: null,
    startISO: dateAt(1, 16, 18, 30),
    endISO: dateAt(1, 16, 8, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=7",
    featured: false,
    eventType: "meeting",
    attendance: "virtual",
    topics: ["mutual-aid"],
    workingGroup: null,
    rsvpLink:
      "https://actionnetwork.org/events/fascism-and-social-revolution-session-5-sections-ix-and-x",
    summary: null,
  },
  {
    id: "mock-next-3",
    title: "Mutual Aid Planning Meeting",
    description:
      "Join us for a discussion for everything we need to improve our mutual aid program, strategize its growth, and keep it running smoothly.",
    location: null,
    startISO: dateAt(1, 17, 9, 0),
    endISO: dateAt(1, 17, 12, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=7",
    featured: false,
    eventType: "action",
    attendance: "virtual",
    topics: ["mutual-aid"],
    workingGroup: "mutual-aid",
    rsvpLink: "https://actionnetwork.org/events/mutual-aid-planning-meeting-12",
    summary: null,
  },

  // ----- Month + 2 -----
  {
    id: "mock-f2-1",
    title: "Pride March Contingent",
    description: "Join the DSA contingent at the Pride march.",
    location: "Corner of Freemason & Boush",
    startISO: dateAt(2, 7, 10, 0),
    endISO: dateAt(2, 7, 13, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=9",
    featured: true,
    eventType: "action",
    attendance: "in_person",
    topics: ["lgbtq+", "solidarity"],
    workingGroup: null,
    rsvpLink: null,
    summary:
      "Marching together at Pride. Meet at the corner — look for the DSA banner.",
  },
  {
    id: "mock-f2-2",
    title: "Monthly General Meeting",
    description: "Monthly GBM.",
    location: "Community Center, 123 Main St",
    startISO: dateAt(2, 9, 19, 0),
    endISO: dateAt(2, 9, 21, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=10",
    featured: false,
    eventType: "meeting",
    attendance: "hybrid",
    topics: [],
    workingGroup: null,
    rsvpLink: "https://actionnetwork.org/events/general-meeting-month-plus-2",
    summary: null,
  },
  {
    id: "mock-f2-3",
    title: "Book Club Potluck",
    description: "End-of-semester potluck. Bring a dish.",
    location: "A member's home (RSVP for address)",
    startISO: dateAt(2, 23, 17, 0),
    endISO: dateAt(2, 23, 21, 0),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=11",
    featured: false,
    eventType: "social",
    attendance: "in_person",
    topics: [],
    workingGroup: null,
    rsvpLink: null,
    summary: null,
  },

  // ----- Month + 3 — no featured events (test empty state) -----
  {
    id: "mock-f3-1",
    title: "Summer Retreat Planning Meeting",
    description: "Planning committee for the summer retreat.",
    location: null,
    startISO: dateAt(3, 4, 19, 0),
    endISO: dateAt(3, 4, 20, 30),
    isAllDay: false,
    googleUrl: "https://calendar.google.com/event?mock=12",
    featured: false,
    eventType: "meeting",
    attendance: "virtual",
    topics: [],
    workingGroup: null,
    rsvpLink: null,
    summary: null,
  },
  {
    id: "mock-f3-2",
    title: "Organizer Training Weekend",
    description: "Two-day intensive organizer training.",
    location: "Union Hall, 200 Workers Ave",
    startISO: dateAt(3, 14, 0, 0),
    endISO: dateAt(3, 15, 23, 59),
    isAllDay: true,
    googleUrl: "https://calendar.google.com/event?mock=13",
    featured: false,
    eventType: "training",
    attendance: "in_person",
    topics: ["organizing"],
    workingGroup: null,
    rsvpLink: null,
    summary: null,
  },
]
