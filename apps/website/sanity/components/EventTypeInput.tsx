import type { StringInputProps } from "sanity"
import { TaxonomySelectInput } from "./TaxonomySelectInput"

const EVENT_TYPES_QUERY = `
  *[_type == "eventTypes" && _id == "eventTypes"][0].types[]{
    label,
    value
  }
`

export const EventTypeInput = (props: StringInputProps) => (
  <TaxonomySelectInput
    {...props}
    query={EVENT_TYPES_QUERY}
    labels={{
      taxonomyName: "event types",
      settingsDocName: "Event Types",
    }}
  />
)
