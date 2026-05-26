# Amend.sh Pricing And Positioning Analysis

Updated: 2026-05-21

## Decision

Amend should position as developer-native product update automation, not as another voting board.
The wedge is: connect GitHub evidence to customer demand, then review and publish the roadmap,
changelog, request status, and "you asked, we shipped" notifications from one loop.

Keep the plan ladder in the product surface:

- Open Source: free self-hosted core, BYO providers, public roadmap/changelog/portal, SDK/API/CLI,
  deterministic local agent, and source-linked audit trail.
- Free Cloud: hosted trial for public/small projects with limited projects, notification volume, and
  history.
- Starter: $19/mo annual or $24/mo monthly for founders/OSS maintainers who want multiple active
  projects, custom domain, GitHub sync, CLI/SDK workflows, and local-provider fallback.
- Pro: $49/mo annual or $59/mo monthly for the hosted proactive agent, integrations, notification
  outbox, build briefs, review workflows, and more history.
- Team: $99/mo annual or $129/mo monthly for members, permissions, private boards, branding,
  custom domains, and higher notification volume.
- Scale: custom for higher volume, white-label embeds, compliance/security review, longer history,
  and priority support.

Do not add a separate Hobby/Builder tier yet. Canny's new Core tier already anchors at $19/mo, and
Kampsite also uses $19/mo for a simple board/changelog product. Amend can own $19 as a credible
Starter price only if the product makes clear that the paid value is GitHub-linked automation and
agent workflows, not just "more boards."

## Current Market Notes

| Product                             | Current evidence                                                                                                                                                                                                                                                                                                                                                | Pricing/packaging signal                                                                                | Amend implication                                                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Featurebase                         | Official help says Free, Growth, Professional, Enterprise; annual full-seat prices are $29, $59, and $99 per seat. It also charges usage-based Fibi AI resolutions, outbound changelog emails after the included tier, translations, and add-ons such as whitelabeling. Source: https://help.featurebase.app/articles/7608294-featurebase-pricing-explained     | Strong suite for support + feedback + changelog, but per-seat plus usage can climb.                     | Avoid competing as a cheaper support suite. Lead with GitHub source of truth, self-host/BYO, audit trail, and coding-agent loop.                 |
| Canny                               | Official docs say the 2025+ model is tracked-user based: Free includes 25 tracked users; Core starts at $19/mo annual for 100 tracked users; Pro starts at $79/mo annual for 100 tracked users; every plan includes roadmap and changelog. Source: https://help.canny.io/en/articles/9131812-canny-s-billing-plans and https://canny.io/blog/new-pricing-plans/ | Canny owns classic feedback board + roadmap + changelog and has AI Autopilot.                           | Amend will be dismissed if the landing page leads with voting boards. The differentiator must be "GitHub shipped it, Amend closes the loop."     |
| Kampsite                            | Official pricing shows Starter free for up to 30 suggestions and Plus at $19/mo with unlimited suggestions, 3-5 team members, custom domain, and labels. Source: https://kampsite.co/pricing                                                                                                                                                                    | Low-price simple feedback/changelog/roadmap anchor.                                                     | Starter at $19 is credible, but only as a founder/OSS automation plan, not a board-only plan.                                                    |
| Headway                             | Official homepage shows Free and Pro at $29/mo; Pro adds whitelabel, custom domain, integrations, team management, search privacy, private changelog, and scheduled publishing. Source: https://headwayapp.co/                                                                                                                                                  | Changelog-only simplicity is cheap and easy to explain.                                                 | Amend should not over-index on changelog pages; use changelog as the output of the GitHub/customer loop.                                         |
| Noticeable                          | Official pricing has Free, Starter, Growth, Business, and Enterprise with widget/project limits. Source: https://noticeable.io/pricing                                                                                                                                                                                                                          | Product-update/changelog category is crowded and widget-led.                                            | Embed must be tasteful and useful, but the product cannot be "just a widget."                                                                    |
| airfocus                            | Official pricing is request-pricing Professional/Enterprise, with roadmap, prioritization, feedback/insights, branded portals, AI, and enterprise security. Source: https://airfocus.com/pricing/                                                                                                                                                               | Product-management suite is heavier and sales-led.                                                      | Amend should stay self-serve, developer-native, and non-enterprise-first.                                                                        |
| Linear-style workflows              | Linear's GitHub Marketplace listing describes PR/commit automation that links issues to PRs and moves issues as PRs merge. Source: https://github.com/marketplace/linear                                                                                                                                                                                        | Linear is the delivery system of record for many teams, but it is not a public customer loop by itself. | Amend should integrate with GitHub first and Linear later; the promise is external demand and notification closure, not internal issue tracking. |
| Productlane / Linear-adjacent tools | Productlane positions around Linear support portal, feedback board, roadmap, changelog, and auto-generated changelogs from Linear. Source: https://productlane.com/                                                                                                                                                                                             | The "Linear plus customer portal" story exists.                                                         | Amend's GitHub-first, OSS/self-host, CLI/API/agent workflow must be explicit.                                                                    |

## Dismissal Risks

- "Another feedback board": triggered by voting-board screenshots, generic feature-grid copy, or
  pricing around suggestion limits.
- "Another changelog widget": triggered by a Headway/Noticeable-style first screen without the
  source-linked GitHub workflow.
- "Another PM suite": triggered by airfocus-style portfolio language, OKRs, capacity planning, or
  enterprise-first packaging.
- "AI wrapper": triggered by chat-first framing or vague "AI summarizes feedback" copy without
  source links, review rules, deterministic local mode, and audit trails.

## Differentiation To Surface

- GitHub is the shipping source of truth: PRs, issues, releases, labels, milestones, and commits
  create evidence.
- Customer signals are unified across portal, embed, SDK/API, CLI imports, Slack, Discord, support
  exports, GitHub issues/discussions, and manual imports.
- The proactive agent proposes status changes, changelog drafts, build briefs, and notification
  targets with confidence, review state, and source links.
- Local beta works with no provider keys: deterministic demo agent, seeded data, local outbox, dry
  run email/Slack, and provider-gated setup states.
- AI/coding agents can use Amend before and after coding: fetch demand, inspect evidence, build the
  requested thing, draft updates, and ask who should be notified.
- Self-host/BYO is a trust feature, not a footnote.

## First Buyers

1. OSS maintainers who want a public roadmap/changelog and subscriber loop without manual upkeep.
2. Solo founders and indie SaaS builders who need to know what users want and announce shipped work.
3. Devtool and small B2B SaaS teams where GitHub is the real source of delivery truth.
4. Founder-led teams adopting Claude/Codex/Cursor/OpenCode who want agents to work from real demand.

## Product Promise

Connect GitHub and your users. When work ships, Amend updates your product story and closes the
loop with the people who asked for it.

## Product Surface Requirements From This Research

- The first viewport must show the customer-signal -> GitHub-shipped -> review -> notify loop.
- Pricing must include Open Source and Free Cloud before Starter to build trust.
- The $19 tier should be Starter, not a hidden Hobby plan.
- Pro should monetize hosted proactive agent workflows, more active projects, integrations, and
  notification automation.
- Team should monetize permissions, private boards, branding/custom domains, and collaboration.
- Scale should be custom but not the center of the product.
- Docs and setup UI must make BYO provider keys and local demo mode explicit.
