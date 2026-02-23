"use client";

import { useState } from "react";

interface Bron {
  id: string;
  label: string;
  titel: string;
  versie: string;
  datum: string;
  locatie: string;
}

interface Props {
  initialBronnen: Bron[];
}

export function BronnenClient({ initialBronnen }: Props) {
  const [bronnen, setBronnen] = useState(initialBronnen);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  async function saveLocatie(label: string, locatie: string) {
    setSaving((p) => ({ ...p, [label]: true }));
    try {
      const res = await fetch("/api/bronnen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, locatie }),
      });
      if (res.ok) {
        setSaved((p) => ({ ...p, [label]: true }));
        setTimeout(() => setSaved((p) => ({ ...p, [label]: false })), 2000);
      }
    } finally {
      setSaving((p) => ({ ...p, [label]: false }));
    }
  }

  function updateLocatie(label: string, value: string) {
    setBronnen((prev) => prev.map((b) => (b.label === label ? { ...b, locatie: value } : b)));
  }

  if (bronnen.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-400">
        <p>Geen bronnen gevonden. Voer eerst het seed-commando uit: <code>npm run db:seed</code></p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bronnen.map((bron) => (
        <div key={bron.label} className="card">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bron-chip">{bron.label}</span>
                <span className="text-xs text-gray-400">{bron.versie} · {bron.datum}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mt-1">{bron.titel}</h3>
            </div>
          </div>

          <div>
            <label className="label">Locatie / SharePoint-link</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                type="url"
                placeholder="https://sharepoint.org/... of intern pad"
                value={bron.locatie}
                onChange={(e) => updateLocatie(bron.label, e.target.value)}
              />
              <button
                onClick={() => saveLocatie(bron.label, bron.locatie)}
                disabled={saving[bron.label]}
                className="btn-primary whitespace-nowrap"
              >
                {saving[bron.label] ? "..." : "Opslaan"}
              </button>
              {bron.locatie && (
                <a
                  href={bron.locatie}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary whitespace-nowrap"
                >
                  Openen
                </a>
              )}
            </div>
            {saved[bron.label] && (
              <p className="text-green-600 text-xs mt-1">✓ Link opgeslagen</p>
            )}
          </div>
        </div>
      ))}

      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Over de bronlabels</h3>
        <p className="text-sm text-blue-700">
          In de app worden drie bronlabels gebruikt als verwijzing. De bijbehorende documenten worden
          <strong> niet</strong> opgeslagen of gekopieerd in deze applicatie.
          Alle checklists, definities en vragen zijn <strong>zelfgeschreven</strong> en conceptueel
          afgestemd op de methodiek – geen tekstkopieën.
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <div className="text-xs text-blue-600 bg-white rounded border border-blue-200 px-2 py-1">
            <strong>IJKKADER v5</strong> → IJKKADER Welzijn in Beeld 2026 – v5 Houding & Betekenis
          </div>
          <div className="text-xs text-blue-600 bg-white rounded border border-blue-200 px-2 py-1">
            <strong>BOM Deel 3</strong> → Syllabus Basisopleiding BOM – Deel 3 – 2022
          </div>
          <div className="text-xs text-blue-600 bg-white rounded border border-blue-200 px-2 py-1">
            <strong>Hospitality 01-2024</strong> → Hospitality boekje Domus Valuas – januari 2024
          </div>
        </div>
      </div>
    </div>
  );
}
