import type { RefObject } from "react"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import {
  categorySlug,
  type ResourceCategoryGroup,
} from "./ResourceCategoryAccordion"
import {
  getCategoryLabel,
  getCategoryTheme,
} from "@/lib/resource-category-config"

interface ResourceJumpNavProps {
  groups: ResourceCategoryGroup[]

  scrollContainerRef: RefObject<HTMLElement | null>
  onExpandCategory: (slug: string) => void
}

export const ResourceJumpNav = ({
  groups,
  scrollContainerRef,
  onExpandCategory,
}: ResourceJumpNavProps) => {
  const handleClick = (group: string) => {
    const slug = categorySlug(group)
    const target = document.getElementById(slug)

    if (!target) return

    // Find the accordion item element
    const item = target.closest<HTMLElement>('[data-slot="accordion-item"]')
    const wasOpen = item?.hasAttribute("data-open") ?? false

    onExpandCategory(slug)

    const scrollToTarget = () => {
      const root = scrollContainerRef.current
      if (!root) return
      const viewport =
        root.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]') ??
        root
      const offset =
        target.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top +
        viewport.scrollTop
      viewport.scrollTo({ top: offset - 8, behavior: "smooth" })
    }

    if (wasOpen) {
      requestAnimationFrame(scrollToTarget)
      return
    }

    // Wait for the panel's own height transition to finish before measuring
    if (!item) {
      requestAnimationFrame(scrollToTarget)
      return
    }

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "height") return
      item.removeEventListener("transitionend", onTransitionEnd)
      scrollToTarget()
    }
    item.addEventListener("transitionend", onTransitionEnd)

    // If for any reason the transition doesn't fire (reduced motion, browser quirk),
    // still scroll after a generous fallback so clicks never feel dead.
    setTimeout(() => {
      item.removeEventListener("transitionend", onTransitionEnd)
      scrollToTarget()
    }, 600)
  }

  if (groups.length <= 1) return null

  return (
    <nav aria-label="Jump to category" className="hidden lg:block">
      <div className="sticky space-y-1">
        <p className="mono-eyebrow mb-1 px-2 font-semibold text-muted-foreground">
          Categories
        </p>
        {groups.map(({ group, items }) => {
          const theme = getCategoryTheme(group)
          const Icon = theme.icon
          return (
            <button
              key={group}
              type="button"
              onClick={() => handleClick(group)}
              className={cn(
                "mono-eyebrow-sm flex w-full cursor-pointer items-center gap-2 px-2 py-2 text-left text-foreground-soft transition-colors",
                "hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <Icon
                aria-hidden
                className="size-3.5 shrink-0"
                style={{ color: theme.pinColor }}
              />
              <span className="flex-1 truncate">{getCategoryLabel(group)}</span>
              <span className="tabular-nums opacity-70">{items.length}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
