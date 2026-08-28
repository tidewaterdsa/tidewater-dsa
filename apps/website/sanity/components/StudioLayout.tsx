import { Toaster } from "sonner"
import type { LayoutProps } from "sanity"

// Inlined instead of a .css import: Astro hoists imported CSS into shared chunks, and
// this rule ended up on public pages too. Sanity UI sets no cursor on its buttons.
const CURSOR_FIX = `
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]) {
    cursor: pointer;
  }
`

// Mounted once for the whole Studio so any tool can call toast().
export const StudioLayout = (props: LayoutProps) => (
  <>
    {props.renderDefault(props)}
    <style>{CURSOR_FIX}</style>
    <Toaster richColors closeButton position="bottom-right" />
  </>
)
