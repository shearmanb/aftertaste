"use client";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function getStrengthLabel(value: number): { label: string; color: string } {
  if (value <= 1.5) return { label: "Way too weak", color: "text-blue-400" };
  if (value <= 2.25) return { label: "Too weak", color: "text-sky-400" };
  if (value <= 2.75) return { label: "Slightly weak", color: "text-stone-400" };
  if (value >= 4.5) return { label: "Way too strong", color: "text-red-400" };
  if (value >= 3.75) return { label: "Too strong", color: "text-orange-400" };
  if (value >= 3.25) return { label: "Slightly strong", color: "text-stone-400" };
  return { label: "Ideal", color: "text-green-400" };
}

export default function StrengthSlider({ value, onChange }: Props) {
  const { label, color } = getStrengthLabel(value);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <label className="text-stone-400 text-sm font-medium">Strength</label>
        <span className={`font-bold text-sm ${color}`}>{label}</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={0.25}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-amber-500 h-2"
      />
      <div className="flex justify-between text-xs text-stone-600">
        <span>Too weak</span>
        <span>Ideal</span>
        <span>Too strong</span>
      </div>
    </div>
  );
}
