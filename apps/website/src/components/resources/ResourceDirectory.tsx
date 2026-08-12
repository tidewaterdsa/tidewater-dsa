import type { RefObject } from "react"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import { ScrollArea } from "@tidewater-dsa/ui/components/scroll-area"
import {
  ResourceCategoryAccordion,
  type ResourceCategoryGroup,
} from "./ResourceCategoryAccordion"
import { ResourceJumpNav } from "./ResourceJumpNav"
import type { Resource } from "@/types"

interface ResourceDirectoryProps {
  groups: ResourceCategoryGroup[]
  openValues: string[]
  onOpenChange: (next: string[]) => void
  onOpenResource: (resource: Resource) => void
  onExpandCategory: (slug: string) => void
  scrollContainerRef: RefObject<HTMLDivElement | null>
}

export const ResourceDirectory = ({
  groups,
  openValues,
  onOpenChange,
  onOpenResource,
  onExpandCategory,
  scrollContainerRef,
}: ResourceDirectoryProps) => (
  <div
    className={cn(
      "grid grid-cols-1 gap-4",
      groups.length > 1 && "lg:grid-cols-[200px_1fr]"
    )}
  >
    <ResourceJumpNav
      groups={groups}
      scrollContainerRef={scrollContainerRef}
      onExpandCategory={onExpandCategory}
    />

    <ScrollArea
      ref={scrollContainerRef}
      className="max-h-[calc(100vh-8rem)] min-h-120 overflow-y-auto pr-3"
    >
      <ResourceCategoryAccordion
        groups={groups}
        openValues={openValues}
        onOpenChange={onOpenChange}
        onOpenResource={onOpenResource}
      />
    </ScrollArea>
  </div>
)
