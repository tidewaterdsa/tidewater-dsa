import { useEffect, useMemo, useRef } from "react"
import { Card, Flex, Stack, Text } from "@sanity/ui"
import { SortIcon } from "@sanity/icons"
import { toast } from "sonner"
import {
  getValueAtPath,
  type ArrayOfObjectsInputProps,
  type ArrayOfPrimitivesInputProps,
  type ObjectItem,
} from "sanity"
import { usePublishState } from "./publishState"

type ArrayInputProps = ArrayOfObjectsInputProps | ArrayOfPrimitivesInputProps
type ArrayItem = ObjectItem | string | number | boolean

/** Per-item identity, so a move reads differently from an add, remove, or edit. */
const itemIds = (value: ArrayItem[] | undefined): string[] =>
  (value ?? []).map((item) =>
    typeof item === "object" && item !== null ? item._key : String(item)
  )

// Compared element by element rather than joined into one string: a primitive
// array's ids are its own values, so no separator is safe to flatten them with.
const sameSequence = (a: string[], b: string[]) =>
  a.every((id, index) => id === b[index])

/** Same items, different positions. Anything else is a content change. */
const isReorderOf = (published: string[], draft: string[]) => {
  if (published.length < 2 || published.length !== draft.length) return false
  if (sameSequence(published, draft)) return false

  return sameSequence([...published].sort(), [...draft].sort())
}

/**
 * Dragging rows is the one edit that leaves no visible trace in the form, so the
 * new order gets called out until it is published. Derived from the live
 * document rather than remembered, so it survives a reload and clears itself.
 */
export const ArrayReorderNotice = (props: ArrayInputProps) => {
  const { publishedDocument } = usePublishState()
  const { path, value, id, schemaType } = props

  const orderChanged = useMemo(() => {
    if (!publishedDocument) return false
    const published = getValueAtPath(publishedDocument, path) as
      | ArrayItem[]
      | undefined
    return isReorderOf(itemIds(published), itemIds(value as ArrayItem[]))
  }, [publishedDocument, path, value])

  // Seeded with the current state so reopening a reordered draft doesn't toast.
  const wasChanged = useRef(orderChanged)

  useEffect(() => {
    if (orderChanged && !wasChanged.current) {
      const title = schemaType.title ?? schemaType.name
      toast.warning("New order not published yet", {
        id: `reorder-${id}`,
        description: `${title} is reordered in your draft only. Hit Publish to update the website.`,
        duration: 8000,
      })
    }
    wasChanged.current = orderChanged
  }, [orderChanged, id, schemaType])

  return (
    <Stack space={3}>
      {orderChanged && (
        <Card tone="caution" padding={3} radius={2} border>
          <Flex align="flex-start" gap={3}>
            <Text size={1}>
              <SortIcon />
            </Text>
            <Text size={1}>
              <strong>New order not published yet.</strong> The website keeps
              showing the old order until you hit <strong>Publish</strong>.
            </Text>
          </Flex>
        </Card>
      )}

      {props.renderDefault(props)}
    </Stack>
  )
}
