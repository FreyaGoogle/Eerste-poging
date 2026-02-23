import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HospitalityClient } from "@/components/HospitalityClient";

async function getData(checkId: string) {
  return prisma.locatieCheck.findUnique({
    where: { id: checkId },
    include: { hospitalityItems: true },
  });
}

export default async function HospitalityPage({ params }: { params: { id: string } }) {
  const check = await getData(params.id);
  if (!check) notFound();

  return (
    <HospitalityClient
      checkId={params.id}
      checkNaam={check.locatieNaam}
      conceptStatus={check.conceptStatus}
      initialItems={check.hospitalityItems}
    />
  );
}
