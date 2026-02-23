import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { berekenScoreResultaat } from "@/lib/scoring";

async function getLocatieChecks() {
  return prisma.locatieCheck.findMany({
    orderBy: { datum: "desc" },
    include: {
      themaScores: { select: { themaId: true, ingevoerdeScore: true } },
      _count: { select: { observaties: true, bomObservaties: true } },
    },
  });
}

export default async function LocatieChecksPage() {
  const checks = await getLocatieChecks();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LocatieChecks</h1>
          <p className="text-sm text-gray-500 mt-1">{checks.length} check{checks.length !== 1 ? "s" : ""} gevonden</p>
        </div>
        <Link href="/locatie-checks/new" className="btn-primary">
          + Nieuwe check
        </Link>
      </div>

      {checks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">Nog geen LocatieChecks aangemaakt.</p>
          <Link href="/locatie-checks/new" className="btn-primary inline-block">
            Maak eerste check aan
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {checks.map((check) => {
            const invoer = check.themaScores.map((s) => ({
              themaId: s.themaId,
              ingevoerdeScore: s.ingevoerdeScore,
            }));
            const resultaat = berekenScoreResultaat(invoer);
            const ingevuldThemas = invoer.filter((s) => s.ingevoerdeScore > 0).length;

            return (
              <div key={check.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/locatie-checks/${check.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 truncate"
                      >
                        {check.locatieNaam}
                      </Link>
                      <span className={check.conceptStatus === "concept" ? "badge-concept" : "badge-definitief"}>
                        {check.conceptStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span>{check.afdeling}</span>
                      <span className="mx-2">·</span>
                      <span>{new Date(check.datum).toLocaleDateString("nl-NL")}</span>
                      <span className="mx-2">·</span>
                      <span>{check.doelgroep}</span>
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      <span>{ingevuldThemas}/10 thema&apos;s ingevuld</span>
                      <span>{check._count.observaties} observaties</span>
                      <span>{check._count.bomObservaties} BOM-secties</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {resultaat.gewogenTotaalScore !== null ? (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {resultaat.gewogenTotaalScore.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {resultaat.fase ? `Fase ${resultaat.fase}` : ""}
                        </div>
                      </div>
                    ) : (
                      <div className="text-right text-xs text-gray-400">
                        Nog geen<br />score
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/locatie-checks/${check.id}`}
                        className="btn-primary text-xs py-1 px-3"
                      >
                        Openen
                      </Link>
                      <Link
                        href={`/locatie-checks/${check.id}/rapport`}
                        className="btn-secondary text-xs py-1 px-3"
                      >
                        Rapport
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
