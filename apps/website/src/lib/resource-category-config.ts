import {
  Home as HomeIcon,
  Utensils,
  HeartPulse,
  Briefcase,
  Shirt,
  Megaphone,
  DollarSign,
  GraduationCap,
  Users,
  Bus,
  Scale,
  Info,
  type LucideIcon,
} from "lucide-react"

export interface CategoryTheme {
  /** Storage key — matches the value parsed from the Sheet's "Categories" column. */
  group: string
  /** Optional override for the display label. */
  displayLabel?: string
  icon: LucideIcon
  pillClass: string
  /** Solid hex color for map pins (inline SVG doesn't use Tailwind). */
  pinColor: string
  /** Short accent line used at the top of cards and section headers. */
  accentClass: string
}

const THEMES: CategoryTheme[] = [
  {
    group: "Shelter",
    icon: HomeIcon,
    pillClass:
      "bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200",
    pinColor: "#1e40af",
    accentClass: "bg-blue-600",
  },
  {
    group: "Food",
    icon: Utensils,
    pillClass:
      "bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200",
    pinColor: "#c2410c",
    accentClass: "bg-orange-600",
  },
  {
    group: "Health",
    icon: HeartPulse,
    pillClass:
      "bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-200",
    pinColor: "#15803d",
    accentClass: "bg-green-600",
  },
  {
    group: "Employment",
    icon: Briefcase,
    pillClass:
      "bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200",
    pinColor: "#6d28d9",
    accentClass: "bg-purple-600",
  },
  {
    group: "Clothing",
    icon: Shirt,
    pillClass:
      "bg-pink-50 text-pink-900 dark:bg-pink-950/40 dark:text-pink-200",
    pinColor: "#be185d",
    accentClass: "bg-pink-600",
  },
  {
    group: "Organizing",
    icon: Megaphone,
    pillClass: "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200",
    pinColor: "#b91c1c",
    accentClass: "bg-red-600",
  },
  {
    group: "Financial",
    icon: DollarSign,
    pillClass:
      "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    pinColor: "#047857",
    accentClass: "bg-emerald-600",
  },
  {
    group: "Education",
    icon: GraduationCap,
    pillClass:
      "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200",
    pinColor: "#4338ca",
    accentClass: "bg-indigo-600",
  },
  {
    group: "Family",
    icon: Users,
    pillClass:
      "bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200",
    pinColor: "#be123c",
    accentClass: "bg-rose-600",
  },
  {
    group: "Transportation",
    icon: Bus,
    pillClass:
      "bg-cyan-50 text-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200",
    pinColor: "#0e7490",
    accentClass: "bg-cyan-600",
  },
  {
    group: "Legal/Social",
    displayLabel: "Legal & Social",
    icon: Scale,
    pillClass:
      "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    pinColor: "#b45309",
    accentClass: "bg-amber-600",
  },
  {
    group: "Other",
    icon: Info,
    pillClass:
      "bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-200",
    pinColor: "#475569",
    accentClass: "bg-slate-500",
  },
]

const FALLBACK = THEMES[THEMES.length - 1]
const THEME_BY_GROUP = new Map(THEMES.map((t) => [t.group.toLowerCase(), t]))

export const getCategoryTheme = (group: string): CategoryTheme =>
  THEME_BY_GROUP.get(group.trim().toLowerCase()) ?? FALLBACK

/** The string to render in the UI for this category. */
export const getCategoryLabel = (group: string): string => {
  const theme = getCategoryTheme(group)
  return theme.displayLabel ?? theme.group
}

export const allCategoryThemes = (): CategoryTheme[] => THEMES
