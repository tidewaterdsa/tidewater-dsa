import { defineQuery } from "groq"

export const WORKING_GROUPS_QUERY = defineQuery(`
  *[_type == "workingGroups" && _id == "workingGroups"][0].groups[]{
    label,
    "value": value.current,
    description
  }
`)
