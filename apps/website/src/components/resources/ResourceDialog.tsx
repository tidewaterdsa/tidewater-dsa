import { useState, type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@tidewater-dsa/ui/components/dialog"
import { Button, buttonVariants } from "@tidewater-dsa/ui/components/button"
import { Badge } from "@tidewater-dsa/ui/components/badge"
import { ScrollArea } from "@tidewater-dsa/ui/components/scroll-area"
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  GlobeIcon,
  ClockIcon,
  LanguagesIcon,
  FileTextIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  DollarSignIcon,
  UsersIcon,
  Share2Icon,
  StickyNoteIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@tidewater-dsa/ui/lib/utils"
import {
  getCategoryLabel,
  getCategoryTheme,
} from "@/lib/resource-category-config"
import { getSocialIcon } from "@/lib/social"
import { formatVerifiedDateLong } from "@/lib/format"
import { buildGoogleMapsUrl } from "@/lib/google-maps"
import type { Resource } from "@/types"

interface CopyButtonProps {
  value: string
  label: string
}

const CopyButton = ({ value, label }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.warn(`Copy failed for ${label}:`, err)
    }
  }

  return (
    <Button
      variant="link"
      size="xs"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      className="mono-eyebrow-sm text-link-soft gap-1"
    >
      {copied ? (
        <>
          <CheckIcon /> Copied
        </>
      ) : (
        <>
          <CopyIcon /> Copy
        </>
      )}
    </Button>
  )
}

interface DetailRowProps {
  icon: LucideIcon
  label: string
  children: ReactNode
}

const DetailRow = ({ icon: Icon, label, children }: DetailRowProps) => (
  <div className="flex gap-3">
    <span className="mt-0.75 text-primary">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0 flex-1">
      <div className="mono-eyebrow mb-1 text-primary">{label}</div>
      <div className="wrap-break-words text-sm text-foreground">{children}</div>
    </div>
  </div>
)

