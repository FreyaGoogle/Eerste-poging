import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AntwoordEnum = z.enum(["Ja", "Deels", "Nee", "Onbekend"]);

const UpsertSchema = z.object({
  locatieCheckId: z.string(),
  themaId: z.number().int().min(1).max(10),
  ingevoerdeScore: z.number().min(0).max(10).multipleOf(0.5),
  positiefBewijs: z.array(z.string()).default([]),
  negatiefBewijs: z.array(z.string()).default([]),
  positiefMetKanttekening: z.array(z.string()).default([]),
  bewonersstem: z.string().max(1000).optional().default(""),
  checkVraagAntwoorden: z.record(z.string(), AntwoordEnum).optional().default({}),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = UpsertSchema.parse(body);

    const score = await prisma.themaScore.upsert({
      where: {
        locatieCheckId_themaId: {
          locatieCheckId: data.locatieCheckId,
          themaId: data.themaId,
        },
      },
      update: {
        ingevoerdeScore: data.ingevoerdeScore,
        positiefBewijs: JSON.stringify(data.positiefBewijs),
        negatiefBewijs: JSON.stringify(data.negatiefBewijs),
        positiefMetKanttekening: JSON.stringify(data.positiefMetKanttekening),
        bewonersstem: data.bewonersstem,
        checkVraagAntwoorden: JSON.stringify(data.checkVraagAntwoorden),
      },
      create: {
        locatieCheckId: data.locatieCheckId,
        themaId: data.themaId,
        ingevoerdeScore: data.ingevoerdeScore,
        positiefBewijs: JSON.stringify(data.positiefBewijs),
        negatiefBewijs: JSON.stringify(data.negatiefBewijs),
        positiefMetKanttekening: JSON.stringify(data.positiefMetKanttekening),
        bewonersstem: data.bewonersstem,
        checkVraagAntwoorden: JSON.stringify(data.checkVraagAntwoorden),
      },
    });

    return NextResponse.json(score);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validatiefout", details: error.errors }, { status: 400 });
    }
    console.error("PUT thema-scores error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
