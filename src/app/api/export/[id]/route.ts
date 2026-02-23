import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { berekenScoreResultaat } from "@/lib/scoring";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const check = await prisma.locatieCheck.findUnique({
      where: { id: params.id },
      include: {
        observaties: true,
        themaScores: { orderBy: { themaId: "asc" } },
        bomObservaties: true,
        hospitalityItems: true,
      },
    });

    if (!check) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }

    // Parse JSON fields
    const themaInvoer = check.themaScores.map((s) => ({
      themaId: s.themaId,
      ingevoerdeScore: s.ingevoerdeScore,
    }));

    const scoreResultaat = berekenScoreResultaat(themaInvoer);

    const exportData = {
      meta: {
        exportDatum: new Date().toISOString(),
        appVersie: "WelzijnCheck v5 + BOM",
        disclaimer:
          "Conceptevaluatie. Geen bronbestanden opgeslagen. Raadpleeg interne documenten via Bronnenpagina.",
      },
      locatieCheck: {
        id: check.id,
        locatieNaam: check.locatieNaam,
        datum: check.datum,
        afdeling: check.afdeling,
        doelgroep: check.doelgroep,
        context: check.context,
        conceptStatus: check.conceptStatus,
      },
      themaScores: check.themaScores.map((s) => ({
        themaId: s.themaId,
        ingevoerdeScore: s.ingevoerdeScore,
        effectieveScore: scoreResultaat.effectieveScores.find((e) => e.themaId === s.themaId)?.effectieveScore ?? s.ingevoerdeScore,
        isCapped: scoreResultaat.effectieveScores.find((e) => e.themaId === s.themaId)?.isCapped ?? false,
        capReden: scoreResultaat.effectieveScores.find((e) => e.themaId === s.themaId)?.capReden,
        positiefBewijs: safeParseJson(s.positiefBewijs, []),
        negatiefBewijs: safeParseJson(s.negatiefBewijs, []),
        positiefMetKanttekening: safeParseJson(s.positiefMetKanttekening, []),
        bewonersstem: s.bewonersstem,
        checkVraagAntwoorden: safeParseJson(s.checkVraagAntwoorden, {}),
      })),
      scoreResultaat: {
        gewogenTotaalScore: scoreResultaat.gewogenTotaalScore,
        fase: scoreResultaat.fase,
        drempelregels: scoreResultaat.drempelregels,
        zwareFundering: scoreResultaat.zwareFundering,
      },
      observaties: check.observaties.map((o) => ({
        id: o.id,
        plaats: o.plaats,
        moment: o.moment,
        bewijsType: o.bewijsType,
        tags: safeParseJson(o.tags, []),
        inhoud: o.inhoud,
        createdAt: o.createdAt,
      })),
      bomObservaties: check.bomObservaties.map((b) => ({
        sectie: b.sectie,
        antwoorden: safeParseJson(b.antwoorden, {}),
        prikkelDuiding: safeParseJson(b.prikkelDuiding, {}),
        gekoppeldeThemas: safeParseJson(b.gekoppeldeThemas, []),
        participerend: b.participerend,
        watDeedObserveerder: b.watDeedObserveerder,
        effectOpBewoners: b.effectOpBewoners,
      })),
      hospitalityItems: check.hospitalityItems.map((h) => ({
        categorie: h.categorie,
        antwoorden: safeParseJson(h.antwoorden, {}),
        notities: h.notities,
      })),
      bronVerwijzingen: [
        { label: "IJKKADER v5", titel: "IJKKADER Welzijn in Beeld 2026 – v5 Houding & Betekenis" },
        { label: "BOM Deel 3", titel: "Deel 3 – Lesstof – Syllabus Basisopleiding – Brein Omgeving Methodiek – 2022" },
        { label: "Hospitality 01-2024", titel: "Hospitality boekje Domus Valuas – januari 2024" },
      ],
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("GET export error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}

function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
