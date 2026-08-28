import { set, unset, type StringInputProps } from "sanity"
import {
  Box,
  Button,
  Card,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  Text,
} from "@sanity/ui"
import { ChevronDownIcon } from "@sanity/icons"
import {
  EVENT_COLORS,
  EVENT_TYPE_PALETTE_SLUGS,
  type EventTypeColor,
} from "@/lib/event-type-config"

interface SwatchProps {
  hex: string
}

const Swatch = ({ hex }: SwatchProps) => (
  <Box
    style={{
      width: 14,
      height: 14,
      borderRadius: 3,
      backgroundColor: hex,
      flexShrink: 0,
    }}
  />
)

export const ColorPickerInput = ({
  value,
  onChange,
  readOnly,
  elementProps,
}: StringInputProps) => {
  const currentSlug = value as EventTypeColor | undefined
  const isValid = currentSlug && currentSlug in EVENT_COLORS

  const selectedHex = isValid ? EVENT_COLORS[currentSlug].hex : null
  const selectedLabel = isValid ? EVENT_COLORS[currentSlug].label : null

  const handleSelect = (next: string | null) => {
    onChange(next ? set(next) : unset())
  }

  const summary = selectedHex ? (
    <>
      <Swatch hex={selectedHex} />
      <Text size={2}>{selectedLabel}</Text>
    </>
  ) : (
    <Text size={2} muted>
      Select a color…
    </Text>
  )

  if (readOnly) {
    return (
      <Card padding={3} radius={2} border tone="transparent">
        <Flex align="center" gap={2} style={{ opacity: 0.6 }}>
          {summary}
        </Flex>
      </Card>
    )
  }

  return (
    <MenuButton
      id={elementProps.id}
      button={
        <Button mode="ghost" padding={3} style={{ width: "100%" }}>
          <Flex align="center" justify="space-between" gap={2}>
            <Flex align="center" gap={2} flex={1}>
              {summary}
            </Flex>
            <Text size={2} muted>
              <ChevronDownIcon />
            </Text>
          </Flex>
        </Button>
      }
      popover={{
        portal: true,
        placement: "bottom-start",
        matchReferenceWidth: true,
      }}
      menu={
        <Menu>
          {EVENT_TYPE_PALETTE_SLUGS.map((slug) => (
            <MenuItem
              key={slug}
              onClick={() => handleSelect(slug)}
              pressed={slug === value}
              padding={3}
            >
              <Flex align="center" gap={3}>
                <Swatch hex={EVENT_COLORS[slug].hex} />
                <Text size={2}>{EVENT_COLORS[slug].label}</Text>
              </Flex>
            </MenuItem>
          ))}
        </Menu>
      }
    />
  )
}
