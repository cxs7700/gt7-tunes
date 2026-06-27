# Grid/flex items overflowing on mobile (image intrinsic width)

**Problem:** On phones the tune cards rendered far wider than the viewport
(grid track ~659px on a 390px screen), so mobile browsers zoomed out to fit and
the cards dwarfed the filters.

**Cause:** Grid (and flex) items default to `min-width: auto`, whose automatic
minimum is the item's **min-content** size. Each card contains a cover `<img>`
whose intrinsic width (~625px) became the column's minimum, forcing the
`1fr` track wider than the container.

**Fix:**
- `.post-card { min-width: 0 }` so items can shrink below their content's
  intrinsic width.
- Grid track `minmax(min(340px, 100%), 1fr)` so a column never exceeds a narrow
  viewport even before the single-column breakpoint kicks in.
- `overflow-wrap: anywhere` on title/preview for very long unbroken strings.

**Verification:** at 390px and 360px viewports, `document.scrollWidth ===
innerWidth` (no horizontal overflow) and card width equals the filter panel width.

**Why:** `width: 100%` on the image limits its *preferred* size but not the
item's *minimum* contribution to track sizing — only `min-width: 0` does.
