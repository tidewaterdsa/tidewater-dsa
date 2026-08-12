import type { AttendanceType } from "@/types"

/**
 * Attendance type options for checkbox lists and other multi-select UI.
 * The filter popover iterates this.
 */
export const ATTENDANCE_OPTIONS: { value: AttendanceType; label: string }[] = [
  { value: "in_person", label: "In-person" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
]

/**
 * Attendance type → display label. 
 * Used anywhere we need to render a single attendance value's label (badges on event cards,
 * detail dialog, etc.) without iterating the full options list.
 */
export const ATTENDANCE_LABEL: Record<AttendanceType, string> = {
  in_person: "In-person",
  virtual: "Virtual",
  hybrid: "Hybrid",
}
