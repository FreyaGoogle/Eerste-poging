import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BOMModuleClient } from "@/components/BOMModuleClient";

async function getData(checkId: string) {
  const check = await prisma.locatieCheck.findUnique({
    where: { id: checkId },
    include: {
      bomObservaties: true,
    },
  });
  return check;
}

export default async function BOMPage({ params }: { params: { id: string } }) {
  const check = await getData(params.id);
  if (!check) notFound();

  return (
    <BOMModuleClient
      checkId={params.id}
      checkNaam={check.locatieNaam}
      conceptStatus={check.conceptStatus}
      initialBOM={check.bomObservaties}
    />
  );
}
