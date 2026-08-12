# @tidewater-dsa/ui

Shared UI components for Tidewater DSA apps. The bulk of the components come from [shadcn/ui](https://ui.shadcn.com) (built on [Base UI](https://base-ui.com)), but the package also ships a few custom components that aren't in the shadcn catalog. The most notable additions are a MapLibre-based Map, two Motion-powered components, and a set of brand social icons. The package also exports the shared Tailwind theme tokens, the global stylesheet, and a cn helper

## Structure

```
packages/ui/
└── src/
    ├── components/        # shadcn/ui components (Button, Card, Sheet, etc.)
    ├── hooks/             # Shared React hooks
    ├── lib/               # Utilities (cn helper, etc.)
    └── styles/
        └── globals.css    # Tailwind theme tokens and base styles
```

## What's in here

Most components in this package come straight from shadcn/ui. They were added with the shadcn CLI, follow shadcn's conventions exactly, and don't need separate documentation here. The pieces below were not pulled from shadcn and need a brief note:

- **`Map`** (`components/map.tsx`): a [MapLibre GL](https://maplibre.org) wrapper with a compound `Map` / `Map.Marker` / `Map.Popup` API, theme-aware basemap selection (light/dark via the `dark` class on `<html>`), built-in zoom/locate/fullscreen controls, and SSR safety. Used by the resources page; can be reused anywhere a map is needed.
- **`motion-tabs`** and **`motion-highlight`** (`components/motion-*.tsx`): [Motion](https://motion.dev) (formerly Framer Motion) components that animate a highlight pill between focused items. `motion-tabs` is the public API (used on the resources page to switch between Directory and Map views); `motion-highlight` is the lower-level primitive it's built on.
- **`icons.tsx`**: branded social icons that aren't in lucide-react: `Instagram`, `Facebook`, `Twitter`, `Bluesky`, `Linktree`, `Linkedin`, `Youtube`. Each is a flat SVG component that accepts the same props as a native `<svg>` element. They have no styling opinions of their own. Consuming apps decide how to color and frame them (the website app, for instance, switches between an outlined and a filled-background look in `Footer.astro` based on a Site Settings field). For any non-brand icon, import from `lucide-react` directly.

When adding new non-shadcn components, document them here so future maintainers don't have to grep the source to find out what's available.

## Importing from this package

Apps in the monorepo import components, utilities, and styles directly:

```ts
// Components
import { Button } from "@tidewater-dsa/ui/components/button"
import { Card, CardHeader, CardTitle } from "@tidewater-dsa/ui/components/card"

// Utilities
import { cn } from "@tidewater-dsa/ui/lib/utils"

// Global styles (import once at the top of your app's entry)
import "@tidewater-dsa/ui/globals.css"
```

The exports are defined in this package's `package.json` under the `exports` field and point directly at the source files — there's no build step.

## Adding components

From the repo root, run shadcn's CLI pointed at this package:

```bash
npx shadcn@latest add dialog -c packages/ui
```

This reads `packages/ui/components.json` and writes the component into `packages/ui/src/components/`. The component will automatically be available to import from `@tidewater-dsa/ui/components/dialog` in any app.

To see all available components, run `npx shadcn@latest add` with no arguments and pick from the list, or browse [ui.shadcn.com](https://ui.shadcn.com/docs/components).

## Theme and styling

Theme tokens live in `src/styles/globals.css` as CSS custom properties. The file defines both light and dark mode values, plus Tailwind's `@theme` mapping. To change brand colors, fonts, or radius values, edit the `:root` and `.dark` blocks.

Apps import this file once (typically in their main layout) to get both the theme and Tailwind's base styles.

## Conventions

- **One component per file**, matching shadcn's structure
- **Use `cn()`** from `lib/utils.ts` for conditional class names
- **Use `data-slot`** attributes on component internals for targeted styling from consuming apps (see `card.tsx` for examples)
- **Keep components framework-agnostic** — they should work in any React app, not just Astro. Don't import from `astro:*` or Astro-specific modules