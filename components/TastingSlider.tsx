"use client";

interface Props {
  label: string;
  value: number;
  max?: number;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}

export default function TastingSlider({ label, value, max = 5, onChange, lowLabel, highLabel }: Props) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <label className="text-stone-400 text-sm font-medium">{label}</label>
        <span className="text-amber-400 font-bold">{value}<span className="text-stone-600 text-xs">/{max}</span></span>
      </div>
      <input
        type="range"
        min={1}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-amber-500 h-2"
      />
      {(lowLabel || highLabel) && (
        <div className="flex justify-between text-xs text-stone-600">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  );
}
