'use client';

interface Props {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChange: (lo: number, hi: number) => void;
  label?: string;
}

// Dual-handle range built from two overlaid <input type="range"> elements.
// Tracks are non-interactive; only the thumbs receive pointer events. The min
// input is raised above the max input when the handles crowd the top end so it
// stays grabbable.
export default function RangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
  label = 'value',
}: Props) {
  const span = max - min || 1;
  const loPct = ((valueMin - min) / span) * 100;
  const hiPct = ((valueMax - min) / span) * 100;

  return (
    <div className="range-slider">
      <div className="range-rail" />
      <div className="range-fill" style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        style={{ zIndex: loPct > 60 ? 5 : 3 }}
        onChange={(e) => onChange(Math.min(Number(e.target.value), valueMax), valueMax)}
        aria-label={`Minimum ${label}`}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        style={{ zIndex: 4 }}
        onChange={(e) => onChange(valueMin, Math.max(Number(e.target.value), valueMin))}
        aria-label={`Maximum ${label}`}
      />
    </div>
  );
}
