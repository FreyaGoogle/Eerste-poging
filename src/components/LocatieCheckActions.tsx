"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  checkId: string;
  conceptStatus: string;
}

export function LocatieCheckActions({ checkId, conceptStatus }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je deze LocatieCheck wilt verwijderen?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/locatie-checks/${checkId}`, { method: "DELETE" });
      router.push("/locatie-checks");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleStatus() {
    setToggling(true);
    try {
      const newStatus = conceptStatus === "concept" ? "definitief" : "concept";
      await fetch(`/api/locatie-checks/${checkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conceptStatus: newStatus }),
      });
      router.refresh();
    } finally {
      setToggling(false);
    }
  }

  async function handleExportJSON() {
    const res = await fetch(`/api/export/${checkId}`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `welzijncheck-${checkId}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleToggleStatus}
        disabled={toggling}
        className="btn-secondary text-xs"
      >
        {toggling ? "..." : conceptStatus === "concept" ? "Markeer definitief" : "Terug naar concept"}
      </button>
      <button onClick={handleExportJSON} className="btn-secondary text-xs">
        JSON export
      </button>
      <Link href={`/locatie-checks/${checkId}/rapport`} className="btn-primary text-xs">
        Rapport
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="btn-danger text-xs"
      >
        {deleting ? "..." : "Verwijder"}
      </button>
    </div>
  );
}
