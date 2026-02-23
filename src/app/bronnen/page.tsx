import { prisma } from "@/lib/prisma";
import { BronnenClient } from "@/components/BronnenClient";

async function getBronnen() {
  return prisma.bron.findMany({ orderBy: { label: "asc" } });
}

export default async function BronnenPage() {
  const bronnen = await getBronnen();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bronnen</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overzicht van de 3 interne referentiedocumenten. Vul hieronder de locatie-URL of het SharePoint-pad in.
        </p>
      </div>

      <div className="card bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Disclaimer:</strong> De app bevat geen bronbestanden. Alle documentinhoud is conceptueel
          samengevat via zelfgeschreven checklistitems en korte definities. Raadpleeg de originele interne
          documenten via de onderstaande links.
        </p>
      </div>

      <BronnenClient initialBronnen={bronnen} />
    </div>
  );
}
