# Derive specs from tags, not the title — and the "lap time" that wasn't

**Goal.** A derived-metadata layer (`lib/derive.ts`) to power useful sorting and
"at a glance" spec chips, without mutating `data/posts.json`.

**Trap avoided.** Titles look like rich structured data, e.g.
`Peugeot 9X8 '25 Gr1 - 4WD - WEC SPECS - Racing Hard Tires - All Track - 1.70`.
The trailing `1.70` is tempting to read as a **lap time** — but it's a red
herring. Across 1022 titles it only takes 19 values (1.49–1.70) and is
**invariant to track**: Nordschleife averages 1.59, All Track 1.60, Le Mans 1.61
— impossible for a real lap (a Nordschleife lap is 6–8 minutes). It's the
tuner's internal setup/version number, not a user-facing metric. Don't surface
it.

**What actually works.** The genuinely useful specs already live in the **tags**
and are already categorized by `lib/categorize.ts`. Coverage measured over 1068
posts:

- PP (`700PP` → 700): **86%**
- Drivetrain (FR/MR/FF/RR/4WD): **90%**
- Class (Gr1–Gr4/GrB…): 16%
- Rating (stars): 25% from tags alone → **91%** with a body fallback
  (`/(\d+)\s*stars?/i`; posts open with "5 STARS CAR SETUP").

**Decision.** `lib/derive.ts` reads tags (and body, for stars) — never the
fragile title regex — so the source of truth stays the tags. It exposes:
`derivePp`, `deriveStars` (numbers, for sorting), and `headlineSpecs` (ordered
PP → Class → Drivetrain → Rating chips). Sort (`lib/filter.ts`) and spec chips
(`components/SpecChips.tsx`) both build on this one primitive; sorts use a stable
sort so ties keep newest-first order and key-less posts sink to the bottom.

**Lesson.** Measure coverage and check invariants before parsing. A field that
*looks* structured (the title) was less reliable and less meaningful than the
data already normalized into tags.
