import { useCallback, useEffect, useMemo, useRef } from "react"
import { Button, Card, Flex, Stack, Text } from "@sanity/ui"
import { PublishIcon, WarningOutlineIcon } from "@sanity/icons"
import {
  getPublishedId,
  useDocumentOperation,
  useDocumentOperationEvent,
  useEditState,
  useFormValue,
  type ObjectInputProps,
} from "sanity"
import { toast } from "sonner"
import { hasContentChanges } from "./hasContentChanges"
import { PublishStateContext } from "./publishState"

/**
 * Wraps the root of every document form. Admins kept editing, walking away, and
 * assuming the site had updated, so unpublished changes now get a sticky banner
 * with its own Publish button instead of only the button in the pane footer.
 */
export const DocumentPublishBanner = (props: ObjectInputProps) => {
  const id = useFormValue(["_id"]) as string | undefined
  const type = useFormValue(["_type"]) as string | undefined

  // A brand new document renders before _id lands, and has nothing live to
  // compare against anyway.
  if (!id || !type) return props.renderDefault(props)

  return <Banner props={props} publishedId={getPublishedId(id)} type={type} />
}

const Banner = ({
  props,
  publishedId,
  type,
}: {
  props: ObjectInputProps
  publishedId: string
  type: string
}) => {
  const editState = useEditState(publishedId, type)
  const { publish } = useDocumentOperation(publishedId, type)
  const event = useDocumentOperationEvent(publishedId, type)

  const { ready, liveEdit, draft, published } = editState ?? {}

  // liveEdit types (and checked-out release versions) have no draft step.
  const hasUnpublishedChanges = useMemo(
    () => Boolean(ready) && !liveEdit && hasContentChanges(draft, published),
    [ready, liveEdit, draft, published]
  )

  const publishState = useMemo(
    () => ({ hasUnpublishedChanges, publishedDocument: published ?? null }),
    [hasUnpublishedChanges, published]
  )

  // Only report on publishes started from this banner, not from the footer.
  const awaitingPublish = useRef(false)

  const handlePublish = useCallback(() => {
    if (publish.disabled) return
    awaitingPublish.current = true
    publish.execute()
  }, [publish])

  useEffect(() => {
    if (!awaitingPublish.current || hasUnpublishedChanges) return
    awaitingPublish.current = false
    toast.success("Published", {
      description: "Your changes are now live on the website.",
    })
  }, [hasUnpublishedChanges])

  useEffect(() => {
    if (!awaitingPublish.current) return
    if (event?.type !== "error" || event.op !== "publish") return
    awaitingPublish.current = false
    toast.error("Could not publish", { description: event.error.message })
  }, [event])

  return (
    <PublishStateContext.Provider value={publishState}>
      <Stack space={4}>
        {hasUnpublishedChanges && (
          // Inherits the form's background so the form scrolls under the gap
          // rather than through it.
          <Card
            tone="inherit"
            paddingY={2}
            style={{ position: "sticky", top: 0, zIndex: 100 }}
          >
            <Card tone="caution" padding={3} radius={3} shadow={2} border>
              <Flex align="center" gap={3}>
                <Text size={3}>
                  <WarningOutlineIcon />
                </Text>

                <Stack space={2} flex={1}>
                  <Text size={1} weight="semibold">
                    Unpublished changes
                  </Text>
                  <Text size={1} muted>
                    Your edits are saved as a draft. Nothing here, including the
                    order of any lists, shows up on the website until you
                    publish.
                  </Text>
                </Stack>

                <Button
                  icon={PublishIcon}
                  text="Publish"
                  tone="primary"
                  fontSize={1}
                  padding={3}
                  disabled={Boolean(publish.disabled)}
                  onClick={handlePublish}
                />
              </Flex>
            </Card>
          </Card>
        )}

        {props.renderDefault(props)}
      </Stack>
    </PublishStateContext.Provider>
  )
}
