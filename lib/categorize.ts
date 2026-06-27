import type { Post, Categorized, TagEntry } from './types';

// Tag categorization, ported verbatim from the original single-file app.
// "Make / Brand" is an explicit allow-list of real GT7 manufacturers/brands;
// anything unmatched falls into "Other". The data file is never modified.
export const CATEGORY_ORDER = [
  'PP', 'Class', 'Drivetrain', 'Track', 'Make / Brand', 'Rating', 'Setup', 'Other',
] as const;

const DRIVETRAINS = new Set(['FF', 'FR', 'MR', 'RR', '4WD']);

const CLASSES = new Set([
  'Gr1', 'Gr2', 'Gr3', 'Gr4', 'GrB', 'VGT', 'F1', 'Super Formula', 'Nascar',
  'WTC800', 'Porsche Cup', 'historic cup', 'Historic', 'daily race', 'WEC specs',
  'Driving lesson',
]);

const TRACKS = new Set([
  'Alsace', 'Bathurst', 'Brands Hatch', 'Daytona', 'Deep Forest', 'Fuji',
  'Goodwood', 'High speed ring', 'Interlagos', 'Laguna Seca', 'Le Mans',
  'Nordschleife', 'Nordschleiffe', 'nordschleife', 'Road Atlanta', 'Route X',
  'SPA', 'Sardegna', 'Suzuka', 'suzuka', 'Tokyo', 'Tsukuba', 'watkins Glen',
  'eiger', 'all track',
]);

const SETUP = new Set(['SWAP', 'swap', 'fast', 'BOP']);

// Real GT7 manufacturers/brands (Brand Central, Legend & tuner brands).
const MAKES = new Set([
  'Abarth', 'Alfa Romeo', 'Alpine', 'AMG', 'Amuse', 'Aston Martin', 'AUDI',
  'Autobianchi', 'BAC', 'BMW', 'Bugatti', 'Chaparral', 'CHC', 'Chevrolet',
  'Citroen', 'Daihatsu', 'De Tomaso', 'DMC', 'Dodge', 'DS Automobiles',
  "Exkert's Rod", 'Ferrari', 'Fiat', 'Ford', 'Garage RCR', 'Genesis',
  'Gran Turismo', 'Greddy', 'Greening Auto Company', 'Honda', 'Hyundai',
  'Jaguar', 'jeep', 'KTM', 'Lamborghini', 'Lancia', 'Lexus', 'Maserati',
  'Mazda', 'McLaren', 'Mercedes', "Mine's", 'Mini', 'Mitsubishi', 'Nismo',
  'Nissan', 'Pagani', 'Peugeot', 'Plymouth', 'Polestar', 'Pontiac', 'Porsche',
  'Radical', 'Re Amemiya', 'Renault', 'Roadster Shop', 'RUF', 'Shelby',
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'TVR', 'Volkswagen', 'Volvo',
  'Wicked Fabrication', 'Xiaomi', 'Yangwang',
]);

export function categorize(tag: string): string {
  if (/pp$/i.test(tag) || /^\d{3,4}$/.test(tag)) return 'PP';
  if (/^\d+\s*stars?$/i.test(tag)) return 'Rating'; // "4 stars" / "5 STARS" (not "Polestar")
  if (DRIVETRAINS.has(tag)) return 'Drivetrain';
  if (CLASSES.has(tag)) return 'Class';
  if (TRACKS.has(tag)) return 'Track';
  if (SETUP.has(tag)) return 'Setup';
  if (MAKES.has(tag)) return 'Make / Brand';
  return 'Other';
}

function ppValue(tag: string): number {
  const m = tag.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function tagComparator(category: string): (a: TagEntry, b: TagEntry) => number {
  if (category === 'PP' || category === 'Rating') {
    return (a, b) => ppValue(a.tag) - ppValue(b.tag) || a.tag.localeCompare(b.tag);
  }
  return (a, b) => a.tag.toLowerCase().localeCompare(b.tag.toLowerCase());
}

export interface CategoryModel {
  categorized: Categorized;
  tagCategoryOf: Record<string, string>;
}

// Tally tags across posts and group them into sorted categories.
export function buildCategorized(posts: Post[]): CategoryModel {
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }

  const categorized: Categorized = {};
  const tagCategoryOf: Record<string, string> = {};
  for (const [tag, count] of counts) {
    const cat = categorize(tag);
    tagCategoryOf[tag] = cat;
    (categorized[cat] ??= []).push({ tag, count });
  }
  for (const cat of Object.keys(categorized)) {
    categorized[cat].sort(tagComparator(cat));
  }
  return { categorized, tagCategoryOf };
}

// Present categories in display order; unexpected ones appended (future-proofing).
export function orderedCategories(categorized: Categorized): string[] {
  const order: readonly string[] = CATEGORY_ORDER;
  const cats = order.filter((c) => categorized[c]?.length);
  for (const c of Object.keys(categorized)) {
    if (!cats.includes(c)) cats.push(c);
  }
  return cats;
}
