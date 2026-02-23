import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  locatieNaam: z.string().min(1).max(200).optional(),
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  afdeling: z.string().min(1).max(200).optional(),
  doelgroep: z.string().min(1).max(500).optional(),
  context: z.string().max(2000).optional(),
  conceptStatus: z.enum(["concept", "definitief"]).optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const check = await prisma.locatieCheck.findUnique({
      where: { id: params.id },
      include: {
        observaties: { orderBy: { createdAt: "desc" } },
        themaScores: { orderBy: { themaId: "asc" } },
        bomObservaties: true,
        hospitalityItems: true,
      },
    });

    if (!check) {
      return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
    }

    return NextResponse.json(check);
  } catch (error) {
    console.error("GET /api/locatie-checks/[id] error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.locatieNaam !== undefined) updateData.locatieNaam = data.locatieNaam;
    if (data.datum !== undefined) updateData.datum = new Date(data.datum);
    if (data.afdeling !== undefined) updateData.afdeling = data.afdeling;
    if (data.doelgroep !== undefined) updateData.doelgroep = data.doelgroep;
    if (data.context !== undefined) updateData.context = data.context;
    if (data.conceptStatus !== undefined) updateData.conceptStatus = data.conceptStatus;

    const check = await prisma.locatieCheck.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(check);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validatiefout", details: error.errors }, { status: 400 });
    }
    console.error("PATCH /api/locatie-checks/[id] error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.locatieCheck.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/locatie-checks/[id] error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
