# Amend dashboard motion system

One small, consistent motion language. Default to **less motion, better timing**. Premium product bar (Linear/Vercel): fast cause-and-effect, exact spatial origins, no decorative drift. Everything respects `prefers-reduced-motion`.

## Where it lives

- **Tokens:** `packages/ui/src/styles/theme.css` (`--dropdown-*`, `--modal-*`, `--panel-*`, `--icon-swap-*`).
- **CSS classes:** `packages/ui/src/styles/motion.css` (`t-dropdown`, `t-modal`, `t-panel-slide`, `t-icon-swap`, `t-resize`, `t-nav-indicator`).
- **Lifecycle hook:** `apps/web/src/components/use-disclosure-transition.ts`.

## Dropdowns / popovers / menus (`t-dropdown`)

Fade + scale from the trigger origin. Enter ~190ms ease-out (`cubic-bezier(0.16,1,0.3,1)`), exit ~130ms ease-in. The element must mount in the **closed** state, flip to `is-open` on the next frame (so the entrance actually plays), and stay mounted through `is-closing` before unmounting.

Do not hand-roll this — use `useDisclosureTransition`, which manages mount/enter/exit and reduced-motion:

```tsx
const t = useDisclosureTransition(open, "top-right"); // origin → data-origin
if (!t.mounted) return null;
return (
  <div className={cn("absolute …", t.className)} data-origin={t["data-origin"]}>
    …
  </div>
);
```

Origins: `top-left | top-center | top-right | bottom-left | bottom-center | bottom-right` (sets `transform-origin`).

Used by: `dashboard-header-filters.tsx` (Filters), `dashboard-workspace-switcher.tsx` (project switcher). base-ui `DropdownMenu` (account menu) self-manages mount/exit and is tuned to match.

## Panels / page surfaces (`t-panel-slide`)

Workspace content rises + unblurs in. Apply `t-panel-slide` + `data-open="true"`. Already wired into `DashboardWorkspaceSurface`.

## Modals (`t-modal`)

Center scale + fade with `is-open` / `is-closing`. See `post-composer-modal.tsx`.

## Sidebar active indicator (`t-nav-indicator`)

The active nav rail grows in from center (220ms). Add `t-nav-indicator` to the absolutely-positioned indicator span; keep `-translate-y-1/2` for centering.

## Rules

- Animate **transform + opacity** only. Never `transition: all`.
- Distance is small: 2–8px for menus/popovers; scale 0.96→1.
- Exits are faster than entrances and land exactly on the layout (no overshoot/bounce).
- Reduced motion: hook skips the frame delays; CSS zeroes transitions. Meaning is preserved.
- Add a new library only if the task truly needs it — this system covers menus, modals, panels, icon/number swaps, and resizes.
