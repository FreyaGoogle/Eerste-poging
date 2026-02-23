import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { THEMAS } from "@/lib/themes";
import { berekenScoreResultaat, FASE_LABELS } from "@/lib/scoring";
import { LocatieCheckActions } from "@/components/LocatieCheckActions";

async function getCheck(id: string) {
  return prisma.locatieCheck.findUnique({
    where: { id },
    include: {
      themaScores: { orderBy: { themaId: "asc" } },
      observaties: { orderBy: { createdAt: "desc" }, take: 5 },
      bomObservaties: true,
      hospitalityItems: true,
    },
  });
}

export default async function LocatieCheckPage({ params }: { params: { id: string } }) {
  const check = await getCheck(params.id);
  if (!check) notFound();

  const invoer = check.themaScores.map((s) => ({
    themaId: s.themaId,
    ingevoerdeScore: s.ingevoerdeScore,
  }));
  const resultaat = berekenScoreResultaat(invoer);

  const scoreMap = new Map(check.themaScores.map((s) => [s.themaId, s.ingevoerdeScore]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{check.locatieNaam}</h1>
            <span className={check.conceptStatus === "concept" ? "badge-concept" : "badge-definitief"}>
              {check.conceptStatus}
            </span>
            {check.conceptStatus === "concept" && (
              <span className="text-xs text-orange-600 font-medium">CONCEPTEVALUATIE</span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {check.afdeling} · {new Date(check.datum).toLocaleDateString("nl-NL")} · {check.doelgroep}
          </p>
        </div>
        <LocatieCheckActions checkId={check.id} conceptStatus={check.conceptStatus} />
      </div>

      {/* Score overzicht */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card md:col-span-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gewogen score</div>
          <div className="text-4xl font-bold text-blue-600">
            {resultaat.gewogenTotaalScore !== null ? resultaat.gewogenTotaalScore.toFixed(1) : "–"}
          </div>
          {resultaat.fase && (
            <div className="text-xs text-gray-500 mt-1">{FASE_LABELS[resultaat.fase]}</div>
          )}
        </div>
        <div className="card md:col-span-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Actieve drempelregels</div>
          {resultaat.drempelregels.filter((d) => d.actief).length === 0 ? (
            <p className="text-sm text-green-600">Geen actieve drempelregels</p>
          ) : (
            <ul className="space-y-1">
              {resultaat.drempelregels
                .filter((d) => d.actief)
                .map((d) => (
                  <li key={d.code} className="text-sm text-red-700 bg-red-50 rounded px-2 py-1">
                    <span className="font-semibold">{d.code}:</span> {d.beschrijving}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {/* Navigatie tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0 flex-wrap">
        {[
          { href: `/locatie-checks/${check.id}`, label: "Overzicht" },
          { href: `/locatie-checks/${check.id}/bom`, label: "BOM Observatie" },
          { href: `/locatie-checks/${check.id}/hospitality`, label: "Hospitality" },
          { href: `/locatie-checks/${check.id}/rapport`, label: "Rapport & Export" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 -mb-px"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Thema-tegels */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">10 Thema&apos;s IJKKADER v5</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {THEMAS.map((thema) => {
            const ingevoerd = scoreMap.get(thema.id) ?? 0;
            const effectief = resultaat.effectieveScores.find((e) => e.themaId === thema.id);
            const isCapped = effectief?.isCapped ?? false;

            return (
              <Link
                key={thema.id}
                href={`/locatie-checks/${check.id}/themas/${thema.id}`}
                className={`card hover:shadow-md transition-shadow border-l-4 ${
                  thema.zwaarGewogen ? "border-l-amber-500" : "border-l-blue-400"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-400">T{thema.id}</span>
                      <span className="font-medium text-gray-900 text-sm">{thema.naam}</span>
                      {thema.zwaarGewogen && <span className="badge-zwaar">Zwaar gewogen</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{thema.definitie}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {ingevoerd > 0 ? (
                      <>
                        <div className={`text-xl font-bold ${isCapped ? "text-orange-600" : "text-blue-600"}`}>
                          {effectief?.effectieveScore.toFixed(1) ?? ingevoerd.toFixed(1)}
                        </div>
                        {isCapped && (
                          <div className="text-xs text-orange-500">
                            (ingevoerd: {ingevoerd.toFixed(1)})
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-300">–</div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recente observaties */}
      {check.observaties.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Recente observaties</h2>
          <div className="space-y-2">
            {check.observaties.map((obs) => {
              const tags: string[] = (() => {
                try { return JSON.parse(obs.tags); } catch { return []; }
              })();
              return (
                <div key={obs.id} className="card">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500 mb-1">
                        <span className="font-medium text-gray-700">{obs.plaats}</span>
                        <span>·</span>
                        <span>{obs.moment}</span>
                        <span>·</span>
                        <span>{obs.bewijsType}</span>
                        {tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-800">{obs.inhoud}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
