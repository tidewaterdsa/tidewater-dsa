import type { StructureResolver } from "sanity/structure"
import { CustomizeEventsTool } from "./CustomizeEventsTool"

// Own structure tool instead of a plain custom tool so customizations open as a child
// pane: the editor's close button then falls back to this list, not to /admin/structure.
export const customizeEventsStructure: StructureResolver = (S) =>
  S.component(CustomizeEventsTool).id("customize-events")
