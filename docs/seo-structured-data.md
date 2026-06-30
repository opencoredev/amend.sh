# SEO Metadata And Structured Data

This is the engineering reference for the web app's SEO surface: canonical links, Open Graph/Twitter
metadata, `noindex` policy, and schema.org JSON-LD. The shared helpers live in
`apps/web/src/lib/seo.ts`; route and component code imports them rather than hand-writing tags. The
docs site (`apps/fumadocs`) emits its own JSON-LD inline and is covered at the end.

These surfaces are validated by the agent-ready checks (`scripts/agent-ready-*`), so the shapes
described here are contractual, not cosmetic. Read this before adding or moving any structured data.

## Intent

Public pages must be crawlable and machine-parseable so search engines and AI agents can read the
product. That means every public web route exposes a canonical URL, Open Graph/Twitter cards, and at
least one valid JSON-LD block, while private app routes are excluded from indexing. The
`agent-ready-audit` (`docs/agent-ready-audit.md`) tracks this as a launch requirement.

## The Module: `apps/web/src/lib/seo.ts`

A single module owns the SEO primitives so the values stay consistent across routes.

| Export                  | Kind     | Purpose                                                                 |
| ----------------------- | -------- | ----------------------------------------------------------------------- |
| `siteUrl`               | const    | Canonical web origin (`https://amend.sh`).                              |
| `agentDocsUrl`          | const    | Canonical docs origin (`https://docs.amend.sh`).                        |
| `defaultOgImage`        | const    | Absolute URL of the default social card.                               |
| `defaultTitle`          | const    | Default page title.                                                     |
| `defaultDescription`    | const    | Default meta/OG description.                                            |
| `canonicalUrl(path)`    | function | Absolute canonical URL for a path.                                      |
| `canonicalLink(path)`   | function | `{ rel: "canonical", href }` link descriptor for a route `head`.       |
| `openGraphMeta(opts)`   | function | Full Open Graph + Twitter card meta array for a page.                   |
| `noIndexMeta`           | const    | `robots: noindex, nofollow` meta, for private routes.                   |
| `organizationJsonLd`    | const    | `Organization` JSON-LD node (no `@context`; see below).                 |
| `productJsonLd`         | const    | `SoftwareApplication` JSON-LD node with offers and feature list.       |
| `faqJsonLd`             | const    | `FAQPage` JSON-LD node.                                                  |
| `changelogJsonLd(...)`  | function | Builds `TechArticle` nodes from a portal's published changelog entries. |

### Canonical And Social Metadata

`canonicalLink()` and `openGraphMeta()` return descriptors for a TanStack Router route `head`. They
default to the home path and the default title/description, so most routes only override what differs:

```ts
import { canonicalLink, openGraphMeta } from "@/lib/seo";

export const Route = createFileRoute("/brand")({
  head: () => ({
    links: [canonicalLink("/brand")],
    meta: [...openGraphMeta({ path: "/brand", title: "Brand — Amend.sh" })],
  }),
});
```

`openGraphMeta()` always emits a `summary_large_image` Twitter card and a `1200x630` PNG, so callers
that pass a custom `image` must provide an absolute URL of those dimensions.

### Private Routes

Authenticated and transactional routes spread `noIndexMeta` into their `head` so crawlers skip them.
Sign-in, sign-up, and dashboard routes already do this; any new private route must follow suit. The
agent-ready live validator fails if a private route is missing `noindex`, or if a public route has it.

## JSON-LD Shape Contract

**Every `application/ld+json` script must serialize a single JSON object with one top-level
`@context`. When a page has more than one entity, wrap them in a `@graph` array. Never emit a bare
top-level array.**

This is the rule, not a style preference. The individual node constants in `seo.ts`
(`organizationJsonLd`, `productJsonLd`, `faqJsonLd`) intentionally **omit** `@context` — the
consuming page supplies it once at the top level.

Correct (home route, `apps/web/src/routes/index.tsx`):

