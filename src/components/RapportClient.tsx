"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { FASE_LABELS, getScoreLabel } from "@/lib/scoring";
import { getThema } from "@/lib/themes";

interface ThemaData {
  themaId: number;
  naam: string;
  zwaarGewogen: boolean;
  ingevoerdeScore: number;
  effectieveScore: number;
  isCapped: boolean;
  capReden?: string;
  positiefBewijs: string[];
  negatiefBewijs: string[];
  positiefMetKanttekening: string[];
}

interface Resultaat {
  gewogenTotaalScore: number | null;
  fase: 1 | 2 | 3 | 4 | null;
  drempelregels: { code: string; beschrijving: string; actief: boolean }[];
  zwareFundering: { themaId: number; score: number | null; status: string }[];
}

interface Props {
  checkId: string;
  check: {
    locatieNaam: string;
    datum: string;
    afdeling: string;
    doelgroep: string;
    context: string;
    conceptStatus: string;
  };
  themaData: ThemaData[];
  resultaat: Resultaat;
  bomSuggesties: { sectie: string; themas: number[]; prikkelDuiding: { type: string; toelichting: string } }[];
}

export function RapportClient({ checkId, check, themaData, resultaat, bomSuggesties }: Props) {
  const [chartType, setChartType] = useState<"radar" | "bar">("bar");
  const [confirmedSuggesties, setConfirmedSuggesties] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);

  const ingevuldThemas = themaData.filter((t) => t.ingevoerdeScore > 0);

  // Prepare chart data
  const barData = themaData.map((t) => ({
    name: `T${t.themaId}`,
    ingevoerd: t.ingevoerdeScore || null,
    effectief: t.effectieveScore || null,
    full: t.naam,
  }));

  const radarData = themaData.map((t) => ({
    subject: `T${t.themaId}`,
    score: t.effectieveScore || 0,
    fullName: t.naam,
  }));

  // Top-5 verbeteracties
  const verbeteracties: string[] = [];
  // First from heavy themes with low scores
  const zwaarLaag = themaData
    .filter((t) => t.zwaarGewogen && t.ingevoerdeScore > 0 && t.ingevoerdeScore < 6)
    .sort((a, b) => a.ingevoerdeScore - b.ingevoerdeScore);
  for (const t of zwaarLaag.slice(0, 3)) {
    if (t.negatiefBewijs.length > 0) {
      verbeteracties.push(`[Thema ${t.themaId} – ${t.naam}] ${t.negatiefBewijs[0]}`);
    } else {
      verbeteracties.push(`[Thema ${t.themaId} – ${t.naam}] Score ${t.ingevoerdeScore.toFixed(1)} – verbeterplan nodig.`);
    }
  }
  // Then from BOM suggestions
  for (const s of bomSuggesties.slice(0, 2)) {
    if (s.prikkelDuiding.type === "ongunstig" && s.prikkelDuiding.toelichting) {
      verbeteracties.push(`[BOM – ${s.sectie}] ${s.prikkelDuiding.toelichting}`);
    }
  }
  // Fill from normal themes
  const normaalLaag = themaData
    .filter((t) => !t.zwaarGewogen && t.ingevoerdeScore > 0 && t.ingevoerdeScore < 6)
    .sort((a, b) => a.ingevoerdeScore - b.ingevoerdeScore);
  for (const t of normaalLaag) {
    if (verbeteracties.length >= 5) break;
    if (t.negatiefBewijs.length > 0) {
      verbeteracties.push(`[Thema ${t.themaId} – ${t.naam}] ${t.negatiefBewijs[0]}`);
    }
  }

  async function handleExportJSON() {
    setExporting(true);
    try {
      const res = await fetch(`/api/export/${checkId}`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `welzijncheck-${check.locatieNaam.replace(/\s+/g, "-")}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handlePDFExport() {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = 15;

      // Concept watermark
      if (check.conceptStatus === "concept") {
        doc.setFontSize(60);
        doc.setTextColor(230, 230, 230);
        doc.text("CONCEPT", pageW / 2, 150, { align: "center", angle: 45 });
        doc.setTextColor(0, 0, 0);
      }

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("WelzijnCheck v5 + BOM", margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Conceptevaluatie: ${check.locatieNaam}`, margin, y);
      y += 6;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${check.afdeling} · ${new Date(check.datum).toLocaleDateString("nl-NL")} · Status: ${check.conceptStatus.toUpperCase()}`,
        margin, y
      );
      y += 5;
      doc.text(`Doelgroep: ${check.doelgroep}`, margin, y);
      y += 8;
      doc.setTextColor(0, 0, 0);

      // Score tabel
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Scoretabel", margin, y);
      y += 5;

      const tableRows = themaData
        .filter((t) => t.ingevoerdeScore > 0)
        .map((t) => [
          `T${t.themaId}: ${t.naam}`,
          t.zwaarGewogen ? "Zwaar (2×)" : "Normaal",
          t.ingevoerdeScore.toFixed(1),
          t.effectieveScore.toFixed(1),
          t.isCapped ? `Cap (${t.capReden?.split(".")[0] ?? ""})` : "",
        ]);

      autoTable(doc, {
        startY: y,
        head: [["Thema", "Weging", "Ingevoerd", "Effectief", "Cap"]],
        body: tableRows,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      y = (doc as any).lastAutoTable.finalY + 8;

      // Totaalscores
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Gewogen totaalscore: ${resultaat.gewogenTotaalScore?.toFixed(1) ?? "n.v.t."}`,
        margin, y
      );
      y += 6;
      if (resultaat.fase) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(FASE_LABELS[resultaat.fase], margin, y);
        y += 6;
      }

      // Drempelregels
      const actiefDR = resultaat.drempelregels.filter((d) => d.actief);
      if (actiefDR.length > 0) {
        y += 4;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(180, 0, 0);
        doc.text("Actieve drempelregels", margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        for (const dr of actiefDR) {
          const lines = doc.splitTextToSize(`${dr.code}: ${dr.beschrijving}`, pageW - 2 * margin);
          doc.text(lines, margin, y);
          y += lines.length * 4.5 + 2;
        }
        doc.setTextColor(0, 0, 0);
      }

      // Zware thema's
      y += 4;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Zware thema's (fundament)", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      for (const zw of resultaat.zwareFundering) {
        const t = getThema(zw.themaId);
        const statusLabel = zw.status === "fundament_ok" ? "✓ OK" : zw.status === "kwetsbaar" ? "⚠ Kwetsbaar" : "– Niet ingevuld";
        doc.text(`T${zw.themaId} ${t?.naam}: score ${zw.score?.toFixed(1) ?? "–"} – ${statusLabel}`, margin, y);
        y += 5;
      }

      // Samenvatting per thema
      if (y > 240) { doc.addPage(); y = 15; }
      y += 4;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Samenvatting per thema", margin, y);
      y += 5;
      doc.setFontSize(9);

      for (const t of themaData.filter((t) => t.ingevoerdeScore > 0)) {
        if (y > 260) { doc.addPage(); y = 15; }
        doc.setFont("helvetica", "bold");
        doc.text(`T${t.themaId}: ${t.naam} (${t.effectieveScore.toFixed(1)})${t.isCapped ? " [CAP]" : ""}`, margin, y);
        y += 4.5;
        doc.setFont("helvetica", "normal");
        const maxBullets = t.zwaarGewogen ? 3 : 1;
        const bullets = [...t.positiefBewijs.slice(0, maxBullets), ...t.negatiefBewijs.slice(0, 1)];
        for (const bullet of bullets) {
          if (y > 265) { doc.addPage(); y = 15; }
          const lines = doc.splitTextToSize(`• ${bullet}`, pageW - 2 * margin - 5);
          doc.text(lines, margin + 3, y);
          y += lines.length * 4 + 1;
        }
      }

      // Top-5 verbeteracties
      if (verbeteracties.length > 0) {
        if (y > 240) { doc.addPage(); y = 15; }
        y += 4;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Top-5 verbeteracties", margin, y);
        y += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        verbeteracties.slice(0, 5).forEach((v, i) => {
          if (y > 265) { doc.addPage(); y = 15; }
          const lines = doc.splitTextToSize(`${i + 1}. ${v}`, pageW - 2 * margin);
          doc.text(lines, margin, y);
          y += lines.length * 4.5 + 1;
        });
      }

      // Bronverwijzingen footer
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(
          "Bronlabels: IJKKADER v5 | BOM Deel 3 | Hospitality 01-2024 — Geen bronbestanden opgeslagen. Raadpleeg interne documenten via Bronnenpagina.",
          margin, doc.internal.pageSize.getHeight() - 8,
          { maxWidth: pageW - 2 * margin }
        );
        doc.text(`Pagina ${p}/${pageCount}`, pageW - margin, doc.internal.pageSize.getHeight() - 8, { align: "right" });
        if (check.conceptStatus === "concept") {
          doc.setFontSize(8);
          doc.setTextColor(200, 100, 0);
          doc.text("CONCEPTEVALUATIE", pageW / 2, doc.internal.pageSize.getHeight() - 4, { align: "center" });
        }
        doc.setTextColor(0, 0, 0);
      }

      doc.save(`welzijncheck-${check.locatieNaam.replace(/\s+/g, "-")}-rapport.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("PDF export mislukt. Probeer opnieuw.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 flex gap-2 mb-2">
          <Link href="/locatie-checks" className="hover:text-blue-600">LocatieChecks</Link>
          <span>/</span>
          <Link href={`/locatie-checks/${checkId}`} className="hover:text-blue-600">{check.locatieNaam}</Link>
          <span>/</span>
          <span className="text-gray-900">Rapport</span>
        </nav>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">Rapport & Export</h1>
              <span className={check.conceptStatus === "concept" ? "badge-concept" : "badge-definitief"}>
                {check.conceptStatus}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{check.locatieNaam} · {check.afdeling}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={handleExportJSON} disabled={exporting} className="btn-secondary text-sm">
              JSON export
            </button>
            <button onClick={handlePDFExport} disabled={exporting} className="btn-primary text-sm">
              {exporting ? "Exporteren..." : "PDF exporteren"}
            </button>
          </div>
        </div>
      </div>

      {check.conceptStatus === "concept" && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg px-4 py-3 text-orange-800 text-sm font-medium">
          ⚠ Dit is een CONCEPTEVALUATIE. Alle rapporten krijgen het label CONCEPT tot de status op &quot;definitief&quot; wordt gezet.
        </div>
      )}

      {/* Totaalscore */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-5xl font-bold text-blue-600 mb-1">
            {resultaat.gewogenTotaalScore?.toFixed(1) ?? "–"}
          </div>
          <div className="text-sm text-gray-500">Gewogen totaalscore</div>
          {resultaat.fase && (
            <div className="mt-2 text-xs font-medium text-blue-700 bg-blue-50 rounded px-2 py-1">
              {FASE_LABELS[resultaat.fase]}
            </div>
          )}
        </div>
        <div className="card col-span-2">
          <h3 className="font-semibold text-gray-700 mb-2">Zware thema&apos;s (fundament)</h3>
          <div className="grid grid-cols-2 gap-2">
            {resultaat.zwareFundering.map((zw) => {
              const thema = getThema(zw.themaId);
              return (
                <div
                  key={zw.themaId}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    zw.status === "fundament_ok"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : zw.status === "kwetsbaar"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-gray-50 border-gray-200 text-gray-500"
                  }`}
                >
                  <div className="font-medium">T{zw.themaId}: {thema?.naam}</div>
                  <div className="text-xs mt-0.5">
                    {zw.score !== null ? zw.score.toFixed(1) : "–"} ·{" "}
                    {zw.status === "fundament_ok"
                      ? "✓ Fundament OK"
                      : zw.status === "kwetsbaar"
                      ? "⚠ Kwetsbaar"
                      : "Niet ingevuld"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drempelregels */}
      {resultaat.drempelregels.some((d) => d.actief) && (
        <div className="card bg-red-50 border-red-200">
          <h3 className="font-semibold text-red-800 mb-2">Actieve drempelregels</h3>
          <ul className="space-y-2">
            {resultaat.drempelregels
              .filter((d) => d.actief)
              .map((d) => (
                <li key={d.code} className="text-sm text-red-700">
                  <span className="font-bold">{d.code}:</span> {d.beschrijving}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Grafiek */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Scoregrafiek</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1 rounded text-sm font-medium ${chartType === "bar" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Staafdiagram
            </button>
            <button
              onClick={() => setChartType("radar")}
              className={`px-3 py-1 rounded text-sm font-medium ${chartType === "radar" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              Radar
            </button>
          </div>
        </div>

        {chartType === "bar" ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip
                formatter={(value, name) => [value, name === "ingevoerd" ? "Ingevoerd" : "Effectief"]}
                labelFormatter={(label) => {
                  const d = barData.find((b) => b.name === label);
                  return d?.full ?? label;
                }}
              />
              <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Min. 5.0", position: "right", fontSize: 10 }} />
              <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Drempel 3.0", position: "right", fontSize: 10 }} />
              <Bar dataKey="ingevoerd" fill="#93c5fd" name="Ingevoerd" />
              <Bar dataKey="effectief" fill="#2563eb" name="Effectief" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
              <Tooltip formatter={(value) => [value, "Score"]} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Score tabel */}
      <div className="card overflow-x-auto">
        <h3 className="font-semibold text-gray-800 mb-3">Scoretabel</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="py-2 pr-4 font-medium text-gray-600">Thema</th>
              <th className="py-2 pr-4 font-medium text-gray-600">Weging</th>
              <th className="py-2 pr-4 font-medium text-gray-600">Ingevoerd</th>
              <th className="py-2 pr-4 font-medium text-gray-600">Effectief</th>
              <th className="py-2 font-medium text-gray-600">Cap</th>
            </tr>
          </thead>
          <tbody>
            {themaData.map((t) => (
              <tr key={t.themaId} className={`border-b border-gray-100 ${t.zwaarGewogen ? "bg-amber-50" : ""}`}>
                <td className="py-2 pr-4">
                  <Link href={`/locatie-checks/${checkId}/themas/${t.themaId}`} className="hover:text-blue-600">
                    T{t.themaId}: {t.naam}
                    {t.zwaarGewogen && <span className="badge-zwaar ml-2">Zwaar</span>}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-gray-500">{t.zwaarGewogen ? "2×" : "1×"}</td>
                <td className="py-2 pr-4">
                  {t.ingevoerdeScore > 0 ? (
                    <span className="font-medium">{t.ingevoerdeScore.toFixed(1)}</span>
                  ) : (
                    <span className="text-gray-300">–</span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  {t.effectieveScore > 0 ? (
                    <span className={`font-medium ${t.isCapped ? "text-orange-600" : "text-blue-600"}`}>
                      {t.effectieveScore.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-gray-300">–</span>
                  )}
                </td>
                <td className="py-2">
                  {t.isCapped ? (
                    <span className="text-xs text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200" title={t.capReden}>
                      ⚠ Cap
                    </span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BOM conceptsuggesties */}
      {bomSuggesties.length > 0 && (
        <div className="card border-amber-200 bg-amber-50">
          <div className="flex items-start gap-2 mb-3">
            <h3 className="font-semibold text-amber-800">BOM Conceptsuggesties</h3>
            <span className="badge-concept">Conceptsuggestie – vereist bevestiging</span>
          </div>
          <p className="text-xs text-amber-600 mb-3">
            Onderstaande suggesties zijn afgeleid van BOM-observaties voor thema&apos;s 6 en 10.
            Bevestig expliciet om ze op te nemen in het rapport.
          </p>
          <div className="space-y-3">
            {bomSuggesties.map((s, i) => (
              <div key={i} className="bg-white rounded-lg border border-amber-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Sectie: {s.sectie}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Gekoppeld aan: {s.themas.map((t) => `T${t}`).join(", ")}</p>
                    {s.prikkelDuiding.toelichting && (
                      <p className="text-sm text-gray-700 mt-1">Prikkel: {s.prikkelDuiding.toelichting}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setConfirmedSuggesties((p) => ({ ...p, [i]: !p[i] }))}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      confirmedSuggesties[i]
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {confirmedSuggesties[i] ? "✓ Bevestigd" : "Bevestigen"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top-5 verbeteracties */}
      {verbeteracties.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3">Top-5 Verbeteracties</h3>
          <p className="text-xs text-gray-400 mb-3">Prioriteit op zware thema&apos;s en BOM-prikkelpunten</p>
          <ol className="space-y-2">
            {verbeteracties.slice(0, 5).map((v, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-800">{v}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Bronverwijzingen */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-2">Bronverwijzingen</h3>
        <p className="text-xs text-gray-500 mb-2">
          De app bevat geen bronbestanden. Raadpleeg de interne documenten via de{" "}
          <Link href="/bronnen" className="text-blue-600 hover:underline">Bronnenpagina</Link>.
        </p>
        <div className="flex gap-2 flex-wrap">
          <span className="bron-chip">IJKKADER v5</span>
          <span className="bron-chip">BOM Deel 3</span>
          <span className="bron-chip">Hospitality 01-2024</span>
        </div>
      </div>
    </div>
  );
}
