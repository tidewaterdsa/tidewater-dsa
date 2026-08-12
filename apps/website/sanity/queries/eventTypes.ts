import { defineQuery } from "groq"

export const EVENT_TYPES_QUERY = defineQuery(`
  *[_type == "eventTypes" && _id == "eventTypes"][0].types[]{
    label,
    "value": value.current,
    color,
    description
  }
`)
