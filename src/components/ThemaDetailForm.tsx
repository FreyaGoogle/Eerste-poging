"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Thema } from "@/lib/themes";
import { SCORE_STAPPEN, getScoreLabel } from "@/lib/scoring";
import { PrivacyGuard } from "@/components/PrivacyGuard";
import { detecteerPrivacyRisicos } from "@/lib/privacy";

type Antwoord = "Ja" | "Deels" | "Nee" | "Onbekend";

interface ThemaScoreData {
  ingevoerdeScore: number;
  positiefBewijs: string;
  negatiefBewijs: string;
  positiefMetKanttekening: string;
  bewonersstem: string;
  checkVraagAntwoorden: string;
}

interface Props {
  checkId: string;
  checkNaam: string;
  conceptStatus: string;
  thema: Thema;
  initialScore: ThemaScoreData | null;
}

function parseJsonArray(s: string): string[] {
  try { return JSON.parse(s) || []; } catch { return []; }
}
function parseJsonRecord(s: string): Record<string, Antwoord> {
  try { return JSON.parse(s) || {}; } catch { return {}; }
}

export function ThemaDetailForm({ checkId, checkNaam, conceptStatus, thema, initialScore }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [score, setScore] = useState(initialScore?.ingevoerdeScore ?? 0);
  const [positiefBewijs, setPositiefBewijs] = useState<string[]>(
    initialScore ? parseJsonArray(initialScore.positiefBewijs) : []
  );
  const [negatiefBewijs, setNegatiefBewijs] = useState<string[]>(
    initialScore ? parseJsonArray(initialScore.negatiefBewijs) : []
  );
  const [positiefMet, setPositiefMet] = useState<string[]>(
    initialScore ? parseJsonArray(initialScore.positiefMetKanttekening) : []
  );
  const [bewonersstem, setBewonersstem] = useState(initialScore?.bewonersstem ?? "");
  const [antwoorden, setAntwoorden] = useState<Record<string, Antwoord>>(
    initialScore ? parseJsonRecord(initialScore.checkVraagAntwoorden) : {}
  );

  const [privacyWarnings, setPrivacyWarnings] = useState<string[]>([]);

  // New bullet input states
  const [newPositief, setNewPositief] = useState("");
  const [newNegatief, setNewNegatief] = useState("");
  const [newPositiefMet, setNewPositiefMet] = useState("");

  function checkPrivacy(text: string) {
    const warnings = detecteerPrivacyRisicos(text);
    if (warnings.length > 0) {
      setPrivacyWarnings(warnings.map((w) => w.bericht));
    }
  }

  function addBullet(
    list: string[],
    setList: (l: string[]) => void,
    value: string,
    setValue: (v: string) => void
  ) {
    if (!value.trim()) return;
    checkPrivacy(value);
    setList([...list, value.trim()]);
    setValue("");
  }

  function removeBullet(list: string[], setList: (l: string[]) => void, index: number) {
    setList(list.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/thema-scores/${checkId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locatieCheckId: checkId,
          themaId: thema.id,
          ingevoerdeScore: score,
          positiefBewijs,
          negatiefBewijs,
          positiefMetKanttekening: positiefMet,
          bewonersstem,
          checkVraagAntwoorden: antwoorden,
        }),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const ANTWOORD_OPTIES: Antwoord[] = ["Ja", "Deels", "Nee", "Onbekend"];
  const ANTWOORD_COLORS: Record<Antwoord, string> = {
    Ja: "bg-green-100 text-green-800 border-green-300",
    Deels: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Nee: "bg-red-100 text-red-800 border-red-300",
    Onbekend: "bg-gray-100 text-gray-700 border-gray-300",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex gap-2 flex-wrap">
        <Link href="/locatie-checks" className="hover:text-blue-600">LocatieChecks</Link>
        <span>/</span>
        <Link href={`/locatie-checks/${checkId}`} className="hover:text-blue-600">{checkNaam}</Link>
        <span>/</span>
        <span className="text-gray-900">Thema {thema.id}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">
              Thema {thema.id}: {thema.naam}
            </h1>
            {thema.zwaarGewogen && <span className="badge-zwaar">Zwaar gewogen (2×)</span>}
            {conceptStatus === "concept" && (
              <span className="badge-concept">CONCEPT</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">{thema.definitie}</p>
          <div className="flex gap-2 mt-2">
            <span className="bron-chip">{thema.bronLabel}</span>
          </div>
        </div>
      </div>

      {privacyWarnings.length > 0 && (
        <PrivacyGuard warnings={privacyWarnings} onDismiss={() => setPrivacyWarnings([])} />
      )}

      {/* Score selector */}
      <div className="card">
        <label className="label text-base">Score (1.0 – 10.0)</label>
        <div className="flex items-center gap-4">
          <select
            className="input max-w-xs"
            value={score}
            onChange={(e) => setScore(parseFloat(e.target.value))}
          >
            <option value={0}>– Nog niet ingevuld –</option>
            {SCORE_STAPPEN.map((s) => (
              <option key={s} value={s}>
                {s.toFixed(1)} – {getScoreLabel(s).split(" – ")[1]}
              </option>
            ))}
          </select>
          {score > 0 && (
            <div className="text-sm text-gray-500">{getScoreLabel(score)}</div>
          )}
        </div>
      </div>

      {/* Checkvragen */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-3">Checkvragen <span className="bron-chip ml-2">{thema.bronLabel}</span></h2>
        <div className="space-y-3">
          {thema.checkVragen.map((vraag) => (
            <div key={vraag.id} className="border border-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-800 mb-2">{vraag.vraag}</p>
              <div className="flex gap-2 flex-wrap">
                {ANTWOORD_OPTIES.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAntwoorden({ ...antwoorden, [vraag.id]: opt })}
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                      antwoorden[vraag.id] === opt
                        ? ANTWOORD_COLORS[opt] + " ring-2 ring-offset-1 ring-gray-400"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bewijsvelden */}
      <div className="card space-y-5">
        <h2 className="font-semibold text-gray-800">Bewijsvelden</h2>

        {/* Positief bewijs */}
        <div>
          <label className="label text-green-700">Positief bewijs</label>
          <ul className="mb-2 space-y-1">
            {positiefBewijs.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-800 bg-green-50 rounded px-2 py-1">
                <span className="flex-1">• {b}</span>
                <button type="button" onClick={() => removeBullet(positiefBewijs, setPositiefBewijs, i)} className="text-gray-400 hover:text-red-500">×</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Voeg positieve observatie toe..."
              value={newPositief}
              onChange={(e) => setNewPositief(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBullet(positiefBewijs, setPositiefBewijs, newPositief, setNewPositief); } }}
            />
            <button type="button" onClick={() => addBullet(positiefBewijs, setPositiefBewijs, newPositief, setNewPositief)} className="btn-secondary">
              +
            </button>
          </div>
        </div>

        {/* Negatief bewijs */}
        <div>
          <label className="label text-red-700">Negatief bewijs / verbeterpunten</label>
          <ul className="mb-2 space-y-1">
            {negatiefBewijs.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-800 bg-red-50 rounded px-2 py-1">
                <span className="flex-1">• {b}</span>
                <button type="button" onClick={() => removeBullet(negatiefBewijs, setNegatiefBewijs, i)} className="text-gray-400 hover:text-red-500">×</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Voeg verbeterpunt toe..."
              value={newNegatief}
              onChange={(e) => setNewNegatief(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBullet(negatiefBewijs, setNegatiefBewijs, newNegatief, setNewNegatief); } }}
            />
            <button type="button" onClick={() => addBullet(negatiefBewijs, setNegatiefBewijs, newNegatief, setNewNegatief)} className="btn-secondary">
              +
            </button>
          </div>
        </div>

        {/* Positief met kanttekening */}
        <div>
          <label className="label text-amber-700">Positief met kanttekening</label>
          <ul className="mb-2 space-y-1">
            {positiefMet.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-800 bg-amber-50 rounded px-2 py-1">
                <span className="flex-1">• {b}</span>
                <button type="button" onClick={() => removeBullet(positiefMet, setPositiefMet, i)} className="text-gray-400 hover:text-red-500">×</button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Positief met nuancering..."
              value={newPositiefMet}
              onChange={(e) => setNewPositiefMet(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addBullet(positiefMet, setPositiefMet, newPositiefMet, setNewPositiefMet); } }}
            />
            <button type="button" onClick={() => addBullet(positiefMet, setPositiefMet, newPositiefMet, setNewPositiefMet)} className="btn-secondary">
              +
            </button>
          </div>
        </div>
      </div>

      {/* Bewonersstem */}
      <div className="card">
        <label className="label">Bewonersstem (optioneel, geanonimiseerd)</label>
        <textarea
          className="input min-h-[80px]"
          placeholder="bijv. 'Ik voel me hier thuis' – bewoner X"
          value={bewonersstem}
          onChange={(e) => {
            setBewonersstem(e.target.value);
            checkPrivacy(e.target.value);
          }}
        />
        <p className="text-xs text-gray-400 mt-1">Gebruik uitsluitend geanonimiseerde aanduidingen.</p>
      </div>

      {/* Opslaan */}
      <div className="flex gap-3 items-center">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "Opslaan..." : "Opslaan"}
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">✓ Opgeslagen</span>}
        <Link href={`/locatie-checks/${checkId}`} className="btn-secondary ml-auto">
          ← Terug
        </Link>
      </div>

      {/* Navigatie naar volgend thema */}
      <div className="flex gap-3 border-t border-gray-200 pt-4">
        {thema.id > 1 && (
          <Link
            href={`/locatie-checks/${checkId}/themas/${thema.id - 1}`}
            className="btn-secondary text-xs"
          >
            ← Thema {thema.id - 1}
          </Link>
        )}
        {thema.id < 10 && (
          <Link
            href={`/locatie-checks/${checkId}/themas/${thema.id + 1}`}
            className="btn-primary text-xs ml-auto"
          >
            Thema {thema.id + 1} →
          </Link>
        )}
      </div>
    </div>
  );
}
