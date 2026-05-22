"use client";

interface Props {
  label: string;
  value: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
  midLabel?: string;
}

export default function TastingSlider({ label, value, max = 5, step = 0.25, onChange, lowLabel, highLabel, midLabel }: Props) {
  const display = value % 1 === 0 ? String(value) : String(+value.toFixed(2));
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <label className="text-stone-400 text-sm font-medium">{label}</label>
        <span className="text-amber-400 font-bold">{display}<span className="text-stone-600 text-xs">/{max}</span></span>
      </div>
      <input
        type="range"
        min={1}
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
