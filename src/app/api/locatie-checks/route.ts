import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  locatieNaam: z.string().min(1).max(200),
  datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  afdeling: z.string().min(1).max(200),
  doelgroep: z.string().min(1).max(500),
  context: z.string().max(2000).optional().default(""),
  conceptStatus: z.enum(["concept", "definitief"]).optional().default("concept"),
});

export async function GET() {
  try {
    const checks = await prisma.locatieCheck.findMany({
      orderBy: { datum: "desc" },
      include: {
        themaScores: { select: { themaId: true, ingevoerdeScore: true } },
        _count: { select: { observaties: true, bomObservaties: true } },
      },
    });
    return NextResponse.json(checks);
  } catch (error) {
    console.error("GET /api/locatie-checks error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateSchema.parse(body);

    const check = await prisma.locatieCheck.create({
      data: {
        locatieNaam: data.locatieNaam,
        datum: new Date(data.datum),
        afdeling: data.afdeling,
        doelgroep: data.doelgroep,
        context: data.context,
        conceptStatus: data.conceptStatus,
      },
    });

    return NextResponse.json(check, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validatiefout", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/locatie-checks error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
