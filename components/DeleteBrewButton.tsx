"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteBrewButton({ brewId }: { brewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function deleteBrew() {
    if (!confirm("Delete this brew? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/brews/${brewId}`, { method: "DELETE" });
    router.push("/brews");
  }

  return (
    <button onClick={deleteBrew} disabled={loading} className="at-cta-ghost" style={{ color: "var(--text-3)" }}>
      {loading ? "Deleting…" : "Delete brew"}
    </button>
  );
}
