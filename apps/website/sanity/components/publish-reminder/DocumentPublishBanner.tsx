import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Box, Button, Card, Flex, Stack, Text } from "@sanity/ui"
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

/** Nearest ancestor that actually scrolls, or null when the page itself does. */
const findScrollParent = (element: HTMLElement): HTMLElement | null => {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = window.getComputedStyle(node)
    if (overflowY === "auto" || overflowY === "scroll") return node
  }
  return null
}

/** The pane header belonging to the pane this element sits in. */
const findPaneHeader = (element: HTMLElement): HTMLElement | null => {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const header = node.querySelector(':scope > [data-testid="pane-header"]')
    if (header instanceof HTMLElement) return header
  }
  return null
}

/**
 * How far down the banner has to pin to clear the pane header.
 *
 * On a wide layout the document panel scrolls itself and the header sits outside
 * that scroller, so zero. Sanity drops the inner scroller on the collapsed (phone)
 * layout and scrolls the whole pane instead — the header is then a sticky sibling
 * inside the same scrollport, floating over the form, and a banner pinned at zero
 * hides behind it. Measured rather than hardcoded so it tracks a header that
 * grows, and both layouts run the same code path.
 */
const useHeaderOffset = (element: HTMLElement | null): number => {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (!element) return

    let observer: ResizeObserver | null = null

    const measure = () => {
      observer?.disconnect()
      observer = null

      const scrollParent = findScrollParent(element) ?? document.documentElement
      const header = findPaneHeader(element)

      if (!header || !scrollParent.contains(header)) {
        setOffset(0)
        return
      }

      // Fires on observe, so this covers the initial measurement too.
      observer = new ResizeObserver(([entry]) =>
        setOffset(entry.target.getBoundingClientRect().height)
      )
      observer.observe(header)
    }

    measure()

    // Crossing the collapse breakpoint swaps which element scrolls.
    window.addEventListener("resize", measure)

    return () => {
      window.removeEventListener("resize", measure)
      observer?.disconnect()
    }
  }, [element])

  return offset
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
  const [root, setRoot] = useState<HTMLDivElement | null>(null)
  const headerOffset = useHeaderOffset(root)

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
      <div ref={setRoot}>
        {hasUnpublishedChanges && (
          // Inherits the form's background so the form scrolls under the gap
          // rather than through it.
          <Card
            tone="inherit"
            paddingTop={2}
            paddingBottom={4}
            style={{ position: "sticky", top: headerOffset, zIndex: 100 }}
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

                  {/* Phones get the short version. The full sentence wraps to five
                      lines at 375px, and this banner is pinned over the form. */}
                  <Box display={["block", "block", "none"]}>
                    <Text size={1} muted>
                      Drafts, list order included, stay off the website until
                      you publish.
                    </Text>
                  </Box>

                  <Box display={["none", "none", "block"]}>
                    <Text size={1} muted>
                      Your edits are saved as a draft. Nothing here, including
                      the order of any lists, shows up on the website until you
                      publish.
                    </Text>
                  </Box>
                </Stack>

                <Box flex="none">
                  <Button
                    icon={PublishIcon}
                    text="Publish"
                    tone="primary"
                    fontSize={1}
                    padding={3}
                    disabled={Boolean(publish.disabled)}
                    onClick={handlePublish}
                  />
                </Box>
              </Flex>
            </Card>
          </Card>
        )}

        {props.renderDefault(props)}
      </div>
    </PublishStateContext.Provider>
  )
}
