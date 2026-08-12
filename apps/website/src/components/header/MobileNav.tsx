import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@tidewater-dsa/ui/components/sheet"
import { Button } from "@tidewater-dsa/ui/components/button"
import { HeartIcon, MenuIcon } from "lucide-react"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import type { Settings, ValidNavLink } from "@/types"

interface MobileNavProps {
  navLinks: ValidNavLink[]
  callToActionText: Settings["callToActionText"]
  callToActionLink: Settings["callToActionLink"]
  pathname: string
}

export const MobileNav = ({
  navLinks = [],
  callToActionText,
  callToActionLink,
  pathname,
}: MobileNavProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-sm border border-border"
          >
            <MenuIcon className="size-5 text-foreground" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        }
      />

      <SheetContent
        side="right"
        className="w-[88vw] bg-background p-6 pt-20 shadow-2xl"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

        <nav className="flex flex-col">
          {navLinks.map((link, idx) => {
            const isActive = pathname === `/${link.slug}`

            return (
              <a
                key={link.slug}
                href={`/${link.slug}`}
                className={cn(
                  "font-heading text-2xl leading-none font-extrabold tracking-tight uppercase",
                  "border-b border-border py-4",
                  idx === 0 && "border-t border-border",
                  isActive ? "text-primary" : "text-foreground"
                )}
                onClick={() => setOpen(false)}
              >
                {link.title}
              </a>
            )
          })}

          {callToActionLink && callToActionText && (
            <Button
              size="lg"
              className="mt-6 w-full gap-1.5 rounded-md text-base font-bold text-foreground"
              nativeButton={false}
              render={
                <a
                  href={callToActionLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                />
              }
            >
              <HeartIcon className="size-4" fill="currentColor" />
              {callToActionText}
            </Button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
