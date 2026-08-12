import { defineQuery } from "groq"

export const EVENT_CUSTOMIZATIONS_QUERY = defineQuery(`
  *[_type == "event" && defined(googleEventId)]{
    _id,
    googleEventId,
    featured,
    eventType,
    attendance,
    topics,
    workingGroup,
    rsvpLink,
    summary
  }
`)
