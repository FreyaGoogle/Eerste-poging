import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  plaats: z.string().min(1).max(100),
  moment: z.enum(["rondleiding", "maaltijd", "activiteit", "overig"]),
  bewijsType: z.enum(["direct gezien", "bewonersuiting", "familie-uiting", "teamuitleg"]),
  tags: z.array(z.string()).default([]),
  inhoud: z.string().min(1).max(1000),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const observaties = await prisma.observatie.findMany({
      where: { locatieCheckId: params.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(observaties);
  } catch (error) {
    console.error("GET observaties error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = CreateSchema.parse(body);

    const observatie = await prisma.observatie.create({
      data: {
        locatieCheckId: params.id,
        plaats: data.plaats,
        moment: data.moment,
        bewijsType: data.bewijsType,
        tags: JSON.stringify(data.tags),
        inhoud: data.inhoud,
      },
    });

    return NextResponse.json(observatie, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validatiefout", details: error.errors }, { status: 400 });
    }
    console.error("POST observaties error:", error);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
