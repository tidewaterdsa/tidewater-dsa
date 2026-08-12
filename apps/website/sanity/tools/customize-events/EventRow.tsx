import { Box, Button, Card, Flex, Stack, Text } from "@sanity/ui"
import { EditIcon, StarIcon } from "@sanity/icons"
import type { EventWithCustomization, GoogleCalendarEventRow } from "./types"
import { formatEventMeta } from "@/lib/format"

const TDSA_RED = "#ff0101"

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
  creating: boolean
  featuring: boolean
  onCustomize: () => void
  onOpen: () => void
  onToggleFeatured: () => void
}

export const EventRow = ({
  event,
  creating,
  featuring,
  onCustomize,
  onOpen,
  onToggleFeatured,
}: EventRowProps) => {
  const customized = Boolean(event.customization)
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
          ? `3px solid ${TDSA_RED}`
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
              {featured && (
                <Text size={1} style={{ color: "#d97706" }}>
                  <StarIcon /> Featured
                </Text>
              )}
            </Flex>
            <Text size={1} muted>
              {formatMetaLine(event)}
            </Text>
          </Stack>

          <Flex gap={2} align="center" style={{ flexShrink: 0 }}>
            <Button
              icon={StarIcon}
              mode={featured ? "default" : "ghost"}
              tone={featured ? "caution" : "default"}
              title={featured ? "Unfeature this event" : "Feature this event"}
              onClick={onToggleFeatured}
              disabled={featuring}
              loading={featuring}
            />
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
                onClick={onCustomize}
                disabled={creating}
                loading={creating}
                style={{
                  backgroundColor: TDSA_RED,
                  color: "white",
                  border: "none",
                }}
              />
            )}
          </Flex>
        </Flex>
      </Box>
    </Card>
  )
}
