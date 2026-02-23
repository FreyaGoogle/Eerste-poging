import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { berekenScoreResultaat, FASE_LABELS, getScoreLabel } from "@/lib/scoring";
import { THEMAS, getThema } from "@/lib/themes";
import { RapportClient } from "@/components/RapportClient";

async function getData(checkId: string) {
  return prisma.locatieCheck.findUnique({
    where: { id: checkId },
    include: {
      themaScores: { orderBy: { themaId: "asc" } },
      bomObservaties: true,
      hospitalityItems: true,
      observaties: true,
    },
  });
}

function parseJson<T>(s: string, fallback: T): T {
  try { return JSON.parse(s) || fallback; } catch { return fallback; }
}

export default async function RapportPage({ params }: { params: { id: string } }) {
  const check = await getData(params.id);
  if (!check) notFound();

  const invoer = check.themaScores.map((s) => ({
    themaId: s.themaId,
    ingevoerdeScore: s.ingevoerdeScore,
  }));
  const resultaat = berekenScoreResultaat(invoer);

  // Prepare full data for client component
  const themaData = THEMAS.map((thema) => {
    const score = check.themaScores.find((s) => s.themaId === thema.id);
    const effectief = resultaat.effectieveScores.find((e) => e.themaId === thema.id);
    return {
      themaId: thema.id,
      naam: thema.naam,
      zwaarGewogen: thema.zwaarGewogen,
      ingevoerdeScore: score?.ingevoerdeScore ?? 0,
      effectieveScore: effectief?.effectieveScore ?? 0,
      isCapped: effectief?.isCapped ?? false,
      capReden: effectief?.capReden,
      positiefBewijs: score ? parseJson<string[]>(score.positiefBewijs, []) : [],
      negatiefBewijs: score ? parseJson<string[]>(score.negatiefBewijs, []) : [],
      positiefMetKanttekening: score ? parseJson<string[]>(score.positiefMetKanttekening, []) : [],
    };
  });

  const bomSuggesties = check.bomObservaties
    .filter((b) => {
      const themas = parseJson<number[]>(b.gekoppeldeThemas, []);
      return themas.includes(6) || themas.includes(10);
    })
    .map((b) => ({
      sectie: b.sectie,
      themas: parseJson<number[]>(b.gekoppeldeThemas, []),
      prikkelDuiding: parseJson<{ type: string; toelichting: string }>(b.prikkelDuiding, { type: "", toelichting: "" }),
    }));

  return (
    <RapportClient
      checkId={params.id}
      check={{
        locatieNaam: check.locatieNaam,
        datum: check.datum.toISOString(),
        afdeling: check.afdeling,
        doelgroep: check.doelgroep,
        context: check.context,
        conceptStatus: check.conceptStatus,
      }}
      themaData={themaData}
      resultaat={{
        gewogenTotaalScore: resultaat.gewogenTotaalScore,
        fase: resultaat.fase,
        drempelregels: resultaat.drempelregels,
        zwareFundering: resultaat.zwareFundering,
      }}
      bomSuggesties={bomSuggesties}
    />
  );
}
