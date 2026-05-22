"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BrewAgainButton({ brewId }: { brewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function brewAgain() {
    setLoading(true);
    const brewRes = await fetch(`/api/brews/${brewId}`);
    const original = await brewRes.json();
    const res = await fetch("/api/brews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beanId: original.beanId,
        waterProfileId: original.waterProfileId,
        filterProfileId: original.filterProfileId,
        grindProfileId: original.grindProfileId,
        aidenProfileId: original.aidenProfileId,
      }),
    });
    const newBrew = await res.json();
    router.push(`/brew/${newBrew.id}/taste`);
  }

  return (
    <button
      onClick={brewAgain}
      disabled={loading}
      className="w-full py-3 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-300 font-medium rounded-xl transition-colors"
    >
      {loading ? "Creating..." : "Brew again with same settings"}
    </button>
  );
}
