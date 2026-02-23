import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  label: z.string(),
  locatie: z.string().max(500).optional(),
});

export async function GET() {
  try {
    const bronnen = await prisma.bron.findMany({ orderBy: { label: "asc" } });
    return NextResponse.json(bronnen);
  } catch (error) {
    console.error("GET bronnen error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const data = UpdateSchema.parse(body);

    const bron = await prisma.bron.update({
      where: { label: data.label },
      data: { locatie: data.locatie ?? "" },
    });

    return NextResponse.json(bron);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validatiefout", details: error.errors }, { status: 400 });
    }
    console.error("PATCH bronnen error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
