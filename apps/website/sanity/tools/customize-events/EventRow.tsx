import { Box, Button, Card, Flex, Stack, Text } from "@sanity/ui"
import { EditIcon, LaunchIcon, StarIcon } from "@sanity/icons"
import type { EventWithCustomization, GoogleCalendarEventRow } from "./types"
import { DSA_RED } from "../../theme"
import { formatEventMeta } from "@/lib/format"

/** Format the date/time + location line shown under each event's title. */
const formatMetaLine = (event: GoogleCalendarEventRow): string => {
  const parts: string[] = []

  if (event.startISO) {
    parts.push(formatEventMeta(event.startISO, event.isAllDay))
  }
  if (event.location) parts.push(event.location)

  return parts.join(" • ")
}

interface EventRowProps {
  event: EventWithCustomization
  featuring: boolean
  onOpen: () => void
  onToggleFeatured: () => void
}

export const EventRow = ({
  event,
  featuring,
  onOpen,
  onToggleFeatured,
}: EventRowProps) => {
  const customized = event.isCustomized
  const featured = event.customization?.featured
  const eventType = event.customization?.eventType

  return (
    <Card
      padding={0}
      radius={2}
      border
      tone={customized ? "default" : "transparent"}
      style={{
        borderLeft: customized
          ? `3px solid ${DSA_RED}`
          : "3px solid rgba(0, 0, 0, 0.08)",
      }}
    >
      <Box padding={4}>
        <Flex align="center" justify="space-between" gap={3} wrap="wrap">
          <Stack space={2} flex={1} style={{ minWidth: 0 }}>
            <Flex align="center" gap={2} wrap="wrap">
              <Text size={2} weight="medium">
                {event.title}
              </Text>
              {eventType && (
                <Card padding={1} radius={2} tone="primary">
                  <Text size={0}>{eventType}</Text>
                </Card>
              )}
            </Flex>
            <Text size={1} muted>
              {formatMetaLine(event)}
            </Text>
          </Stack>

          <Flex gap={2} align="center" style={{ flexShrink: 0 }}>
            <Button
              icon={StarIcon}
              text={featured ? "Featured" : "Feature"}
              mode={featured ? "default" : "ghost"}
              tone="caution"
              title={
                featured
                  ? "Remove from Featured Events"
                  : "Show in Featured Events"
              }
              onClick={onToggleFeatured}
              disabled={featuring}
            />
            {event.htmlLink && (
              <Button
                icon={LaunchIcon}
                mode="ghost"
                title="Open in Google Calendar"
                // Sanity UI's Button has no `as` prop, so this can't be an anchor.
                onClick={() =>
                  window.open(event.htmlLink, "_blank", "noopener,noreferrer")
                }
              />
            )}
            {customized ? (
              <Button
                icon={EditIcon}
                mode="ghost"
                text="Edit"
                onClick={onOpen}
              />
            ) : (
              <Button
                text="Customize"
                mode="default"
                tone="primary"
                onClick={onOpen}
              />
            )}
          </Flex>
        </Flex>
      </Box>
    </Card>
  )
}
