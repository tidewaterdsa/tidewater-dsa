import { Button, Flex, Menu, MenuButton, MenuItem, Text } from "@sanity/ui"
import { ChevronDownIcon } from "@sanity/icons"

interface FilterOption {
  value: string
  label: string
}

interface FilterDropdownProps {
  label: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}

export const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
}: FilterDropdownProps) => {
  const current = options.find((o) => o.value === value)

  return (
    <MenuButton
      id={`filter-${label}`}
      button={
        <Button mode="ghost" padding={3}>
          <Flex align="center" gap={2}>
            <Text size={1} muted>
              {label}:
            </Text>
            <Text size={1} weight="medium">
              {current?.label ?? value}
            </Text>
            <Text size={1} muted>
              <ChevronDownIcon />
            </Text>
          </Flex>
        </Button>
      }
      menu={
        <Menu>
          {options.map((o) => (
            <MenuItem
              key={o.value}
              text={o.label}
              onClick={() => onChange(o.value)}
              pressed={o.value === value}
            />
          ))}
        </Menu>
      }
    />
  )
}
