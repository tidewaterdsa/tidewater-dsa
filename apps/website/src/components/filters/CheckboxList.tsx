import type { ReactNode } from "react"
import { Checkbox } from "@tidewater-dsa/ui/components/checkbox"

export const FilterSectionHeading = ({ children }: { children: ReactNode }) => (
  <h4 className="mono-eyebrow mb-3 text-primary">{children}</h4>
)

interface CheckboxListItem {
  value: string
  count?: number
  renderLabel?: (value: string) => ReactNode
}

const normalizeItem = (item: CheckboxListItem | string): CheckboxListItem =>
  typeof item === "string" ? { value: item } : item

interface CheckboxListProps {
  items: CheckboxListItem[] | string[]
  selected: string[]
  onToggle: (value: string) => void
  emptyLabel: string
  idPrefix: string
}

export const CheckboxList = ({
  items,
  selected,
  onToggle,
  emptyLabel,
  idPrefix,
}: CheckboxListProps) => {
  if (items.length === 0) {
    return <p className="text-xs text-foreground-soft italic">{emptyLabel}</p>
  }

  return (
    <ul className="space-y-2.5">
      {items.map((raw) => {
        const item = normalizeItem(raw)
        const isSelected = selected.includes(item.value)
        const id = `${idPrefix}-${item.value}`

        return (
          <li key={item.value} className="flex items-center gap-2.5">
            <Checkbox
              id={id}
              checked={isSelected}
              onCheckedChange={() => onToggle(item.value)}
              className="cursor-pointer"
            />
            <label
              htmlFor={id}
              className="flex flex-1 cursor-pointer items-center gap-1.5 text-sm leading-none text-foreground"
            >
              {item.renderLabel ? item.renderLabel(item.value) : item.value}
            </label>
            {typeof item.count === "number" && (
              <span className="mono-eyebrow text-xs text-foreground-soft tabular-nums">
                {item.count}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
