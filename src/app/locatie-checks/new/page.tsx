"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NieuweLocatieCheckPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    locatieNaam: "",
    datum: new Date().toISOString().split("T")[0],
    afdeling: "",
    doelgroep: "",
    context: "",
    conceptStatus: "concept" as "concept" | "definitief",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/locatie-checks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fout bij opslaan");
      }

      const check = await res.json();
      router.push(`/locatie-checks/${check.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nieuwe LocatieCheck</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vul de basisgegevens in. Verwerk geen namen van bewoners, medewerkers of kamernummers.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Locatienaam *</label>
          <input
            className="input"
            type="text"
            value={form.locatieNaam}
            onChange={(e) => setForm({ ...form, locatieNaam: e.target.value })}
            placeholder="bijv. Woonzorgcentrum De Linde"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Datum *</label>
            <input
              className="input"
              type="date"
              value={form.datum}
              onChange={(e) => setForm({ ...form, datum: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.conceptStatus}
              onChange={(e) => setForm({ ...form, conceptStatus: e.target.value as "concept" | "definitief" })}
            >
              <option value="concept">Concept</option>
              <option value="definitief">Definitief</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Afdeling / Eenheid *</label>
          <input
            className="input"
            type="text"
            value={form.afdeling}
            onChange={(e) => setForm({ ...form, afdeling: e.target.value })}
            placeholder="bijv. Afdeling Noord – PG"
            required
          />
        </div>

        <div>
          <label className="label">Doelgroepverdeling *</label>
          <input
            className="input"
            type="text"
            value={form.doelgroep}
            onChange={(e) => setForm({ ...form, doelgroep: e.target.value })}
            placeholder="bijv. 18 bewoners PG, 6 somatisch"
            required
          />
        </div>

        <div>
          <label className="label">Context (geen namen of kamernummers)</label>
          <textarea
            className="input min-h-[100px]"
            value={form.context}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            placeholder="Omschrijf de context van de observatiedag. Verwerk geen namen van bewoners of medewerkers."
          />
          <p className="text-xs text-gray-400 mt-1">
            Privacy: gebruik &quot;bewoner X&quot;, &quot;medewerker Y&quot; etc.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Opslaan..." : "Aanmaken"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Annuleren
          </button>
        </div>
      </form>
    </div>
  );
}
