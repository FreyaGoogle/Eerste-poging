"use client";

import { useState } from "react";
import Link from "next/link";
import { BOM_SECTIES, BOM_KOPPELBARE_THEMAS } from "@/lib/bom-data";
import { getThemaLabel } from "@/lib/themes";
import { PrivacyGuard } from "./PrivacyGuard";
import { detecteerPrivacyRisicos } from "@/lib/privacy";

interface BOMRecord {
  sectie: string;
  antwoorden: string;
  prikkelDuiding: string;
  gekoppeldeThemas: string;
  participerend: boolean;
  watDeedObserveerder: string;
  effectOpBewoners: string;
}

interface Props {
  checkId: string;
  checkNaam: string;
  conceptStatus: string;
  initialBOM: BOMRecord[];
}

type PrikkelType = "gunstig" | "ongunstig" | "";

function parseJson<T>(s: string, fallback: T): T {
  try { return JSON.parse(s) || fallback; } catch { return fallback; }
}

export function BOMModuleClient({ checkId, checkNaam, conceptStatus, initialBOM }: Props) {
  const [activeSectie, setActiveSectie] = useState(BOM_SECTIES[0].id);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [privacyWarnings, setPrivacyWarnings] = useState<string[]>([]);

  // State per sectie
  const initialState = Object.fromEntries(
    BOM_SECTIES.map((s) => {
      const existing = initialBOM.find((b) => b.sectie === s.id);
      return [
        s.id,
        {
          antwoorden: existing ? parseJson<Record<string, string>>(existing.antwoorden, {}) : {},
          prikkelDuiding: existing
            ? parseJson<{ type: PrikkelType; toelichting: string }>(existing.prikkelDuiding, { type: "", toelichting: "" })
            : { type: "" as PrikkelType, toelichting: "" },
          gekoppeldeThemas: existing ? parseJson<number[]>(existing.gekoppeldeThemas, []) : [],
          participerend: existing?.participerend ?? false,
          watDeedObserveerder: existing?.watDeedObserveerder ?? "",
          effectOpBewoners: existing?.effectOpBewoners ?? "",
        },
      ];
    })
  );

  const [sectionData, setSectionData] = useState(initialState);

  function updateSection<K extends keyof (typeof initialState)[string]>(
    sectieId: string,
    key: K,
    value: (typeof initialState)[string][K]
  ) {
    setSectionData((prev) => ({
      ...prev,
      [sectieId]: { ...prev[sectieId], [key]: value },
    }));
  }

  function updateAntwoord(sectieId: string, vraagId: string, waarde: string) {
    const words = waarde.split(" ");
    const risks = detecteerPrivacyRisicos(waarde);
    if (risks.length > 0) {
      setPrivacyWarnings(risks.map((r) => r.bericht));
    }
    const cur = sectionData[sectieId];
    updateSection(sectieId, "antwoorden", { ...cur.antwoorden, [vraagId]: waarde });
  }

  function toggleThema(sectieId: string, themaId: number) {
    const cur = sectionData[sectieId].gekoppeldeThemas;
    const updated = cur.includes(themaId) ? cur.filter((t) => t !== themaId) : [...cur, themaId];
    updateSection(sectieId, "gekoppeldeThemas", updated);
  }

  async function saveSectie(sectieId: string) {
    setSaving((p) => ({ ...p, [sectieId]: true }));
    const data = sectionData[sectieId];
    try {
      await fetch(`/api/bom/${checkId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locatieCheckId: checkId,
          sectie: sectieId,
          antwoorden: data.antwoorden,
          prikkelDuiding: data.prikkelDuiding,
          gekoppeldeThemas: data.gekoppeldeThemas,
          participerend: data.participerend,
          watDeedObserveerder: data.watDeedObserveerder,
          effectOpBewoners: data.effectOpBewoners,
        }),
      });
      setSaved((p) => ({ ...p, [sectieId]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [sectieId]: false })), 2000);
    } finally {
      setSaving((p) => ({ ...p, [sectieId]: false }));
    }
  }

  const currentSectie = BOM_SECTIES.find((s) => s.id === activeSectie)!;
  const currentData = sectionData[activeSectie];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 flex gap-2 mb-2">
          <Link href="/locatie-checks" className="hover:text-blue-600">LocatieChecks</Link>
          <span>/</span>
          <Link href={`/locatie-checks/${checkId}`} className="hover:text-blue-600">{checkNaam}</Link>
          <span>/</span>
          <span className="text-gray-900">BOM Observatie</span>
        </nav>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">BOM Observatie</h1>
          {conceptStatus === "concept" && <span className="badge-concept">CONCEPT</span>}
          <span className="bron-chip">BOM Deel 3</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Brein Omgeving Methodiek – gestructureerde observatie in 5 secties
        </p>
      </div>

      {privacyWarnings.length > 0 && (
        <PrivacyGuard warnings={privacyWarnings} onDismiss={() => setPrivacyWarnings([])} />
      )}

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sectie tabs */}
        <div className="flex md:flex-col gap-1 md:w-52 shrink-0 overflow-x-auto md:overflow-visible">
          {BOM_SECTIES.map((s) => {
            const hasData = Object.keys(sectionData[s.id].antwoorden).length > 0;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSectie(s.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:whitespace-normal ${
                  activeSectie === s.id
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{s.naam}</span>
                  {hasData && <span className="text-xs opacity-70">✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sectie inhoud */}
        <div className="flex-1 space-y-5">
          <div className="card">
            <h2 className="font-semibold text-gray-800 text-lg">{currentSectie.naam}</h2>
            <p className="text-sm text-gray-500 mt-1">{currentSectie.omschrijving}</p>
          </div>

          {/* Vragen */}
          <div className="card space-y-4">
            <h3 className="font-medium text-gray-700">Observatievragen</h3>
            {currentSectie.vragen.map((vraag) => (
              <div key={vraag.id}>
                <label className="label">{vraag.vraag}</label>
                <textarea
                  className="input min-h-[72px]"
                  value={currentData.antwoorden[vraag.id] ?? ""}
                  onChange={(e) => updateAntwoord(activeSectie, vraag.id, e.target.value)}
                  placeholder="Feitelijke observatie (geen namen)..."
                />
              </div>
            ))}
          </div>

          {/* Prikkel duiding */}
          <div className="card space-y-3">
            <h3 className="font-medium text-gray-700">Prikkel duiding</h3>
            <div className="flex gap-3">
              {(["gunstig", "ongunstig", ""] as PrikkelType[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => updateSection(activeSectie, "prikkelDuiding", { ...currentData.prikkelDuiding, type: opt })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    currentData.prikkelDuiding.type === opt
                      ? opt === "gunstig"
                        ? "bg-green-600 text-white border-green-600"
                        : opt === "ongunstig"
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-gray-200 text-gray-700 border-gray-300"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {opt === "" ? "Niet bepaald" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
            <div>
              <label className="label">Toelichting</label>
              <textarea
                className="input min-h-[72px]"
                value={currentData.prikkelDuiding.toelichting}
                onChange={(e) =>
                  updateSection(activeSectie, "prikkelDuiding", { ...currentData.prikkelDuiding, toelichting: e.target.value })
                }
                placeholder="Waarom gunstig of ongunstig? Welke prikkels zijn bepalend?"
              />
            </div>
          </div>

          {/* Koppeling thema's */}
          <div className="card">
            <h3 className="font-medium text-gray-700 mb-2">Koppeling naar thema&apos;s</h3>
            <p className="text-xs text-gray-400 mb-3">Wijs deze BOM-notitie als bewijs toe aan relevante thema&apos;s.</p>
            <div className="flex flex-wrap gap-2">
              {BOM_KOPPELBARE_THEMAS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleThema(activeSectie, t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    currentData.gekoppeldeThemas.includes(t)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Thema {t}
                </button>
              ))}
            </div>
          </div>

          {/* Participerend observeren */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="participerend"
                checked={currentData.participerend}
                onChange={(e) => updateSection(activeSectie, "participerend", e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="participerend" className="font-medium text-gray-700 text-sm">
                Participerend observeren
              </label>
              <span className="bron-chip">BOM Deel 3</span>
            </div>

            {currentData.participerend && (
              <>
                <div>
                  <label className="label">Wat deed de observeerder zelf?</label>
                  <textarea
                    className="input min-h-[72px]"
                    value={currentData.watDeedObserveerder}
                    onChange={(e) => updateSection(activeSectie, "watDeedObserveerder", e.target.value)}
                    placeholder="bijv. Mee-eten aan tafel, helpen bij activiteit..."
                  />
                </div>
                <div>
                  <label className="label">Effect op bewoners / prikkels</label>
                  <textarea
                    className="input min-h-[72px]"
                    value={currentData.effectOpBewoners}
                    onChange={(e) => updateSection(activeSectie, "effectOpBewoners", e.target.value)}
                    placeholder="bijv. Zichtbaar ontspanning bij extra aanwezigheid..."
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Kan als bewijs worden gekoppeld aan thema&apos;s 2, 5, 6, 8 via de koppeling hierboven.
                </p>
              </>
            )}
          </div>

          {/* Opslaan */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => saveSectie(activeSectie)}
              disabled={saving[activeSectie]}
              className="btn-primary"
            >
              {saving[activeSectie] ? "Opslaan..." : "Sectie opslaan"}
            </button>
            {saved[activeSectie] && <span className="text-green-600 text-sm font-medium">✓ Opgeslagen</span>}
            <Link href={`/locatie-checks/${checkId}`} className="btn-secondary ml-auto">
              ← Terug
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
