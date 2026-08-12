import type { StringInputProps } from "sanity"
import { TaxonomySelectInput } from "./TaxonomySelectInput"

const WORKING_GROUPS_QUERY = `
  *[_type == "workingGroups" && _id == "workingGroups"][0].groups[]{
    label,
    value
  }
`

export const WorkingGroupInput = (props: StringInputProps) => (
  <TaxonomySelectInput
    {...props}
    query={WORKING_GROUPS_QUERY}
    labels={{
      taxonomyName: "working groups",
      settingsDocName: "Working Groups",
    }}
  />
)
