import {
  Instagram,
  Facebook,
  Twitter,
  Bluesky,
  Linktree,
  Linkedin,
  Youtube,
} from "@tidewater-dsa/ui/components/icons"
import { LinkIcon } from "lucide-react"
import type { ComponentType, SVGProps } from "react"
import type { SocialPlatform } from "@/types"
import { stegaClean } from "@sanity/client/stega"

export interface SocialIcon {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  color: string
  filledColor?: string
  bg: string
  label: string
}

const ICONS_BY_PLATFORM: Record<SocialPlatform, SocialIcon> = {
  instagram: {
    icon: Instagram,
    color: "text-pink-600",
    bg: "bg-pink-600",
    label: "Instagram",
  },
  facebook: {
    icon: Facebook,
    color: "text-blue-600",
    bg: "bg-blue-600",
    label: "Facebook",
  },
twitter: {
  icon: Twitter,
  color: "text-primary-foreground",
  bg: "bg-white",
  filledColor: "text-black",
  label: "X (Twitter)",
},
  bluesky: {
    icon: Bluesky,
    color: "text-sky-500",
    bg: "bg-sky-500",
    label: "Bluesky",
  },
  linktree: {
    icon: Linktree,
    color: "text-green-600",
    bg: "bg-green-600",
    label: "Linktree",
  },
  linkedin: {
    icon: Linkedin,
    color: "text-sky-700",
    bg: "bg-sky-700",
    label: "LinkedIn",
  },
  youtube: {
    icon: Youtube,
    color: "text-red-600",
    bg: "bg-red-600",
    label: "YouTube",
  },
  other: {
    icon: LinkIcon,
    color: "text-muted-foreground",
    bg: "bg-muted-foreground",
    label: "Link",
  },
}

export const getSocialIcon = (platform: SocialPlatform): SocialIcon =>
  ICONS_BY_PLATFORM[platform]

export const detectSocialPlatform = (input: string): SocialPlatform => {
  const cleaned = stegaClean(input).trim()
  if (!cleaned) return "other"

  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const u = new URL(cleaned)
      return detectFromLabel(u.hostname)
    } catch {
      return "other"
    }
  }

  return detectFromLabel(cleaned)
}

const detectFromLabel = (label: string): SocialPlatform => {
  const l = label.toLowerCase()
  if (l.includes("instagram") || l.startsWith("ig")) return "instagram"
  if (l.includes("facebook") || l.startsWith("fb")) return "facebook"
  if (l === "x" || l.includes("twitter")) return "twitter"
  if (l.includes("bluesky") || l.includes("bsky")) return "bluesky"
  if (l.includes("linktree") || l.includes("linktr.ee")) return "linktree"
  if (l.includes("linkedin")) return "linkedin"
  if (l.includes("youtube") || l.includes("yt")) return "youtube"
  return "other"
}