interface ResourceDialogProps {
  resource: Resource | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ResourceDialog = ({
  resource,
  open,
  onOpenChange,
}: ResourceDialogProps) => {
  if (!resource) return null

  const mapsUrl = resource.fullAddress
    ? buildGoogleMapsUrl(resource.fullAddress)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="editorial-panel w-[calc(100%-2rem)] gap-0 rounded-none p-0 shadow-none sm:w-full sm:max-w-2xl">
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-5 p-6 pr-4 sm:p-7 sm:pr-8">
            <DialogHeader className="gap-3 text-left">
              <div className="flex flex-wrap items-center gap-1.5">
                {resource.categoryGroups.map((g) => {
                  const theme = getCategoryTheme(g)
                  return (
                    <Badge key={g} variant="editorial">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          theme.accentClass
                        )}
                        aria-hidden
                      />
                      {getCategoryLabel(g)}
                    </Badge>
                  )
                })}
                {resource.isFree && (
                  <Badge variant="editorial-success">Free</Badge>
                )}
              </div>
              <DialogTitle className="heading-display text-2xl">
                {resource.name}
              </DialogTitle>
              {resource.organization &&
                resource.organization !== resource.name && (
                  <DialogDescription className="text-base leading-relaxed text-foreground-soft">
                    Provided by {resource.organization}
                  </DialogDescription>
                )}
            </DialogHeader>

            {resource.description && (
              <p className="text-base leading-relaxed text-foreground">
                {resource.description}
              </p>
            )}

            {resource.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {resource.categories.map((c) => (
                  <Badge key={c.full} variant="editorial">
                    {c.full}
                  </Badge>
                ))}
              </div>
            )}

            <div className="space-y-5 border-t-2 border-border pt-5">
              {resource.fullAddress && (
                <DetailRow icon={MapPinIcon} label="Address">
                  <div className="space-y-2">
                    <p>{resource.fullAddress}</p>
                    <div className="-ml-2 flex flex-wrap items-center gap-1">
                      <CopyButton
                        value={resource.fullAddress.replace(/ · /g, ", ")}
                        label="address"
                      />
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            buttonVariants({ variant: "link", size: "xs" }),
                            "mono-eyebrow-sm text-link-soft gap-1"
                          )}
                        >
                          <ExternalLinkIcon /> Open in Maps
                        </a>
                      )}
                    </div>
                  </div>
                </DetailRow>
              )}

              {resource.phone && (
                <DetailRow icon={PhoneIcon} label="Phone">
                  <div className="space-y-2">
                    {resource.phoneLink ? (
                      <a
                        href={`tel:${resource.phoneLink}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {resource.phone}
                      </a>
                    ) : (
                      <span>{resource.phone}</span>
                    )}
                    <div className="-ml-2 flex">
                      <CopyButton value={resource.phone} label="phone" />
                    </div>
                  </div>
                </DetailRow>
              )}

              {resource.email && (
                <DetailRow icon={MailIcon} label="Email">
                  <div className="space-y-2">
                    <a
                      href={`mailto:${resource.email}`}
                      className="font-medium break-all text-primary hover:underline"
                    >
                      {resource.email}
                    </a>
                    <div className="-ml-2 flex">
                      <CopyButton value={resource.email} label="email" />
                    </div>
                  </div>
                </DetailRow>
              )}

              {resource.websiteLink && (
                <DetailRow icon={GlobeIcon} label="Website">
                  <a
                    href={resource.websiteLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium break-all text-primary hover:underline"
                  >
                    {resource.website.replace(/^https?:\/\//, "")}
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                </DetailRow>
              )}

              {resource.socials.length > 0 && (
                <DetailRow icon={Share2Icon} label="Social">
                  <ul className="-ml-2 flex flex-wrap items-center">
                    {resource.socials.map((s, i) => {
                      const {
                        icon: Icon,
                        color,
                        label,
                      } = getSocialIcon(s.platform)
                      const title = s.handle
                        ? `${label}: ${s.handle}`
                        : `${label}${s.url ? `: ${s.url}` : ""}`
                      const iconEl = (
                        <Icon aria-hidden className={cn("size-5", color)} />
                      )

                      return (
                        <li key={`${s.platform}-${i}`}>
                          {s.url ? (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center p-1.5 transition-opacity hover:opacity-70"
                              aria-label={title}
                              title={title}
                            >
                              {iconEl}
                            </a>
                          ) : (
                            <span
                              className="inline-flex items-center p-1.5"
                              aria-label={title}
                              title={title}
                            >
                              {iconEl}
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </DetailRow>
              )}

              {resource.hours && (
                <DetailRow icon={ClockIcon} label="Hours & How to Access">
                  <span className="whitespace-pre-line">{resource.hours}</span>
                </DetailRow>
              )}

              {resource.nextEvent && (
                <DetailRow icon={CalendarIcon} label="Next Event">
                  {resource.nextEvent}
                </DetailRow>
              )}

              {resource.costStructure && (
                <DetailRow icon={DollarSignIcon} label="Cost">
                  {resource.costStructure}
                </DetailRow>
              )}

              {resource.eligibilityDetails && (
                <DetailRow icon={UsersIcon} label="Eligibility">
                  {resource.eligibilityDetails}
                </DetailRow>
              )}

              {resource.languages.length > 0 && (
                <DetailRow icon={LanguagesIcon} label="Languages">
                  <div className="flex flex-wrap gap-1.5">
                    {resource.languages.map((l) => (
                      <Badge key={l} variant="editorial">
                        {l}
                      </Badge>
                    ))}
                  </div>
                </DetailRow>
              )}

              {resource.requiredDocuments && (
                <DetailRow icon={FileTextIcon} label="Required Documents">
                  {resource.requiredDocuments}
                </DetailRow>
              )}

              {resource.additionalNotes && (
                <DetailRow icon={StickyNoteIcon} label="Notes">
                  <span className="whitespace-pre-line">
                    {resource.additionalNotes}
                  </span>
                </DetailRow>
              )}

              {resource.lastVerifiedISO && (
                <DetailRow icon={CheckCircle2Icon} label="Last Verified">
                  <time dateTime={resource.lastVerifiedISO}>
                    {formatVerifiedDateLong(resource.lastVerifiedISO)}
                  </time>
                </DetailRow>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
