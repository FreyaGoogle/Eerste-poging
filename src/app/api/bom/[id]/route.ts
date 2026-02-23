import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { BOM_SECTIES } from "@/lib/bom-data";

const SectieIds = BOM_SECTIES.map((s) => s.id) as [string, ...string[]];

const UpsertSchema = z.object({
  locatieCheckId: z.string(),
  sectie: z.enum(SectieIds),
  antwoorden: z.record(z.string(), z.string()).optional().default({}),
  prikkelDuiding: z
    .object({
      type: z.enum(["gunstig", "ongunstig", ""]),
      toelichting: z.string().max(500),
    })
    .optional()
    .default({ type: "", toelichting: "" }),
  gekoppeldeThemas: z.array(z.number().int().min(1).max(10)).optional().default([]),
  participerend: z.boolean().optional().default(false),
  watDeedObserveerder: z.string().max(500).optional().default(""),
  effectOpBewoners: z.string().max(500).optional().default(""),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = UpsertSchema.parse(body);

    const bom = await prisma.bOMObservatie.upsert({
      where: {
        locatieCheckId_sectie: {
          locatieCheckId: data.locatieCheckId,
          sectie: data.sectie,
        },
      },
      update: {
        antwoorden: JSON.stringify(data.antwoorden),
        prikkelDuiding: JSON.stringify(data.prikkelDuiding),
        gekoppeldeThemas: JSON.stringify(data.gekoppeldeThemas),
        participerend: data.participerend,
        watDeedObserveerder: data.watDeedObserveerder,
        effectOpBewoners: data.effectOpBewoners,
      },
      create: {
        locatieCheckId: data.locatieCheckId,
        sectie: data.sectie,
        antwoorden: JSON.stringify(data.antwoorden),
        prikkelDuiding: JSON.stringify(data.prikkelDuiding),
        gekoppeldeThemas: JSON.stringify(data.gekoppeldeThemas),
        participerend: data.participerend,
        watDeedObserveerder: data.watDeedObserveerder,
        effectOpBewoners: data.effectOpBewoners,
      },
    });

    return NextResponse.json(bom);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validatiefout", details: error.errors }, { status: 400 });
    }
    console.error("PUT bom error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
