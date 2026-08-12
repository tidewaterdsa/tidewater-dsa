import { MapPinIcon, PhoneIcon, CircleCheckBigIcon } from "lucide-react"
import { Card } from "@tidewater-dsa/ui/components/card"
import { Badge } from "@tidewater-dsa/ui/components/badge"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import {
  getCategoryLabel,
  getCategoryTheme,
} from "@/lib/resource-category-config"
import { formatVerifiedDate, isVerificationFresh } from "@/lib/format"
import type { Resource } from "@/types"

interface ResourceCardProps {
  resource: Resource
  onOpen: (resource: Resource) => void
}

export const ResourceCard = ({ resource, onOpen }: ResourceCardProps) => {
  const displayLocation = [resource.city, resource.state]
    .filter(Boolean)
    .join(", ")

  return (
    <Card
      variant="editorial"
      className="h-full gap-3 px-5 py-5"
      render={
        <button
          type="button"
          onClick={() => onOpen(resource)}
          aria-label={`View details for ${resource.name}`}
        />
      }
    >
      <div className="flex h-full w-full flex-col gap-3 text-left">
        <div className="flex flex-wrap items-center gap-1.5">
          {resource.categoryGroups.slice(0, 2).map((g) => {
            const theme = getCategoryTheme(g)
            return (
              <Badge
                key={g}
                variant="editorial"
                className="transition-colors group-hover/card:border-white/40 group-hover/card:bg-white/10 group-hover/card:text-white"
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", theme.accentClass)}
                  aria-hidden
                />
                {getCategoryLabel(g)}
              </Badge>
            )
          })}
          {resource.categoryGroups.length > 2 && (
            <span className="mono-eyebrow-sm text-foreground-soft group-hover/card:text-white/70">
              +{resource.categoryGroups.length - 2}
            </span>
          )}
          {resource.isFree && (
            <Badge
              variant="editorial-success"
              className="ml-auto transition-colors group-hover/card:border-emerald-500 group-hover/card:bg-emerald-600 group-hover/card:text-white"
            >
              Free
            </Badge>
          )}
        </div>

        <div>
          <div className="heading-display text-base leading-tight">
            {resource.name}
          </div>
          {resource.organization && resource.organization !== resource.name && (
            <p className="mono-eyebrow-sm mt-1 text-foreground-soft group-hover/card:text-white/70">
              {resource.organization}
            </p>
          )}
        </div>

        {resource.description && (
          <p className="line-clamp-2 text-xs text-foreground-soft transition-colors group-hover/card:text-white/85">
            {resource.description}
          </p>
        )}

        <div className="mono-eyebrow-sm mt-auto space-y-1 pt-1 text-foreground-soft group-hover/card:text-white/75">
          {displayLocation && (
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="size-3 shrink-0" />
              <span className="truncate tracking-normal normal-case">
                {displayLocation}
              </span>
            </div>
          )}
          {resource.phone && (
            <div className="ml-px flex items-center gap-1.5">
              <PhoneIcon className="size-3 shrink-0" />
              <span className="truncate tracking-normal normal-case">
                {resource.phone}
              </span>
            </div>
          )}
        </div>

        {resource.lastVerifiedISO &&
          isVerificationFresh(resource.lastVerifiedISO) && (
            <div className="mono-eyebrow-sm flex items-center gap-1 text-foreground-soft capitalize group-hover/card:text-white/70">
              <CircleCheckBigIcon className="mb-px size-3.25 text-emerald-600 group-hover/card:text-white" />
              <span>
                Verified{" "}
                <time
                  dateTime={resource.lastVerifiedISO}
                  className="mono-eyebrow-sm"
                >
                  {formatVerifiedDate(resource.lastVerifiedISO)}
                </time>
              </span>
            </div>
          )}
      </div>
    </Card>
  )
}
