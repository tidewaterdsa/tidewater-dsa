# Website

The public-facing website for Tidewater DSA, the Hampton Roads chapter of the Democratic Socialists of America. Built with Astro and server-rendered on Cloudflare Workers, with content managed through an embedded Sanity Studio at `/admin`.

## Tech stack

- **[Astro](https://astro.build)** — site framework, server-rendered with the Cloudflare adapter
- **[Sanity](https://www.sanity.io)** — headless CMS, embedded Studio at `/admin`, with Presentation tool for visual editing
- **[Google Calendar API](https://developers.google.com/calendar/api/v3/reference)** — source of truth for event data
- **[Google Sheets API](https://developers.google.com/sheets/api)** — source of truth for community resource directory data
- **[Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/)** — converts resource addresses to coordinates for the map view
- **[MapLibre GL](https://maplibre.org)** + **[OpenFreeMap](https://openfreemap.org)** — map rendering and basemap tiles
- **[Cloudflare KV](https://developers.cloudflare.com/kv/)** — geocode result cache (production only)
- **[Tailwind CSS v4](https://tailwindcss.com)** — styling
- **[@tidewater-dsa/ui](../../packages/ui)** — shared shadcn/ui components
- **[Cloudflare Workers](https://workers.cloudflare.com)** — hosting

## Structure

```
apps/website/
├── sanity/
│   ├── schemas/           # Document and object type definitions
│   ├── queries/           # Shared GROQ queries
│   ├── components/        # Custom Studio input components
│   └── tools/             # Custom Studio tools (Customize Events)
├── src/
│   ├── components/        # App-specific Astro and React components
│   │   ├── calendar/      # Events page calendar components
│   │   └── resources/     # Community Resources directory components
│   ├── hooks/             # Shared React hooks
│   ├── layouts/           # Astro layouts (main.astro)
│   ├── lib/               # Helpers — formatters, gcal, sheets, geocode, social, etc.
│   ├── pages/             # File-based routes (incl. 404.astro)
│   ├── styles/            # Global CSS extensions
│   ├── types/             # Shared domain types
│   └── middleware.ts      # noindex + security headers on every SSR route
├── astro.config.mjs
├── wrangler.jsonc         # Workers config (CACHE + ASSETS bindings, env vars)
├── DOMAIN-CUTOVER.md      # Checklist for moving to the custom domain
└── sanity.config.ts       # Embedded Studio config with Presentation tool
```

## Typography

The site's display typeface is **Manifold DSA**, the official DSA brand font. Seven weights (Light through Heavy, 300–900) are bundled as WOFF2 in `apps/website/public/fonts/` and declared in `src/styles/app.css`. The `--font-heading` token in `packages/ui/src/styles/globals.css` resolves to `"Manifold DSA"` with an Inter Variable fallback, so any app that imports the shared globals gets the brand heading font automatically, provided that app also serves the font files at `/fonts/`.

Body copy uses Inter Variable (loaded via `@fontsource-variable/inter`, declared in the shared UI package). The mono token resolves to JetBrains Mono with system fallbacks.

If you add a new app to the monorepo and want the same heading look, copy the `apps/website/public/fonts/` directory into the new app's public folder and re-declare the seven `@font-face` blocks. The Tailwind tokens are shared automatically.

## Environmental Setup

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

See the comments in `.env.example` for where to get each value. You'll need:

- A Sanity viewer token (each dev generates their own)
- A site URL (`PUBLIC_SITE_URL`) — `http://localhost:4321` in development, the canonical production URL otherwise. Used for absolute URLs in social cards and any link that has to leave the relative-path context.
- Google Calendar credentials (optional in dev, the app uses mock events when missing; required in production)
- Google Sheets API key
- Mapbox geocoding token

To generate a Sanity read token, go to `sanity.io/manage` → your project → API → Tokens → Add API Token → set permissions to **Viewer**.

For the Google and Mapbox credentials, see the per-feature walkthroughs further down (Events, Community Resources).

### Environment variable prefixes

Astro only exposes environment variables to client-side code if they are prefixed with `PUBLIC_`. Variables without the prefix are server-only — they exist during SSR but are never sent to the browser.

The Sanity project ID, dataset, and visual editing flag all need the `PUBLIC_` prefix because the embedded Studio runs as a client-side React app in the browser and needs access to these values. The `SANITY_API_READ_TOKEN`, Google API keys, and `MAPBOX_GEOCODER_TOKEN` do NOT have the prefix. They are server-only secrets that must never reach the browser. The Mapbox token specifically is only ever used server-side during SSR for geocoding; it's never sent to the client.

### Build-time vs runtime variables

The `PUBLIC_` prefix controls whether a value reaches the _browser_. A separate
question is whether it is read at **build** time or at **request** time, and the
two do not line up:

| Variable                                                            | Read at                        |
| ------------------------------------------------------------------- | ------------------------------ |
| `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`                 | build (`astro.config.mjs`)     |
| `PUBLIC_SITE_URL`                                                   | build (inlined by Vite)        |
| `PUBLIC_SANITY_VISUAL_EDITING_ENABLED`                              | build (`load-query.ts`)        |
| `SANITY_API_READ_TOKEN`                                             | build (`load-query.ts`)        |
| `GOOGLE_*`, `MAPBOX_GEOCODER_TOKEN`, `USE_MOCK_DATA`, `ENVIRONMENT` | runtime (`locals.runtime.env`) |

Build-time values are frozen into the bundle and **cannot be changed by a Worker
variable** — they need a rebuild. This matters most for `PUBLIC_SANITY_DATASET`,
which is how staging points at a different dataset than production. See
[Deployment](#deployment) for which Cloudflare panel each one belongs in.

### CORS

The Sanity project must allow your deployment URLs as CORS origins. Go to `sanity.io/manage` → API → CORS origins and add:

- `http://localhost:4321` (local development)
- The production Worker URL or custom domain
- The staging Worker URL

Make sure **Allow credentials** is checked for each origin.

## Running the app

From the repo root:

```bash
npm run dev --workspace=website
```

Or run everything in the monorepo with `npm run dev` from the root.

The site runs at `http://localhost:4321`. The embedded Sanity Studio is at `http://localhost:4321/admin`, and the Presentation tool (visual editing) is at `http://localhost:4321/admin/presentation`.

## Content management

Content is managed through the embedded Sanity Studio at `/admin`. The document types currently defined:

- **Site Settings** (singleton) — site title, logo, navigation, social links, newsletter signup URL, contact info, footer, "next meeting" ribbon configuration
- **Homepage** (singleton) — hero, CTA, section headings, events-section copy
- **Events Page** (singleton) — heading, intro, and empty-state message for the `/events` calendar page
- **Resources Page** (singleton) — Member Resources rich text, Community Resources directory headline/intro/print-footer, and Google Sheet data source config
- **About Page** (singleton) — hero, mission statement, and a repeating list of chapter values (`aboutValue` object type)
- **Get Involved Page** (singleton) — intro and a repeating list of ways to get involved (`way` object type)
- **Chapter Priorities Page** (singleton) — intro rich text and a repeating list of priority entries (`priority` object type)
- **Event Types** (singleton) — admin-defined taxonomy for categorizing events (e.g. "Training", "Action", "Meeting") with a color per type
- **Working Groups** (singleton) — admin-defined taxonomy of the chapter's working groups and committees. Shown as a badge on event details and as a filter on the events page.
- **Event Customization** — per-event editorial metadata (featured flag, event type, working group, RSVP override, summary) joined to Google Calendar events by ID. Managed through the **Customize Events** tool rather than as standalone documents — see the Events section below.
- **Static Page** — for any non-singleton route that doesn't have a dedicated page document.
- **Blog Post** — long-form content with Portable Text

Singletons cannot be deleted or duplicated, and only one document of each type can exist. The list of singleton types lives in `sanity/structure.ts` (`SINGLETON_IDS`), and `sanity.config.ts` reads that list to disable the "create new" and "delete" actions for matching document types. To add a new singleton, register it in `SINGLETON_IDS` and add a `singletonItem(...)` entry to the `structure` resolver. No separate config change is needed.

If the new singleton backs a page that should appear in the site header, two more files need updating so editors can add it to the navbar via Site Settings → Main Navigation:

1. **`sanity/schemas/siteSettings.ts`** — add the new singleton's document type to the `to: [...]` array on the `mainNav` field. Without this, the new type won't show up in the reference picker.
2. **`sanity/queries/siteSettings.ts`** — add a clause to the `select(...)` projection in `navLinks` that maps the new `_type` to the route slug (e.g. `@->_type == "newSingletonPage" => "new-singleton"`). The fallback (`@->slug.current`) only fires for the generic `page` document type; named singletons need an explicit mapping.

Once both are in place, editors can pick the new singleton in the navbar field on Site Settings and it'll render in the header at the mapped URL.

### Datasets

There are two datasets in the same Sanity project:

| Dataset      | Used by                           | Role                            |
| ------------ | --------------------------------- | ------------------------------- |
| `production` | the production Worker             | The source of truth for content |
| `staging`    | the staging Worker, and local dev | A disposable copy               |

**Content flows `production` → `staging`, never the other way.** Sanity has no
content merge: if both datasets accept edits they diverge with no way to
reconcile them, and someone's work gets discarded. So:

- **Admins and editors only ever work in the production Studio.** Real content
  lives in one place.
- **Devs point local dev at `staging`** (`PUBLIC_SANITY_DATASET=staging` in
  `.env`) and can break anything. Visual editing is enabled on the staging
  deployment, so schema and layout changes can be checked against realistic
  content before they reach `main`.
- **Never enter content into `staging` that you would mind losing.**

Refresh `staging` with a copy of production whenever it drifts:

```bash
npm run sanity:refresh-staging --workspace=website
```

That exports `production`, imports it into `staging` with `--replace`, and
deletes the snapshot. Documents sharing an ID are overwritten; anything created
only in `staging` survives. Run `npx sanity login` first if the CLI isn't
authenticated.

Note that `sanity.io/manage` computes dataset document counts periodically, so a
freshly populated dataset can show `N/A` for a while. Query it instead:

```bash
npx sanity documents query 'count(*)' --dataset staging
```

**Schema is code, not content.** It lives in `sanity/schemas/`, deploys with the
Studio, and applies to whichever dataset that build points at — there is nothing
to copy between datasets. A schema change reaches `staging` by deploying the
`staging` branch and `production` by merging to `main`.

For a schema change that needs existing documents reshaped, rehearse the
migration on the disposable copy first:

```bash
npx sanity migration create rename-event-location
npx sanity migration run rename-event-location --dataset staging              # dry run
npx sanity migration run rename-event-location --dataset staging --no-dry-run
# verify in the staging Studio, then:
npx sanity migration run rename-event-location --dataset production --no-dry-run
```

Tokens and CORS origins are scoped to the _project_, not the dataset, so both
datasets are covered by the same read token and the same allowed origins.

### Visual editing

The Presentation tool at `/admin/presentation` lets editors see the live site in an iframe and click on text to edit it directly. Toggle the **Edit** switch in the top-left of the preview to switch between editing mode (click to edit) and browse mode (click to navigate).

To make a new piece of content visually editable, add a field to the appropriate Sanity schema and reference it in the Astro template through the `loadQuery` helper in `src/lib/load-query.ts`. Hardcoded strings in templates will not be editable — content must come from a Sanity query for the stega encoding to work.

### Adding new editable text

1. Add a field to the relevant schema in `sanity/schemas/`
2. Add or update the GROQ query in `sanity/queries/`
3. Use `loadQuery` in your `.astro` page to fetch the data
4. Render the value in JSX, with a fallback for when the field is empty

Example:

```astro
---
import { loadQuery } from "@/lib/load-query"
import { HOME_PAGE_QUERY } from "../../sanity/queries"

const { data } = await loadQuery({ query: HOME_PAGE_QUERY })
---

<h1>{data?.heroHeadline || "A Better World is Possible"}</h1>
```

### Type generation

TypeScript types for Sanity schemas and GROQ query results are generated automatically using Sanity TypeGen. The generated file lives at `sanity/types.ts` and should be committed to the repo.

Regenerate types after changing any schema or query:

```bash
npm run typegen
```

This runs two steps under the hood: `sanity schema extract` (writes a `schema.json` from your schema definitions) followed by `sanity typegen generate` (reads the schema and your `defineQuery` calls to produce typed results). The `schema.json` is gitignored — only `sanity/types.ts` is committed.

Generated type names follow the pattern `<QUERY_NAME>_RESULT`. For example, `HOME_PAGE_QUERY` produces `HOME_PAGE_QUERY_RESULT`, `SITE_SETTINGS_QUERY` produces `SITE_SETTINGS_QUERY_RESULT`, and so on. Import them alongside your queries:

```ts
import { HOME_PAGE_QUERY } from "@/sanity/queries"
import type { HOME_PAGE_QUERY_RESULT } from "@/sanity/types"
```

TypeGen configuration lives in `sanity.cli.ts` under the `typegen` key.

## Events

The events system is a hybrid model: Google Calendar is the source of truth for event data (title, time, location, description), and Sanity stores optional editorial metadata that augments gcal events. Events appear on `/events` (full calendar) and on the homepage (next five upcoming).

### Why a hybrid model

Event logistics — dates, times, locations — change frequently and are often updated by organizers who aren't website admins. Making Google Calendar the source of truth means organizers keep using the workflow they already have (Google Calendar's native app, invites, reminders) and the website stays in sync automatically. Sanity's role is editorial: "this event is featured," "this is a Training," "use this RSVP link."

### The Customize Events Studio tool

Sanity Studio has a custom **Customize Events** tool (in the top nav, after Presentation) that lists upcoming Google Calendar events. For each event, admins can:

- **Feature it** (star icon, one click) — adds it to the Featured Events row on the events page and homepage
- **Customize it** — creates a full editorial overlay with event type, RSVP link override, summary, working group, etc.
- **Filter** by status (customized / not customized / all) and time window (upcoming / past / all)

Customizations are stored as Sanity `event` documents linked to Google Calendar events by the gcal event ID. Admins shouldn't create `event` documents directly (the type is hidden from the main sidebar). Always use the Customize Events tool, which creates and links them automatically.

### Event types taxonomy

Event categories (Training, Action, 101/Intro, etc.) are managed in **Settings → Event Types**. Each type has:

- A display label (shown on calendar pills and filter chips)
- A slug (internal identifier, auto-filled from the label)
- A color (picked from a fixed palette of Tailwind-compatible colors)
- An optional internal description

Adding a new type in the taxonomy makes it immediately available in the Customize Events tool dropdown and as a filter chip on the events page. No code changes needed.

### Working groups taxonomy

Similar to Event Types but without the color. The chapter's working groups and committees (Labor, Political Education, Mutual Aid, etc.) are managed in **Settings → Working Groups**. Each entry has:

- A display label (shown as a badge in the event detail dialog)
- A slug (internal identifier, auto-filled from the label)
- An optional internal description

The working group value on an event customization stores the slug (e.g. `labor`). The site resolves the slug back to the friendly label at render time using the taxonomy. If an admin renames a taxonomy entry's slug, any event still tagged with the old slug shows up as an "orphan" — in the filter the raw slug appears as the label, and in the Customize Events dropdown the old value is flagged "(not in taxonomy)" so the admin knows to re-tag.

### Google Calendar setup

In production, the app needs a Google Cloud API key and the ID of a public Google Calendar:

1. Create or pick a Google Calendar and set its sharing to "Make available to public" (read-only access)
2. Grab the Calendar ID from its settings → "Integrate calendar" → Calendar ID (looks like an email)
3. In Google Cloud Console, create an API key with the Calendar API enabled, restricted to Calendar API scope
4. Put both in `.env` as `GOOGLE_CALENDAR_ID` and `GOOGLE_CALENDAR_API_KEY`

In development without credentials, the app serves mock event data from `src/lib/mocks/events.ts` — enough variety to exercise every UI state (featured, past, multi-day, all-day, virtual, etc.).

### Caching

Calendar data is cached in two places.

**KV cache (server).** `fetchGoogleCalendarEvents` in `src/lib/google-calendar.ts`
caches the Google response in the `CACHE` KV namespace for 60 seconds. Four code
paths reach Google — the events page, the homepage, the next-meeting ribbon in
`main.astro` (so _every_ page), and the Customize Events Studio tool — and they
share one API key and one quota. Without the cache, traffic on any of them can
throttle the key and break the others.

The requested window is snapped to month boundaries before it becomes the cache
key. Two callers ask for a window starting at `now`, which would otherwise
produce a fresh key on every request and never hit; both already over-fetch and
re-filter against `now` in memory, so widening the window is safe. The result is
a handful of stable keys and roughly one Google call per key per minute
regardless of traffic.

**Page headers (browser).** `/events` and the homepage send
`Cache-Control: public, max-age=60, stale-while-revalidate=600`. Pages that
don't render events (`/resources`, `/chapter-priorities`) stay at `max-age=300`.

Worst-case staleness for a new calendar event is therefore about 60 seconds. If
you need faster propagation for a specific update, edit the customization in
Studio and wait one minute.

## Action Network

Tidewater DSA uses [Action Network](https://actionnetwork.org) as the source of truth for RSVPs and the email list. The site integrates with AN in three places:

1. **Newsletter signup widget** — the red signup section above the footer (rendered by `main.astro` when `showSignup` is true). The Site Settings document holds a `signupLink` pointing at an AN form URL. `extractActionNetworkInfo` in `src/lib/action-network.ts` parses it into `{ type, slug }` and the layout injects AN's embed script, which hydrates the form in-place.
2. **Event RSVP widgets** — when an event has an AN URL, the event detail dialog renders the live AN RSVP widget inline (`ActionNetworkEvent` in `UpcomingEvents.tsx`). Visitors RSVP without leaving the site.
3. **Auto-extracted RSVP links from Google Calendar** — `findActionNetworkUrl` in `src/lib/action-network.ts` scans the gcal event description and location for an `actionnetwork.org/events/<slug>` or `/forms/<slug>` URL. If one is found, it becomes the event's RSVP link automatically. Organizers who already paste AN links into their gcal events don't need to do anything in Sanity. The Customize Events tool's `rsvpLink` override wins when both are present.

### What lives where

- `src/lib/action-network.ts` — URL parsing (`extractActionNetworkInfo`, `findActionNetworkUrl`) and the embed-stylesheet loader (`ensureStylesLoaded`).
- `src/styles/action-network.css` — overrides for AN's whitelabel CSS (hides "Sponsored by," restyles form chrome to match the site).

### No API key needed

All three integrations use Action Network's public embed bundles, so the site
needs no AN API key. A `/api/subscribe` endpoint previously POSTed to the OSDI
API; it was removed because nothing called it and it accepted unauthenticated,
unvalidated writes to the chapter's live email list. If a custom form ever needs
programmatic submission, recover it from git history and add validation, rate
limiting, and an origin check before exposing it.

### Supported URL shapes

The parser accepts canonical AN page URLs only:

- `https://actionnetwork.org/forms/<slug>` — for signup forms
- `https://actionnetwork.org/events/<slug>` — for event RSVPs

URLs with `www.`, trailing slashes, or trailing punctuation (common when extracting from prose descriptions) are tolerated. Pre-built embed/widget URLs are not supported as input — the site constructs the widget URL itself from `{type, slug}`. The same constraint is enforced in Site Settings → Signup Link with a Sanity validation rule.

## Community Resources

The `/resources` page renders a directory of mutual-aid, shelter, food, health, and support resources across the 757. Resources are submitted via a Google Form, stored in a Google Sheet, and displayed on the site as cards (Directory view) and pins (Map view). The page also supports search, filtering, CSV export, and a print-friendly handout layout.

### Why a Google Sheet

Resource directories evolve constantly: hours change, contact info breaks, organizations relaunch with new branding. Keeping the data in a Google Sheet means anyone trusted with edit access can fix typos or add a new entry without touching the website. The accompanying Google Form makes adding a new resource a guided process. The site doesn't have its own admin UI for this because the Form already does the job, and Forms have built-in submitter validation, conditional logic, and free file uploads.

Sanity owns _page-level_ editorial content (the headline, intro paragraph, print footer text), but the row data itself stays in the sheet. Sanity's Resources Page document holds the Sheet ID and range so admins can switch sheets without redeploying.

### The Google Form workflow

Resources are added through a Google Form whose responses go to the linked sheet. The form fields map 1:1 to the sheet columns the parser expects. When you change the form, change the sheet headers and `lib/resources.ts` together. The parser looks up columns by header name, so reordering columns is fine, but renaming a header without updating the parser will silently drop that field.

Practical guidance for whoever maintains the form:

- The **first** category listed in the "Categories" column is the resource's primary category — that's where it appears in the Directory accordion. List the most relevant category first.
- The **City** field should be a dropdown (Form configuration), not free text. Free-text city values are kept as-is on the site, but typos like "Norfok" become orphan filter options.
- A row with no name is dropped silently. If the form's "Program or Resource Name" question isn't required, fix that in the form.
- The **Last Verification Date** drives the "Verified" badge on cards. Verifications older than 180 days hide the badge.

### Categories

Each resource's "Categories" column accepts comma-separated values like `Shelter - Emergency, Food - Pantry`. The parser splits on commas and the dash to produce structured `{ group, label, full }` triples. The **group** (left of the dash) is what drives display, filtering, and accordion grouping; the **label** (right of the dash) is shown only inside the dialog detail.

Available groups, their colors, and their icons live in `src/lib/resource-category-config.ts`. To add a new group: add a `CategoryTheme` entry there, pick a color and lucide icon. The filters, accordion, cards, and map will all pick it up. The one special case is `Legal/Social`, which displays as "Legal & Social" (handled via a `displayLabel` override).

### Verification freshness

The verification system depends on chapter members periodically re-checking each resource. The "Last Verification Date" sheet column drives a `Verified <month> <year>` badge on each card. The badge is hidden when the verification is older than `VERIFICATION_FRESHNESS_DAYS` (default 180), defined in `src/lib/format.ts`. The dialog still shows the date — that's intentional, so users who open the dialog can see exactly how stale a record is, even if the card looks unverified.

To change the freshness window, edit `VERIFICATION_FRESHNESS_DAYS`. There's no need to change anything in the sheet.

### Geocoding and the map view

The Map view places a pin per resource using coordinates returned by the [Mapbox Geocoding API](https://docs.mapbox.com/api/search/geocoding/). Geocoding happens server-side during SSR. The Mapbox token never reaches the browser. Results are cached in Cloudflare KV so subsequent requests don't re-geocode every address.

The geocoder is defensive in two ways:

1. **Proximity bias** toward Hampton Roads (defined as `REGION_CENTER` in `src/lib/region.ts`) so ambiguous queries like "Main St" prefer the local match.
2. **Region bounding box** check: any coordinates outside southeastern VA / NE NC are rejected. This catches typos like "Robinhood Rd" (one word, not a Norfolk street; Mapbox falls back to a real Robinhood Rd in Winston-Salem NC). Rejected addresses log a warning naming the row to fix.

If you see `[geocode]` lines in your dev server console, that's the per-SSR diagnostic summary. A line like `[geocode] 45/48 have coords · network lookups: 5 (3 ok, 1 fail, 1 rejected out-of-region)` tells you 5 addresses needed live lookups, 1 was rejected (check the warning above for the row), and 1 returned no match (likely a typo or PO box).

### Cache invalidation

Geocoded coordinates are stored under cache keys versioned with `CACHE_KEY_VERSION` in `src/lib/geocode-cache.ts`. The version exists so we can invalidate every cached result at once when the geocoder's validation rules change. Bump `"v2"` to `"v3"` and the next deploy starts re-geocoding from scratch automatically. Manual cache wipes (`rm -rf .wrangler/state` in dev, or deleting KV keys via wrangler in prod) should never be needed in normal operation.

Negative cache entries (addresses that didn't geocode successfully) expire after 30 days, so a fix in the sheet eventually heals on its own. The auth-error path explicitly does NOT cache negatives, because once a bad token is fixed you don't want to wait 30 days for retries.

### Google Sheets API production setup

In production, the app needs a Google Cloud API key with the Sheets API enabled and the ID of a publicly-readable Google Sheet:

1. Sign in to Google Cloud Console using the **TidewaterDSA Google account**
2. Create a project (e.g. "Tidewater DSA Web") if there isn't one yet
3. Enable the **Google Sheets API** from the API library
4. Create an API key with Sheets API restriction enabled
5. Open the Google Sheet that Form responses flow into. Share it as **Anyone with the link, Viewer** (not "Editor" — the API only needs read access)
6. Copy the long ID from the sheet URL (`docs.google.com/spreadsheets/d/THIS_PART/edit`)
7. In Sanity Studio → Resources Page → Data Source tab, paste the Sheet ID and confirm the range (default `Program Form Responses!A:X` matches the standard form response sheet name)
8. Put the API key in `.env` (locally) and Cloudflare's environment variable settings (production) as `GOOGLE_SHEETS_API_KEY`

### Mapbox setup

The Mapbox token is used only for geocoding. The map basemap tiles come from OpenFreeMap (no token required), so the only Mapbox cost is geocoding requests, and the cache keeps that volume tiny.

1. Sign up at [mapbox.com](https://www.mapbox.com) using the **TidewaterDSA email**. Mapbox accounts come with 100,000 free geocoding requests per month, far more than this app will use given the cache.
2. Once signed in, go to Account → Tokens → Create a token
3. Name it something like "TDSA Web — Geocoding"
4. Under **Public scopes**, ensure the token has at minimum: STYLES:READ, FONTS:READ. Geocoding does not require any of the public scopes (it uses the implicit `geocode` scope every token has by default), but if you see "Forbidden" responses, make sure the geocoding scope is enabled.
5. **Leave URL restrictions blank.** This token is used server-side only, Cloudflare Workers don't send a Referer header, so URL restrictions will block valid requests. Restricting a server-side token by URL is a common cause of mysterious 403s.
6. Copy the token (it starts with `pk.`) and put it in `.env` (locally) and Cloudflare's environment variable settings (production) as `MAPBOX_GEOCODER_TOKEN`

### Cloudflare KV namespace setup

Geocode results in production are cached in a Cloudflare KV namespace bound to
the worker as `CACHE`. The same namespace also backs the Google Calendar cache
(see [Events → Caching](#caching)); keys are prefixed per purpose (`v2:` for
geocoding, `gcal:v1:` for calendar) so they can't collide. In development, the
app falls back to an in-process map (no KV needed). KV namespaces live in the
same Cloudflare account as the worker.

Production and staging each have their own namespace, so a staging run can't
poison production's cache.

1. Sign in to the Cloudflare dashboard using the **TidewaterDSA account**
2. Go to **Workers & Pages → KV** in the sidebar
3. Click **Create a namespace** and give it any name — the name is just a dashboard label, the _binding_ name is what the code references
4. Copy the namespace ID Cloudflare assigns. Also create a separate "preview" namespace if you want isolated `wrangler dev` testing, its ID goes in the `preview_id` field
5. Open `apps/website/wrangler.jsonc` and update both IDs:

   ```jsonc
   "kv_namespaces": [
     {
       "binding": "CACHE",
       "id": "<production_namespace_id_from_dashboard>",
       "preview_id": "<preview_namespace_id_from_dashboard>"
     }
   ]
   ```

   These IDs are not secrets, they're just namespace identifiers and have no value without write access to the Cloudflare account. They're committed to the repo intentionally, alongside the worker config.

6. Commit and deploy. The worker will start writing geocode results to the new namespace on its first request.

### CSV export

The "Export CSV" action on the resources toolbar generates a CSV of the currently-filtered resource list. The CSV column set is defined in `src/lib/resource-csv.ts` (`CSV_COLUMNS`) and is intentionally distinct from the sheet's source column names: the sheet uses verbose internal labels ("Hours of Operation/How to Access", "Last Verification Date") because volunteers fill it in, while the export uses tighter names ("Hours", "Last Verified") because it's a deliverable.

To add or rename a column, edit the `CSV_COLUMNS` array. Each entry is `{ header, get }`, where `get` receives a `Resource` and returns a string. Newlines inside cells are collapsed to spaces, and commas or quotes trigger RFC-4180-style quoting (`escapeCsvCell`).

### Print-friendly handout

The "Print" action renders a print-only layout via `PrintableResources` in `src/components/resources/PrintableResources.tsx`, portaled into a top-level `<div id="printable-resources" aria-hidden>` so it doesn't interfere with the live page. Styling lives in `src/styles/print-resources.css` and is keyed entirely on `@media print` so the handout never shows in screen mode.

The handout:

- Honors the currently active filters (search, categories, cities, languages, free-only) and lists them in the header so the printed copy is self-describing.
- Groups resources by primary category, using the first entry in the `Categories` column, matching the directory accordion grouping.
- Prints the date stamp and resource count alongside the resources page headline from Sanity.
- Includes the print footer text configured on the Resources Page singleton.

Editorial changes (headline, footer) flow through Sanity. Layout changes (font sizes, column widths, page breaks) happen in the print stylesheet.

## Adding routes

Astro uses file-based routing. Any `.astro` file in `src/pages/` becomes a route. Dynamic routes use bracket syntax — `src/pages/[slug].astro` matches `/anything`, with the matched segment available as `Astro.params.slug`.

For content-driven pages, query Sanity in the frontmatter using `loadQuery` and render the data. Check `src/pages/index.astro` and `src/pages/[slug].astro` for patterns to copy.

### 404 handling

`src/pages/404.astro` renders for any unmatched route. Its content is editable in
Studio under **Pages → 404 Page** (`notFoundPage` singleton), and every field
falls back to a hard-coded default — the page has to render even when Sanity is
unreachable, since that's one of the ways a visitor ends up on an error page.

`[slug].astro` returns `Astro.rewrite("/404")` when Sanity has no page at that
slug. Returning a bare `new Response(null, { status: 404 })` instead leaves the
browser to draw its own error screen, which is what it used to do.

Unmatched routes also depend on the `ASSETS` binding in `wrangler.jsonc`. The
adapter calls `env.ASSETS.fetch()` for anything it can't match, so without a
binding name that throws a `TypeError` and every 404 becomes a 500.

## Middleware

`src/middleware.ts` runs for every server-rendered route. Static assets are
served by the `ASSETS` binding before the Worker runs, so it covers pages and API
routes only.

### Search engine indexing

Any deployment whose `ENVIRONMENT` runtime variable is not exactly `production`
gets `X-Robots-Tag: noindex, nofollow`. This is a header rather than a
`robots.txt` because one bundle deploys to both environments, so the decision has
to be made at runtime — and unlike `robots.txt`, a header also keeps `/admin` out
of an index once its URL has been discovered.

It fails closed: anything not explicitly `production` is noindexed, so a missing
or misspelled variable can't accidentally expose staging to crawlers.

### Security headers

| Header                    | Value                             |
| ------------------------- | --------------------------------- |
| `Content-Security-Policy` | `frame-ancestors 'self'`          |
| `X-Content-Type-Options`  | `nosniff`                         |
| `Referrer-Policy`         | `strict-origin-when-cross-origin` |

`frame-ancestors 'self'` stops another site framing `/admin` and clickjacking a
signed-in editor. It is `'self'` rather than `'none'` because Sanity presentation
mode frames site pages from the Studio, which is same-origin (`studioUrl` is
`/admin`).

There is deliberately no `script-src` policy yet. The Action Network widget
injects a remote script and stylesheet and the Studio uses inline scripts, so a
strict policy breaks both and needs its own pass.

## Deployment

The app deploys to Cloudflare Workers via the `@astrojs/cloudflare` adapter. Two
Workers are connected to this repo through Cloudflare Workers Builds:

| Worker                  | Branch    | Dataset      | Visual editing | Mock data |
| ----------------------- | --------- | ------------ | -------------- | --------- |
| `tidewater-dsa`         | `main`    | `production` | off            | off       |
| `tidewater-dsa-staging` | `staging` | `staging`    | on             | off       |

Each Worker builds from the **repo root** — npm workspaces resolve
`@tidewater-dsa/ui` from there — with a `--config` flag reaching into this app:

- Root directory: `/`
- Build command: `npm ci && npm run build`
- Deploy command: `npx wrangler deploy --config apps/website/wrangler.jsonc --env=""`
  (staging uses `--env staging`)

Two things that will bite:

- **The Worker name in the dashboard must match `name` in `wrangler.jsonc`.**
  The deploy command targets the name in config, not the Worker the build is
  attached to; a mismatch silently creates a second Worker.
- **Each Worker sets its own production branch** (Settings → Build → Branch
  control). For the staging Worker that branch is `staging`. Pushes to a
  non-production branch run `wrangler versions upload` instead of deploying, so
  the site wouldn't change.

For moving to a custom domain, see [DOMAIN-CUTOVER.md](./DOMAIN-CUTOVER.md).

### Why Cloudflare Workers

The Cloudflare adapter gives us SSR with effectively zero hosting cost — the free tier covers 100,000 requests per day, far more than a chapter site will ever need. SSR is required because the Sanity Presentation tool needs server rendering to display draft content with stega-encoded overlays.

### Environment variables

Cloudflare has **two** variable panels and they are not interchangeable. Which
one a variable belongs in depends on whether the code reads it at build time or
at request time (see [Build-time vs runtime
variables](#build-time-vs-runtime-variables)).

**Settings → Build → Variables and secrets** — available during
`npm run build`, frozen into the bundle:

- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET` — `production` or `staging`
- `PUBLIC_SITE_URL` — the deployed origin, no trailing slash
- `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` — `false` in production
- `SANITY_API_READ_TOKEN` — **staging only** (see below)
- `NODE_OPTIONS` — build memory, if the build runs out

**Settings → Variables and Secrets** — read per request via
`locals.runtime.env`. Add these as **Secrets**, not plain text:

- `GOOGLE_CALENDAR_ID`, `GOOGLE_CALENDAR_API_KEY`
- `GOOGLE_SHEETS_API_KEY`
- `MAPBOX_GEOCODER_TOKEN`

`ENVIRONMENT` and `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` live in
`wrangler.jsonc` rather than the dashboard. **Don't add plain-text runtime
variables in the dashboard** — `wrangler deploy` overwrites dashboard `vars` from
the config file on every build. Secrets are preserved; plain variables are not.

#### Why `SANITY_API_READ_TOKEN` is staging-only

`load-query.ts` reads the token through `import.meta.env`, so Vite **inlines it
into the bundle as a plaintext string**. The bundle isn't publicly served
(`public/.assetsignore` excludes `_worker.js`), but it is readable by anyone with
Cloudflare dashboard access.

Production builds with visual editing `false`, so the token branch is
dead-code-eliminated and the value never appears in the bundle — which is why
production doesn't need the variable at all. Staging builds with visual editing
`true` and does bake it in. Keep it a read-only **Viewer** token, and don't add
it to the production Worker: if someone later flips visual editing on there, it
would be compiled in immediately.

Visual editing should stay disabled in production. It fetches draft content, adds
overhead, and pulls the token into the bundle.

### KV namespace bindings

Unlike secrets, bindings live in `wrangler.jsonc` in the repo, not in the
dashboard:

- `CACHE` — KV namespace backing geocoding and calendar caches. Production and
  staging point at different namespaces.
- `ASSETS` — the static asset service. Required: the adapter calls
  `env.ASSETS.fetch()` for unmatched routes, and without it every 404 is a 500.

The committed `id` and `preview_id` fields point to specific KV namespaces in the
Cloudflare account that owns the worker. They aren't secrets — they're
identifiers with no value without account access. See the **Cloudflare KV
namespace setup** section under Community Resources for the one-time creation
steps.
