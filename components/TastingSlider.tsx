"use client";

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
  midLabel?: string;
  symmetric?: boolean;
}

export default function TastingSlider({ label, value, min = 1, max = 5, step = 0.25, onChange, lowLabel, highLabel, midLabel, symmetric }: Props) {
  if (symmetric) {
    // value is a signed position: -10 (too weak) to +10 (too strong), 0 = perfect
    // score = 5 - abs(position) * 0.5  →  0.5 increments from 5 down to 0 at ±10
    const score = Math.max(0, 5 - Math.abs(value) * 0.5);
    const display = score % 1 === 0 ? String(score) : score.toFixed(1);
    return (
      <div className="space-y-1">
        <div className="flex justify-between items-baseline">
          <label className="text-stone-400 text-sm font-medium">{label}</label>
          <span className="text-amber-400 font-bold">{display}<span className="text-stone-600 text-xs">/5</span></span>
        </div>
        <input
          type="range"
          min={-10}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full accent-amber-500 h-2"
        />
        <div className="flex justify-between text-xs text-stone-600">
          <span>{lowLabel ?? "Too weak"}</span>
          <span className={value === 0 ? "text-amber-500" : ""}>{midLabel ?? "Perfect"}</span>
          <span>{highLabel ?? "Too strong"}</span>
        </div>
      </div>
    );
  }

  const display = value % 1 === 0 ? String(value) : String(+value.toFixed(2));
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <label className="text-stone-400 text-sm font-medium">{label}</label>
        <span className="text-amber-400 font-bold">{display}<span className="text-stone-600 text-xs">/{max}</span></span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-amber-500 h-2"
      />
      {(lowLabel || highLabel || midLabel) && (
        <div className="flex justify-between text-xs text-stone-600">
          <span>{lowLabel}</span>
          {midLabel && <span>{midLabel}</span>}
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  );
}
