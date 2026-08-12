# Tidewater DSA Monorepo

A Turborepo monorepo housing web applications and shared packages built by and for Tidewater DSA, the Hampton Roads chapter of the Democratic Socialists of America.

This repo is set up to grow. New chapter tools, internal dashboards, campaign microsites, and other apps can be added alongside the existing packages without restructuring. Each app gets its own folder under `apps/`, shares UI components and utilities from `packages/`, and benefits from Turborepo's cached builds and unified tooling.

## Repository structure

```
tidewater-dsa/
├── apps/
│   └── website/   # Public-facing chapter website — see apps/website/README.md
└── packages/
    └── ui/        # Shared shadcn/ui components — see packages/ui/README.md
```

Apps are free to use whatever framework makes sense for the job. The current `website` app is built with Astro, but future apps aren't locked into that choice — an admin dashboard could be Next.js, an API service could be a plain Node worker, and so on. The shared `packages/ui` library is framework-agnostic React, so any app that renders React (which includes Astro via islands) can use it.

## Prerequisites

- Node.js 22 (see `.node-version`)
- npm 10 or later

## Development standards

The monorepo enforces a few quality guardrails so things stay clean as more people and packages get added.

**Editor setup.**
If you use VS Code, you should be prompted to install  the recommended workspace extensions when you open the project. If you missed the prompt, search `@recommended` in the Extensions panel. These include ESLint, Tailwind, and Astro plugins that surface errors inline as you type.

**Strict typing.**
This project relies on strict TypeScript rules to keep the codebase healthy. The `any` and `unknown` types will cause the linter to fail, so please use proper TypeScript interfaces or Sanity's generated types instead.

**Pre-commit hooks**
Husky is set up to help catch code quality and type safety issues before they are committed. 
Running `git commit` automatically triggers two checks:

- **Type generation:** It runs the Sanity type generator (`npm run typegen`). If this generates new types that haven't been staged, the commit is rejected so outdated types don't slip into the codebase.
- **Linting:** It runs a global `npm run lint` across the monorepo. Turborepo's caching keeps this fast, only changed packages get re-evaluated. Commits with lint errors are rejected before they land.

In addition, a `commit-msg` hook validates that your commit message follows the conventions below.

### Commit message conventions

Commits in this repo follow a lightweight version of the [Conventional Commits](https://www.conventionalcommits.org/) spec. The format is:

```
<type>(optional scope): <subject>
```

The `<type>` prefix is required and tells reviewers (and our future tooling — changelogs, release notes, etc.) what kind of change a commit introduces.

| Prefix     | When to use it                                                                  |
| ---------- | ------------------------------------------------------------------------------- |
| `feat`     | A new user-facing feature or capability.                                        |
| `fix`      | A bug fix.                                                                      |
| `chore`    | Maintenance work that isn't a feature or fix — dep bumps, tooling, config, etc. |
| `docs`     | Documentation-only changes (README, comments, in-repo guides).                  |
| `refactor` | A code change that neither fixes a bug nor adds a feature.                      |
| `style`    | Formatting, whitespace, or other non-semantic code changes.                     |
| `test`     | Adding or updating tests.                                                       |
| `perf`     | A change that improves performance.                                             |
| `build`    | Changes to the build system or external dependencies.                           |
| `ci`       | Changes to CI configuration or scripts.                                         |

The scope in parentheses is optional and usually names the app or package the change affects (e.g. `website`, `ui`). Use it when the touched area isn't obvious from the subject.

Examples:

```
feat: add events calendar filter
fix(website): correct timezone on event card
chore: bump turbo to 2.8.17
docs: document commit message conventions
refactor(ui): extract shared button variants
```

The `commit-msg` Husky hook rejects commits whose first line doesn't match this pattern. Merge, revert, and `fixup!`/`squash!` commits are passed through unchanged.

## Getting started

Clone the repo and install dependencies from the root. npm workspaces will install dependencies for every app and package in a single pass.

```bash
npm ci
```

Start all dev servers:

```bash
npm run dev
```

For app-specific setup — environment variables, external service configuration, etc. — see the README inside each app's folder.

## Common tasks

All commands run from the repo root and are orchestrated by Turborepo. They execute across every package in the monorepo in dependency order, with output cached between runs for fast incremental builds.

```bash
npm run dev          # Start all dev servers
npm run build        # Production build
npm run lint         # Lint all packages
npm run typecheck    # Type check all packages
npm run format       # Format with Prettier
npm run format:check # Check formatting without writing (useful in CI)
npm run typegen      # Regenerate Sanity types (runs in every package that defines a `typegen` task)
```

To run a command for a single package, use the npm workspace flag:

```bash
npm run dev --workspace=website
```

## Adding apps and packages

New apps go in `apps/`, new shared libraries go in `packages/`. Each package needs its own `package.json` with a unique name (by convention, `@tidewater-dsa/<name>` for shared packages). Turborepo and npm workspaces pick up new packages automatically — no root config changes required.

A new package can depend on any other package in the monorepo by adding it to its `dependencies` with the version `"*"`:

```json
{
  "dependencies": {
    "@tidewater-dsa/ui": "*"
  }
}
```

## Architecture notes

### Why a monorepo

Chapter projects tend to accumulate over time — a public site, an event calendar, an internal organizer directory, a mutual aid tracker, a campaign microsite for a specific initiative. Keeping them in one repo means shared design tokens, shared components, shared auth helpers, and shared tooling all get reused instead of reinvented. Turborepo caches build output across packages so adding more apps doesn't slow down development.

### Why npm instead of pnpm

The repo originally used pnpm, but several dependencies in the Sanity visual editing chain (`react-is`, `react-compiler-runtime`, `lodash`, and others) ship as CommonJS modules. Vite's dev server pre-bundles CJS dependencies into ESM so the browser can import them, but pnpm's strict symlink-based `node_modules` layout puts these packages deep inside the `.pnpm` content store where Vite's optimizer can't reach them through the symlinks. The result was a cascade of "does not provide an export named 'default'" errors in the browser whenever the visual editing component tried to hydrate.

npm's flat `node_modules` layout sidesteps the entire problem — Vite can find and pre-bundle every CJS dependency, and the visual editing component hydrates cleanly. Turborepo is package-manager agnostic, so the migration was just a matter of deleting the pnpm lockfile and workspace config, adding a `workspaces` array to the root `package.json`, and running `npm install`. No code changes were required.

If pnpm's disk efficiency or strict isolation matters for a future app in this monorepo, it's possible to switch back — but only for apps that don't depend on `@sanity/visual-editing` or anything else with similar CJS interop issues.