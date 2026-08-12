export const EVENT_COLORS = {
  blue: {
    label: "Blue",
    hex: "#3b82f6",
    style: {
      bg: "bg-blue-50 hover:bg-blue-100",
      text: "text-blue-900",
      dot: "bg-blue-500",
      border: "border-l-blue-500",
      chipSelectedClass: "border-blue-300 bg-blue-50 text-blue-900",
    },
  },
  violet: {
    label: "Violet",
    hex: "#8b5cf6",
    style: {
      bg: "bg-violet-50 hover:bg-violet-100",
      text: "text-violet-900",
      dot: "bg-violet-500",
      border: "border-l-violet-500",
      chipSelectedClass: "border-violet-300 bg-violet-50 text-violet-900",
    },
  },
  amber: {
    label: "Amber",
    hex: "#f59e0b",
    style: {
      bg: "bg-amber-50 hover:bg-amber-100",
      text: "text-amber-900",
      dot: "bg-amber-500",
      border: "border-l-amber-500",
      chipSelectedClass: "border-amber-300 bg-amber-50 text-amber-900",
    },
  },
  emerald: {
    label: "Emerald",
    hex: "#10b981",
    style: {
      bg: "bg-emerald-50 hover:bg-emerald-100",
      text: "text-emerald-900",
      dot: "bg-emerald-500",
      border: "border-l-emerald-500",
      chipSelectedClass: "border-emerald-300 bg-emerald-50 text-emerald-900",
    },
  },
  rose: {
    label: "Rose",
    hex: "#f43f5e",
    style: {
      bg: "bg-rose-50 hover:bg-rose-100",
      text: "text-rose-900",
      dot: "bg-rose-500",
      border: "border-l-rose-500",
      chipSelectedClass: "border-rose-300 bg-rose-50 text-rose-900",
    },
  },
  sky: {
    label: "Sky",
    hex: "#0ea5e9",
    style: {
      bg: "bg-sky-50 hover:bg-sky-100",
      text: "text-sky-900",
      dot: "bg-sky-500",
      border: "border-l-sky-500",
      chipSelectedClass: "border-sky-300 bg-sky-50 text-sky-900",
    },
  },
  orange: {
    label: "Orange",
    hex: "#f97316",
    style: {
      bg: "bg-orange-50 hover:bg-orange-100",
      text: "text-orange-900",
      dot: "bg-orange-500",
      border: "border-l-orange-500",
      chipSelectedClass: "border-orange-300 bg-orange-50 text-orange-900",
    },
  },
  teal: {
    label: "Teal",
    hex: "#14b8a6",
    style: {
      bg: "bg-teal-50 hover:bg-teal-100",
      text: "text-teal-900",
      dot: "bg-teal-500",
      border: "border-l-teal-500",
      chipSelectedClass: "border-teal-300 bg-teal-50 text-teal-900",
    },
  },
  red: {
    label: "Red",
    hex: "#ef4444",
    style: {
      bg: "bg-red-50 hover:bg-red-100",
      text: "text-red-900",
      dot: "bg-red-500",
      border: "border-l-red-500",
      chipSelectedClass: "border-red-300 bg-red-50 text-red-900",
    },
  },
} as const

export const FALLBACK_COLOR = "red"

export type EventTypeColor = keyof typeof EVENT_COLORS
export type EventTypeStyle = (typeof EVENT_COLORS)[EventTypeColor]["style"]

// Creates an array of slugs for Sanity, excluding the fallback value
export const EVENT_TYPE_PALETTE_SLUGS = Object.keys(EVENT_COLORS).filter(
  (slug) => slug !== FALLBACK_COLOR
) as EventTypeColor[]

export const getEventTypeStyle = (
  color: string | null | undefined
): EventTypeStyle => {
  if (!color || !(color in EVENT_COLORS)) {
    return EVENT_COLORS[FALLBACK_COLOR].style
  }
  return EVENT_COLORS[color as EventTypeColor].style
}
