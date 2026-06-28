# Sticky filter section headers in the modal

**Goal:** In the filters modal, a long expanded group (e.g. Make/Brand, 68
chips) can fill the screen. The user shouldn't have to scroll back up to reach
the group's collapse toggle. So each group header should stick to the top of the
modal while scrolling its chips, and the next group's header takes over as it
comes into view (iOS-style section headers).

**Implementation:** `.filter-group-header { position: sticky; top: 0 }` inside
the scrolling `.modal-body`.

**Key gotcha:** `position: sticky` is trapped by any ancestor with
`overflow: hidden` (it becomes the sticky's scroll container). `.filter-group`
had `overflow: hidden` (for corner clipping), which made the header stick to the
group instead of the modal — i.e. no effect. **Fix: remove `overflow: hidden`
from `.filter-group`** and instead round the header's top corners
(`border-radius`) so backgrounds don't poke past the group's rounded border.

**Details:**
- The header needs a solid `background` (chips scroll under it) and a higher
  `z-index` than the chips.
- The header's containing block is its own `.filter-group`, so it naturally
  releases at the group's bottom and the next group's header takes the top —
  giving the "last group scrolled into stays pinned" behavior for free.
- Set `.modal-body` `padding-top: 0` so the header sticks flush to the top
  (scroll-container top padding otherwise offsets the stuck position); add a
  little top breathing room via `:first-child { margin-top }` (it scrolls away).

**Verification:** scroll into Make/Brand → its header is pinned at the modal top
(`headerRect.top ≈ modalBody.top`); collapse toggle reachable without scrolling
up.
