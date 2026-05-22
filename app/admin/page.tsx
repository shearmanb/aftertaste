"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";

type Option = { id: string; category: string; value: string };

const CATEGORIES = [
  { key: "process", label: "Process", hint: "e.g. Washed, Natural, Honey" },
  { key: "roastLevel", label: "Roast Level", hint: "e.g. light, medium-light, dark" },
  { key: "beanTastingNote", label: "Bag Tasting Notes", hint: "e.g. blueberry, jasmine, caramel" },
  { key: "flavorTag", label: "Flavor Tags (Tasting)", hint: "e.g. berry, citrus, roasty" },
  { key: "brewIssue", label: "Brew Issues", hint: "e.g. channeling, wrong dose, stale beans" },
];

export default function AdminPage() {
  const [options, setOptions] = useState<Record<string, Option[]>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [adding, setAdding] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/options")
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const grouped: Record<string, Option[]> = {};
        for (const opt of data as Option[]) {
          if (!grouped[opt.category]) grouped[opt.category] = [];
          grouped[opt.category].push(opt);
        }
        setOptions(grouped);
        setLoading(false);
      });
  }, []);

  async function add(category: string) {
    const value = inputs[category]?.trim();
    if (!value) return;
    setAdding((p) => ({ ...p, [category]: true }));
    const res = await fetch("/api/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, value }),
    });
    if (res.ok) {
      const opt: Option = await res.json();
      setOptions((p) => ({
        ...p,
        [category]: [...(p[category] ?? []), opt].sort((a, b) => a.value.localeCompare(b.value)),
      }));
      setInputs((p) => ({ ...p, [category]: "" }));
    }
    setAdding((p) => ({ ...p, [category]: false }));
  }

  async function remove(id: string, category: string) {
    await fetch(`/api/options/${id}`, { method: "DELETE" });
    setOptions((p) => ({ ...p, [category]: (p[category] ?? []).filter((o) => o.id !== id) }));
  }

  return (
    <AppShell>
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-stone-100">Control Panel</h1>
        <p className="text-stone-500 text-xs mt-1">Manage dropdown options used across the app</p>
      </div>

      {loading ? (
        <p className="text-stone-500 text-sm text-center py-10">Loading...</p>
      ) : (
        <div className="space-y-5">
          {CATEGORIES.map(({ key, label, hint }) => (
            <div key={key} className="bg-stone-900 border border-stone-800 rounded-xl p-4">
              <p className="text-stone-300 font-semibold text-sm mb-3">{label}</p>
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[24px]">
                {(options[key] ?? []).length === 0 && (
                  <p className="text-stone-600 text-xs italic">No options — add below</p>
                )}
                {(options[key] ?? []).map((opt) => (
                  <span key={opt.id} className="flex items-center gap-1 bg-stone-800 text-stone-300 text-xs px-2.5 py-1 rounded-full">
                    {opt.value}
                    <button
                      onClick={() => remove(opt.id, key)}
                      className="text-stone-600 hover:text-red-400 ml-0.5 leading-none text-base"
                      aria-label={`Remove ${opt.value}`}
                    >×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={inputs[key] ?? ""}
                  onChange={(e) => setInputs((p) => ({ ...p, [key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && add(key)}
                  placeholder={hint}
                  className="input-field flex-1 text-xs"
                />
                <button
                  onClick={() => add(key)}
                  disabled={adding[key] || !inputs[key]?.trim()}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
