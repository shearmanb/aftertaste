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
        // When the original brew came from a bag, send the bag so the server
        // re-derives the bean and auto-assigns the next bag brew index
        // (bag._count.brews + 1). Omitting bagBrewIndex lets the server pick it.
        beanId: original.beanBagId ? undefined : original.beanId,
        beanBagId: original.beanBagId ?? undefined,
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
    <button onClick={brewAgain} disabled={loading} className="at-cta">
      {loading ? "Creating…" : "Brew again with same settings"}
    </button>
  );
}
