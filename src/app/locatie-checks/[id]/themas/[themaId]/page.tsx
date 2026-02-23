import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getThema } from "@/lib/themes";
import { ThemaDetailForm } from "@/components/ThemaDetailForm";

async function getData(checkId: string, themaId: number) {
  const [check, themaScore] = await Promise.all([
    prisma.locatieCheck.findUnique({
      where: { id: checkId },
      select: { id: true, locatieNaam: true, conceptStatus: true, themaScores: { orderBy: { themaId: "asc" } } },
    }),
    prisma.themaScore.findUnique({
      where: { locatieCheckId_themaId: { locatieCheckId: checkId, themaId } },
    }),
  ]);
  return { check, themaScore };
}

export default async function ThemaDetailPage({
  params,
}: {
  params: { id: string; themaId: string };
}) {
  const themaId = parseInt(params.themaId);
  if (isNaN(themaId) || themaId < 1 || themaId > 10) notFound();

  const thema = getThema(themaId);
  if (!thema) notFound();

  const { check, themaScore } = await getData(params.id, themaId);
  if (!check) notFound();

  return (
    <ThemaDetailForm
      checkId={params.id}
      checkNaam={check.locatieNaam}
      conceptStatus={check.conceptStatus}
      thema={thema}
      initialScore={themaScore}
    />
  );
}
