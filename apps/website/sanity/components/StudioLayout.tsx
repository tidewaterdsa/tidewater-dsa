import { Toaster } from "sonner"
import type { LayoutProps } from "sanity"

// Inlined instead of a .css import: Astro hoists imported CSS into shared chunks, and
// these rules ended up on public pages too.
const STUDIO_CSS = `
  /* Sanity UI sets no cursor on its buttons. */
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]) {
    cursor: pointer;
  }

  /* Array reordering runs on dnd-kit's PointerSensor, which needs the handle to
     opt out of browser touch gestures. Without this the first finger-drag scrolls
     the pane, the pointer stream is cancelled, and rows can't be moved on a phone. */
  [data-ui="DragHandleButton"] {
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
`

// Mounted once for the whole Studio so any tool can call toast().
export const StudioLayout = (props: LayoutProps) => (
  <>
    {props.renderDefault(props)}
    <style>{STUDIO_CSS}</style>
    <Toaster richColors closeButton position="bottom-right" />
  </>
)
