import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { THEMAS } from "@/lib/themes";
import { berekenScoreResultaat } from "@/lib/scoring";

async function getStats() {
  const [totalChecks, recentChecks] = await Promise.all([
    prisma.locatieCheck.count(),
    prisma.locatieCheck.findMany({
      take: 5,
      orderBy: { datum: "desc" },
      include: {
        themaScores: { select: { themaId: true, ingevoerdeScore: true } },
      },
    }),
  ]);
  return { totalChecks, recentChecks };
}

export default async function HomePage() {
  const { totalChecks, recentChecks } = await getStats();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">WelzijnCheck v5 + BOM</h1>
        <p className="text-blue-100 max-w-2xl">
          Evaluatietool voor welzijn in de zorg op basis van het IJKKADER Welzijn in Beeld v5,
          geïntegreerd met de Brein Omgeving Methodiek (BOM) en een Hospitality quickscan.
        </p>
        <div className="flex gap-4 mt-6">
          <Link href="/locatie-checks/new" className="bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors text-sm">
            + Nieuwe LocatieCheck
          </Link>
          <Link href="/locatie-checks" className="border border-blue-300 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Alle checks bekijken
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-3xl font-bold text-blue-600">{totalChecks}</div>
          <div className="text-sm text-gray-500 mt-1">LocatieChecks totaal</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-amber-600">4</div>
          <div className="text-sm text-gray-500 mt-1">Zwaar gewogen thema&apos;s (2, 5, 6, 10)</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-green-600">10</div>
          <div className="text-sm text-gray-500 mt-1">IJKKADER v5 thema&apos;s</div>
        </div>
      </div>

      {/* 10 thema overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">De 10 thema&apos;s van het IJKKADER v5</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {THEMAS.map((thema) => (
            <div
              key={thema.id}
              className={`card border-l-4 ${thema.zwaarGewogen ? "border-l-amber-500 bg-amber-50" : "border-l-blue-400"}`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xs font-bold text-gray-500">T{thema.id}</span>
                {thema.zwaarGewogen && (
                  <span className="badge-zwaar">Zwaar</span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-800 mt-1 leading-tight">{thema.naam}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recente checks */}
      {recentChecks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Recente LocatieChecks</h2>
            <Link href="/locatie-checks" className="text-blue-600 hover:underline text-sm">Alle bekijken →</Link>
          </div>
          <div className="space-y-2">
            {recentChecks.map((check) => {
              const invoer = check.themaScores.map((s) => ({ themaId: s.themaId, ingevoerdeScore: s.ingevoerdeScore }));
              const resultaat = berekenScoreResultaat(invoer);
              return (
                <Link
                  key={check.id}
                  href={`/locatie-checks/${check.id}`}
                  className="card flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="font-medium text-gray-900">{check.locatieNaam}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {check.afdeling} · {new Date(check.datum).toLocaleDateString("nl-NL")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {resultaat.gewogenTotaalScore !== null && (
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">{resultaat.gewogenTotaalScore.toFixed(1)}</div>
                        <div className="text-xs text-gray-400">gewogen score</div>
                      </div>
                    )}
                    <span className={check.conceptStatus === "concept" ? "badge-concept" : "badge-definitief"}>
                      {check.conceptStatus}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Drempelregels info */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Methodische bewaking</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li><strong>DR-A:</strong> Thema 6 &lt; 3.0 → Fase 3 en 4 niet toegestaan</li>
          <li><strong>DR-B:</strong> Thema 2 én 6 beiden &lt; 3.0 → Eindscore begrensd op 2.7</li>
          <li><strong>DR-C:</strong> Thema 10 &lt; 3.0 → Scores thema 5 en 6 begrensd op 5.0</li>
        </ul>
        <p className="text-xs text-blue-500 mt-2">Bronlabel: IJKKADER v5</p>
      </div>
    </div>
  );
}
