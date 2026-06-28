# Rapid clicks collapse onto a stale value → use functional setState

**Problem.** Tapping the pager's "Next" five times quickly only advanced a
couple of pages; the "Page x of y" indicator got "stuck".

**Symptom.** With N fast taps, the page jumped by far less than N (often by 1).
Slow taps worked fine.

**Cause.** The handler computed an *absolute* target from a rendered value:
`Pagination` called `onPage(current + 1)` and `HomeClient` did `setPage(target)`.
Multiple click events fire within a single React render cycle, so every queued
handler closed over the *same* stale `current`/`page`. Each one computed and set
the same next page — the increments overwrote each other instead of composing.

**Fix.** Express intent as a relative step and resolve it with the functional
updater form of `setState`, which always receives the latest pending state:

```tsx
// HomeClient
function stepPage(delta: number) {
  setPage((p) => Math.min(Math.max(1, p + delta), totalPages));
  window.scrollTo({ top: 0 });
}
// Pagination
<button onClick={() => onStep(-1)} disabled={current <= 1}>← Prev</button>
<button onClick={() => onStep(1)}  disabled={current >= totalPages}>Next →</button>
```

Now 5 fast Next taps compose: `1 → 2 → 3 → 4 → 5 → 6`.

**Why.** `setState(fn)` queues an updater that React applies against the
freshest state, so batched/rapid updates accumulate. `setState(value)` captures
a value from the closure's render and the last write wins. Any "increment from
current" handler that can fire faster than a re-render must use the functional
form (and clamp inside it so bounds use the freshest value too).
