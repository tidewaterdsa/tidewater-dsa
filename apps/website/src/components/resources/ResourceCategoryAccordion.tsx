import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@tidewater-dsa/ui/components/accordion"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import { ResourceCard } from "./ResourceCard"
import {
  getCategoryLabel,
  getCategoryTheme,
} from "@/lib/resource-category-config"
import type { Resource } from "@/types"

export interface ResourceCategoryGroup {
  group: string
  items: Resource[]
}

interface ResourceCategoryAccordionProps {
  groups: ResourceCategoryGroup[]
  openValues: string[]
  onOpenChange: (next: string[]) => void
  onOpenResource: (resource: Resource) => void
}

export const categorySlug = (group: string): string =>
  `cat-${group.toLowerCase().replace(/[^a-z0-9]/g, "-")}`

export const ResourceCategoryAccordion = ({
  groups,
  openValues,
  onOpenChange,
  onOpenResource,
}: ResourceCategoryAccordionProps) => (
  <Accordion
    multiple
    value={openValues}
    onValueChange={onOpenChange}
    className="divide-y divide-border rounded-lg border-2"
  >
    {groups.map(({ group, items }) => {
      const theme = getCategoryTheme(group)
      const Icon = theme.icon
      const slug = categorySlug(group)
      return (
        <AccordionItem
          key={slug}
          value={slug}
          id={slug}
          className="scroll-mt-4"
        >
          <AccordionTrigger className="group/trigger items-center gap-3 py-4 hover:no-underline">
            <span
              aria-hidden
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-sm text-white transition-transform group-hover/trigger:scale-105",
                theme.accentClass
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="flex flex-1 gap-2.5 text-left">
              <span className="heading-display text-lg leading-none">
                {getCategoryLabel(group)}
              </span>
              <span
                className={cn(
                  "mono-eyebrow-sm inline-flex h-5 min-w-5 items-center justify-center rounded-sm px-1.5 tabular-nums",
                  theme.pillClass
                )}
              >
                {items.length}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((r) => (
                <ResourceCard key={r.id} resource={r} onOpen={onOpenResource} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )
    })}
  </Accordion>
)
