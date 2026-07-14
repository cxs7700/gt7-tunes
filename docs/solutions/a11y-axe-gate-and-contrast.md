# Accessibility: axe gate + accent contrast

**Goal.** An accessibility pass, kept honest by CI.

**Findings (axe-core, WCAG 2 A/AA over home / detail / tag / filters-modal).**
The app was already in good shape (aria-labels, focus trap in the modal,
reduced-motion handling). One **serious** issue: white text on the brand accent
`#e94560` measured **~3.8:1**, below the **4.5:1** AA threshold for normal text —
affecting every filled accent surface (primary buttons, active chips, the PP
chip, badges).

**Fixes.**
- Darkened `--accent` (and `--tag-active`) `#e94560 → #db1a4a`, which lifts
  white-on-accent to ~4.8:1. Same brand hue, just AA-compliant. Decorative uses
  (borders, focus rings, gradients) still read as the same red. *Revertible in
  one variable if the exact old hue is preferred.*
- Added a **skip-to-content** link (first tab stop, visible on focus) targeting a
  `#main` wrapper around the routed content.

**Gate.** `e2e/a11y.spec.ts` runs `@axe-core/playwright` against the built static
export and fails on any serious/critical WCAG 2 A/AA violation across home,
detail, tag pages, and the open filters modal — so regressions (a low-contrast
color, a missing label) fail CI.

**Note.** axe catches ~a third of issues automatically; it's a floor, not a
certificate. The gate prevents obvious regressions; manual SR/keyboard passes
still matter for the rest.
