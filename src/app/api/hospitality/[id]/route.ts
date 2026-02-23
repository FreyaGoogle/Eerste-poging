import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { HOSPITALITY_CATEGORIEEN } from "@/lib/hospitality-data";

const CategorieIds = HOSPITALITY_CATEGORIEEN.map((c) => c.id) as [string, ...string[]];

const UpsertSchema = z.object({
  locatieCheckId: z.string(),
  categorie: z.enum(CategorieIds),
  antwoorden: z.record(z.string(), z.boolean().nullable()).optional().default({}),
  notities: z.string().max(1000).optional().default(""),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = UpsertSchema.parse(body);

    const item = await prisma.hospitalityItem.upsert({
      where: {
        locatieCheckId_categorie: {
          locatieCheckId: data.locatieCheckId,
          categorie: data.categorie,
        },
      },
      update: {
        antwoorden: JSON.stringify(data.antwoorden),
        notities: data.notities,
      },
      create: {
        locatieCheckId: data.locatieCheckId,
        categorie: data.categorie,
        antwoorden: JSON.stringify(data.antwoorden),
        notities: data.notities,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validatiefout", details: error.errors }, { status: 400 });
    }
    console.error("PUT hospitality error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
