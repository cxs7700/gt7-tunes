import type { Post } from '@/lib/types';
import { headlineSpecs } from '@/lib/derive';

// Prominent "at a glance" specs (PP, Class, Drivetrain, Rating) derived from the
// post's tags. Shown above the tag soup on cards and the detail page.
export default function SpecChips({ post }: { post: Post }) {
  const specs = headlineSpecs(post);
  if (specs.length === 0) return null;
  return (
    <div className="spec-chips">
      {specs.map((s) => (
        <span key={s.kind} className={`spec-chip spec-${s.kind.toLowerCase()}`}>
          {s.label}
        </span>
      ))}
    </div>
  );
}