```tsx
<script
  type="application/ld+json"
  suppressHydrationWarning
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [organizationJsonLd, productJsonLd, faqJsonLd],
    }),
  }}
/>
```

This renders three entities — `Organization`, `SoftwareApplication`, and `FAQPage` — under a single
context. A page with exactly one entity may instead inline that entity as the top-level object with
its own `@context` (this is how the docs landing page emits its `WebSite` node).

### The Pitfall This Prevents

Earlier home-page code injected the entities as a bare top-level array:

```tsx
// Do not do this.
JSON.stringify([organizationJsonLd, productJsonLd, faqJsonLd])
```

Each object carried its own `@context`, but the array itself had none. Any consumer that treats the
parsed JSON-LD as a single object reads `parsed["@context"]` as `undefined` and crashes when it calls
a string method on it. A production structured-data reader did exactly this and threw
`TypeError: undefined is not an object (evaluating 'r["@context"].toLowerCase')` on the live home
page. PR #19 fixed it by switching to the `@graph` shape above and dropping the now-redundant
per-object `@context`. The `@graph` form is also the more standard structured-data layout, so it is a
small SEO correctness gain on top of removing the crash.

When you add structured data, default to a single object with a top-level `@context` and a `@graph`.
That shape is safe for both array-aware and single-object consumers.

## Per-Portal Changelog JSON-LD

`changelogJsonLd(entries, workspaceSlug)` maps a portal's published changelog entries to an array of
`TechArticle` nodes (headline, description, canonical updates URL, and optional `image`/`datePublished`).
It returns the nodes only — the caller wraps them in the contract shape.

`apps/web/src/components/public-portal-view.tsx` renders it, and only when there is at least one
entry, so empty portals do not emit an empty `@graph`:

```tsx
{changelog.length > 0 ? (
  <script
    type="application/ld+json"
    suppressHydrationWarning
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": changelogJsonLd(changelog, workspaceSlug),
      }),
    }}
  />
) : null}
```

## Docs Site JSON-LD

The Fumadocs app does not import `seo.ts`; it builds its JSON-LD inline and follows the same
single-object contract:

- `apps/fumadocs/src/routes/index.tsx` — docs landing renders a single `WebSite` node with its own
  top-level `@context`.
- `apps/fumadocs/src/routes/docs/$.tsx` — each docs page renders a `@graph` of a `TechArticle` and a
  `WebSite` node under one `@context`.

Per `apps/fumadocs/AGENTS.md`, change docs JSON-LD only as part of an SEO/structured-data change, not
as incidental edits to framework or routing code.

## How It Is Validated

The structured-data contract has automated coverage; run these after touching SEO code:

- `scripts/agent-ready-live-parsing.ts` exposes `extractJsonLdTypes()` / `collectJsonLdTypes()`, which
  parse each `application/ld+json` script and recurse through `@graph`. A script that fails to parse
  is recorded as `__INVALID_JSON_LD__`, so a malformed or bare-array regression is caught as a missing
  expected type.
- `scripts/agent-ready-web-surface-tests.ts` asserts the home route references `organizationJsonLd`
  and `productJsonLd` and exposes canonical, social, and private-`noindex` metadata.
- `bun run agent-ready:built` checks JSON-LD in the generated docs HTML; `bun run agent-ready:live`
  re-checks parseable JSON-LD against the deployed hosts once DNS is configured.

```bash
bun run check
bun run test
bun run agent-ready
```

## Adding Or Changing Structured Data

1. Add or edit the node constant/factory in `apps/web/src/lib/seo.ts`. Do **not** put `@context` on
   an individual node; the page supplies it.
2. Render it inside the contract shape — a single object with a top-level `@context`, using `@graph`
   for more than one entity.
3. For a new private route, spread `noIndexMeta`; for a new public route, add `canonicalLink()` and
   `openGraphMeta()`.
4. If the homepage entity set changes, update the "Structured data" rows in
   `docs/agent-ready-audit.md` and `docs/completion-audit.md` so the audit stays accurate.
5. Run the validation commands above.
