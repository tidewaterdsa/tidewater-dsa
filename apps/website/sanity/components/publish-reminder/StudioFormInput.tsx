import {
  isArrayOfBlocksInputProps,
  isArrayOfObjectsInputProps,
  isArrayOfPrimitivesInputProps,
  isObjectInputProps,
  type ArraySchemaType,
  type InputProps,
} from "sanity"
import { DocumentPublishBanner } from "./DocumentPublishBanner"
import { ArrayReorderNotice } from "./ArrayReorderNotice"

const isSortable = (schemaType: ArraySchemaType) =>
  (schemaType.options as { sortable?: boolean } | undefined)?.sortable !== false

/**
 * Config-level input, so it applies to every document in the Studio.
 * Resolution runs outside-in, so schema-level inputs still render underneath.
 */
export const StudioFormInput = (props: InputProps) => {
  if (props.path.length === 0 && isObjectInputProps(props)) {
    return <DocumentPublishBanner {...props} />
  }

  // Portable Text goes through the same array input, but moving blocks around is
  // part of writing rather than a deliberate reorder, so it stays quiet.
  const isReorderable =
    (isArrayOfObjectsInputProps(props) && !isArrayOfBlocksInputProps(props)) ||
    isArrayOfPrimitivesInputProps(props)

  if (isReorderable && isSortable(props.schemaType)) {
    return <ArrayReorderNotice {...props} />
  }

  return props.renderDefault(props)
}
