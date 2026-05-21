# Amend UI Browser Evidence

Date: 2026-05-09
URL: `http://amend.localhost:1355`
Browser tool: `agent-browser-safe`
Session: `ab-amend-70043-674e1437`

## Screenshots

- `home-desktop.png` - `/` at 1440x1000
- `home-mobile.png` - `/` at 390x844
- `dashboard-desktop.png` - authenticated `/dashboard` at 1440x1000
- `dashboard-mobile.png` - authenticated `/dashboard` at 390x844
- `dashboard-connections-desktop.png` - authenticated connections view at 1440x1000
- `portal-desktop.png` - `/portal/amend-labs` at 1440x1000
- `portal-mobile.png` - `/portal/amend-labs` at 390x844
- `embed-desktop.png` - `/embed-demo` with the side panel mounted at 1440x1000
- `ui-layout-reference.svg` - local design reference board for landing, auth, dashboard, portal, setup, and embed layouts

## Browser Checks

- Home desktop/mobile: hero copy and required CTAs visible: `Open workspace`, `View portal`, `SDK/API setup`.
- Dashboard desktop/mobile: authenticated account created through Better Auth, workspace surface visible, review queue visible, no horizontal overflow.
- Dashboard connections: provider-gated setup surface visible with GitHub, AI, email, billing, domains, and API security sections.
- Portal desktop/mobile: changelog/roadmap/customer signal surface visible, source links present, no horizontal overflow.
- Embed desktop: SDK side panel mounted, shadow DOM includes the new primary theme value, no horizontal overflow.

## Command Gates

- `bun run format` passed.
- `bun run check` passed: lint, format check, typecheck, and 23 tests.
- `bun run smoke` passed: 24 checks through portless and local Convex REST.
- `bun run readiness` passed local readiness checks; it reports 17 expected production provider/env items as `NEEDS`.
- `bun run build` passed; largest client chunk is `408.18 KiB`.
