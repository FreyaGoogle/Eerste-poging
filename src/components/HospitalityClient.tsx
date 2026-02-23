"use client";

import { useState } from "react";
import Link from "next/link";
import { HOSPITALITY_CATEGORIEEN, THEMA5_EVIDENCE_PROMPTS } from "@/lib/hospitality-data";

interface HospitalityRecord {
  categorie: string;
  antwoorden: string;
  notities: string;
}

interface Props {
  checkId: string;
  checkNaam: string;
  conceptStatus: string;
  initialItems: HospitalityRecord[];
}

function parseJson<T>(s: string, fallback: T): T {
  try { return JSON.parse(s) || fallback; } catch { return fallback; }
}

export function HospitalityClient({ checkId, checkNaam, conceptStatus, initialItems }: Props) {
  const [activeCategorie, setActiveCategorie] = useState(HOSPITALITY_CATEGORIEEN[0].id);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const initialState = Object.fromEntries(
    HOSPITALITY_CATEGORIEEN.map((c) => {
      const existing = initialItems.find((i) => i.categorie === c.id);
      return [
        c.id,
        {
          antwoorden: existing ? parseJson<Record<string, boolean | null>>(existing.antwoorden, {}) : {},
          notities: existing?.notities ?? "",
        },
      ];
    })
  );

  const [catData, setCatData] = useState(initialState);

  function toggleItem(categorieId: string, itemId: string, value: boolean | null) {
    const cur = catData[categorieId];
    const curValue = cur.antwoorden[itemId];
    // Toggle: null -> true -> false -> null
    let next: boolean | null;
    if (curValue === null || curValue === undefined) next = true;
    else if (curValue === true) next = false;
    else next = null;

    setCatData((prev) => ({
      ...prev,
      [categorieId]: { ...prev[categorieId], antwoorden: { ...prev[categorieId].antwoorden, [itemId]: next } },
    }));
  }

  async function saveCategorie(categorieId: string) {
    setSaving((p) => ({ ...p, [categorieId]: true }));
    try {
      await fetch(`/api/hospitality/${checkId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locatieCheckId: checkId,
          categorie: categorieId,
          antwoorden: catData[categorieId].antwoorden,
          notities: catData[categorieId].notities,
        }),
      });
      setSaved((p) => ({ ...p, [categorieId]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [categorieId]: false })), 2000);
    } finally {
      setSaving((p) => ({ ...p, [categorieId]: false }));
    }
  }

  const currentCat = HOSPITALITY_CATEGORIEEN.find((c) => c.id === activeCategorie)!;
  const currentData = catData[activeCategorie];

  function getItemColor(value: boolean | null | undefined): string {
    if (value === true) return "bg-green-50 border-green-300 text-green-800";
    if (value === false) return "bg-red-50 border-red-300 text-red-800";
    return "bg-white border-gray-200 text-gray-700";
  }

  function getItemIcon(value: boolean | null | undefined): string {
    if (value === true) return "✓";
    if (value === false) return "✗";
    return "○";
  }

  // Count per category
  function categoryProgress(categorieId: string) {
    const data = catData[categorieId];
    const total = HOSPITALITY_CATEGORIEEN.find((c) => c.id === categorieId)?.items.length ?? 0;
    const filled = Object.values(data.antwoorden).filter((v) => v !== null && v !== undefined).length;
    return { filled, total };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 flex gap-2 mb-2">
          <Link href="/locatie-checks" className="hover:text-blue-600">LocatieChecks</Link>
          <span>/</span>
          <Link href={`/locatie-checks/${checkId}`} className="hover:text-blue-600">{checkNaam}</Link>
          <span>/</span>
          <span className="text-gray-900">Hospitality quickscan</span>
        </nav>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Hospitality Quickscan</h1>
          {conceptStatus === "concept" && <span className="badge-concept">CONCEPT</span>}
          <span className="bron-chip">Hospitality 01-2024</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Quickscan op hospitality-aspecten. Vult geen score automatisch, maar biedt evidence-prompts voor Thema 5.
        </p>
      </div>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Categorie tabs */}
        <div className="flex md:flex-col gap-1 md:w-52 shrink-0 overflow-x-auto md:overflow-visible">
          {HOSPITALITY_CATEGORIEEN.map((c) => {
            const { filled, total } = categoryProgress(c.id);
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategorie(c.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal ${
                  activeCategorie === c.id
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{c.naam}</span>
                  <span className={`text-xs ${activeCategorie === c.id ? "opacity-70" : "text-gray-400"}`}>
                    {filled}/{total}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Categorie inhoud */}
        <div className="flex-1 space-y-5">
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-lg">{currentCat.naam}</h2>
            <p className="text-sm text-gray-500 mt-1">{currentCat.omschrijving}</p>
          </div>

          {/* Checkitems */}
          <div className="card space-y-2">
            <h3 className="font-medium text-gray-700 mb-3">
              Checklijst <span className="bron-chip ml-2">Hospitality 01-2024</span>
            </h3>
            <p className="text-xs text-gray-400 mb-3">Klik op een item om te markeren: ✓ aanwezig / ✗ afwezig / ○ niet beoordeeld</p>
            {currentCat.items.map((item) => {
              const val = currentData.antwoorden[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(activeCategorie, item.id, val ?? null)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all flex items-start gap-2 ${getItemColor(val)}`}
                >
                  <span className="font-bold shrink-0 w-4">{getItemIcon(val)}</span>
                  <span>{item.omschrijving}</span>
                </button>
              );
            })}
          </div>

          {/* Notities */}
          <div className="card">
            <label className="label">Notities voor deze categorie</label>
            <textarea
              className="input min-h-[80px]"
              value={currentData.notities}
              onChange={(e) => setCatData((prev) => ({
                ...prev,
                [activeCategorie]: { ...prev[activeCategorie], notities: e.target.value },
              }))}
              placeholder="Aanvullende opmerkingen (geen namen)..."
            />
          </div>

          {/* Opslaan */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => saveCategorie(activeCategorie)}
              disabled={saving[activeCategorie]}
              className="btn-primary"
            >
              {saving[activeCategorie] ? "Opslaan..." : "Opslaan"}
            </button>
            {saved[activeCategorie] && <span className="text-green-600 text-sm font-medium">✓ Opgeslagen</span>}
            <Link href={`/locatie-checks/${checkId}`} className="btn-secondary ml-auto">
              ← Terug
            </Link>
          </div>
        </div>
      </div>

      {/* Evidence prompts voor thema 5 */}
      <div className="card bg-amber-50 border-amber-200">
        <h3 className="font-semibold text-amber-800 mb-2">
          Evidence-prompts voor Thema 5 (Autonomie & Eigen Regie)
        </h3>
        <p className="text-xs text-amber-600 mb-3">
          Hospitality-resultaten vullen geen score automatisch. Gebruik onderstaande prompts als evidence voor Thema 5.
        </p>
        <ul className="space-y-1">
          {THEMA5_EVIDENCE_PROMPTS.map((p, i) => (
            <li key={i} className="text-sm text-amber-700">→ {p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
