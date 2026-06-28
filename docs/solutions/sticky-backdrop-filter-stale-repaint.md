# Sticky element + backdrop-filter doesn't repaint on content change (mobile)

**Problem.** The sticky bottom pagination bar's "Page x of y" text (and the
Prev/Next disabled states) didn't visually update when tapping the buttons. The
value only refreshed after an unrelated scroll/touch/focus (e.g. focusing a card
while scrolling).

**Symptom.** State was *correct* — once any later event forced a repaint, the
indicator showed the right number immediately. So this was a paint bug, not a
state/logic bug. (A separate, earlier fix had already made the page math use a
functional `setState`; that was necessary but not sufficient.)

**Cause.** `.list-footer` was `position: sticky` **and** owned a
`backdrop-filter: blur(...)`. That combination promotes the element to a
composited layer whose rasterization the mobile browser caches. When only the
inner text or a button's `disabled` attribute changes, the cached layer is not
re-rasterized; a scroll/touch invalidates the layer and it finally repaints the
(already-updated) DOM.

**Fix.** Move the filter off the element that contains the changing content onto
a pseudo-element layer:

```css
.list-footer {
  position: sticky; bottom: 0;
  isolation: isolate;            /* keep ::before behind the controls */
  /* no background / backdrop-filter here */
}
.list-footer::before {
  content: ''; position: absolute; inset: 0; z-index: -1;
  background: rgba(15,16,32,0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

The frosted look is unchanged (the `::before` still blurs the content scrolling
under the bar), but the footer's own content now repaints normally on every
state change. Belt-and-suspenders: give the indicator a `key={current}` so React
remounts the text node each page change.

**Why.** The raster-cache bug attaches to the element that *owns* the
`backdrop-filter`. Isolating the filter to a child/pseudo layer that contains no
mutating content means content updates happen in a normal (non-cached) layer.

**Rule.** Don't put `backdrop-filter` (or `filter`/`will-change:transform`) on a
sticky/fixed element whose text or child state changes at runtime. Frost via a
`::before`/overlay layer instead.
