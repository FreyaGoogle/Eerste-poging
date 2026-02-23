import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seed gestart...");

  // ─── Bronnen ────────────────────────────────────────────────────────────────
  await prisma.bron.upsert({
    where: { label: "IJKKADER v5" },
    update: {},
    create: {
      label: "IJKKADER v5",
      titel: "IJKKADER Welzijn in Beeld 2026 – v5 Houding & Betekenis",
      versie: "versie 5",
      datum: "2026",
      locatie: "",
    },
  });

  await prisma.bron.upsert({
    where: { label: "BOM Deel 3" },
    update: {},
    create: {
      label: "BOM Deel 3",
      titel: "Deel 3 – Lesstof – Syllabus Basisopleiding – Brein Omgeving Methodiek",
      versie: "2022",
      datum: "2022",
      locatie: "",
    },
  });

  await prisma.bron.upsert({
    where: { label: "Hospitality 01-2024" },
    update: {},
    create: {
      label: "Hospitality 01-2024",
      titel: "Hospitality boekje Domus Valuas – januari 2024",
      versie: "januari 2024",
      datum: "januari 2024",
      locatie: "",
    },
  });

  console.log("✅ Bronnen aangemaakt");

  // ─── Voorbeeld LocatieCheck ─────────────────────────────────────────────────
  const check = await prisma.locatieCheck.create({
    data: {
      locatieNaam: "Woonzorgcentrum De Linde – Voorbeeld",
      datum: new Date("2026-02-10"),
      afdeling: "Afdeling Noord – PG",
      doelgroep: "18 bewoners PG (gevorderd dementie), 2 tijdelijke opname somatisch",
      context:
        "Observatiedag op een doordeweekse maandag. Ochtendzorg in volle gang bij binnenkomst. " +
        "Sfeer redelijk rustig; in de middag wat meer onrust bij een aantal bewoners. " +
        "Context en namen van betrokkenen zijn geanonimiseerd (bewoner X, medewerker Y).",
      conceptStatus: "concept",
    },
  });

  console.log(`✅ LocatieCheck aangemaakt: ${check.id}`);

  // ─── Observaties ────────────────────────────────────────────────────────────
  await prisma.observatie.createMany({
    data: [
      {
        locatieCheckId: check.id,
        plaats: "Huiskamer",
        moment: "activiteit",
        bewijsType: "direct gezien",
        tags: JSON.stringify(["bejegening", "inrichting"]),
        inhoud:
          "Bewoner X zit achter in de hoek, weg van de groep. Medewerker Y maakt oogcontact en gaat op kniehoogte zitten. " +
          "Bewoner ontspant zichtbaar en begint zelf te praten over vroeger.",
      },
      {
        locatieCheckId: check.id,
        plaats: "Restaurant",
        moment: "maaltijd",
        bewijsType: "direct gezien",
        tags: JSON.stringify(["maaltijd", "prikkel"]),
        inhoud:
          "Maaltijdmoment: tafel is netjes gedekt met tafellaken en persoonlijk servies. " +
          "Eten wordt in porties geserveerd en bewoners kiezen zelf wat zij eerst willen eten. " +
          "Achtergrondmuziek staat iets te hard; één bewoner kijkt gespannen.",
      },
      {
        locatieCheckId: check.id,
        plaats: "Gang",
        moment: "rondleiding",
        bewijsType: "teamuitleg",
        tags: JSON.stringify(["inrichting", "ritueel"]),
        inhoud:
          "In de gang hangen persoonlijke foto&apos;s en hobbywerk van bewoners op ooghoogte. " +
          "Teamlid legt uit dat dit bewust zo ingericht is als oriëntatiehulp en als gespreksaanzet.",
      },
    ],
  });

  console.log("✅ Observaties aangemaakt");

  // ─── Thema scores ────────────────────────────────────────────────────────────
  const themaScoresData = [
    {
      themaId: 1,
      ingevoerdeScore: 7.5,
      positiefBewijs: ["Levensverhalen zijn actueel en worden actief gebruikt in dagelijks contact."],
      negatiefBewijs: [],
      positiefMetKanttekening: ["Niet alle levensverhalen zijn even gedetailleerd – variatie per bewoner."],
      bewonersstem: "",
      checkVraagAntwoorden: { "1_1": "Ja", "1_2": "Ja", "1_3": "Ja", "1_4": "Deels", "1_5": "Ja", "1_6": "Deels", "1_7": "Ja", "1_8": "Onbekend" },
    },
    {
      themaId: 2,
      ingevoerdeScore: 5.0,
      positiefBewijs: ["Religieuze praktijken worden gefaciliteerd; geestelijk verzorger aanwezig op woensdag."],
      negatiefBewijs: ["Aanbod zingevingsactiviteiten is beperkt voor niet-religieuze bewoners."],
      positiefMetKanttekening: [],
      bewonersstem: "",
      checkVraagAntwoorden: { "2_1": "Deels", "2_2": "Ja", "2_3": "Ja", "2_4": "Ja", "2_5": "Deels", "2_6": "Deels", "2_7": "Ja", "2_8": "Nee" },
    },
    {
      themaId: 3,
      ingevoerdeScore: 6.5,
      positiefBewijs: ["Bezoek is altijd welkom; geen vaste bezoektijden."],
      negatiefBewijs: [],
      positiefMetKanttekening: ["Isolement-risico bij 3 bewoners wordt gevolgd maar nog geen actief plan."],
      bewonersstem: "",
      checkVraagAntwoorden: { "3_1": "Ja", "3_2": "Deels", "3_3": "Ja", "3_4": "Deels", "3_5": "Deels", "3_6": "Nee", "3_7": "Ja", "3_8": "Onbekend" },
    },
    {
      themaId: 4,
      ingevoerdeScore: 6.0,
      positiefBewijs: ["Welbevinden wordt tweemaal per week geobserveerd en gedocumenteerd."],
      negatiefBewijs: [],
      positiefMetKanttekening: [],
      bewonersstem: "",
      checkVraagAntwoorden: { "4_1": "Ja", "4_2": "Ja", "4_3": "Ja", "4_4": "Deels", "4_5": "Deels", "4_6": "Deels", "4_7": "Nee", "4_8": "Deels" },
    },
    {
      themaId: 5,
      ingevoerdeScore: 6.5,
      positiefBewijs: ["Bewoners kiezen zelf opstijdstip; geen vaste ochtendroutine opgelegd."],
      negatiefBewijs: ["Maaltijdkeuze is beperkt tot dagmenu; geen alternatief beschikbaar."],
      positiefMetKanttekening: [],
      bewonersstem: "",
      checkVraagAntwoorden: { "5_1": "Ja", "5_2": "Ja", "5_3": "Ja", "5_4": "Deels", "5_5": "Ja", "5_6": "Ja", "5_7": "Deels", "5_8": "Nee" },
    },
    {
      themaId: 6,
      ingevoerdeScore: 7.0,
      positiefBewijs: ["Bewoners melden dat zij zich veilig voelen; laagdrempelig aanspreekpunt aanwezig."],
      negatiefBewijs: [],
      positiefMetKanttekening: ["Protocol grensoverschrijdend gedrag bestaat maar niet alle medewerkers kennen het."],
      bewonersstem: "",
      checkVraagAntwoorden: { "6_1": "Ja", "6_2": "Ja", "6_3": "Ja", "6_4": "Ja", "6_5": "Ja", "6_6": "Ja", "6_7": "Deels", "6_8": "Deels" },
    },
    {
      themaId: 10,
      ingevoerdeScore: 7.5,
      positiefBewijs: ["Medewerkers benaderen bewoners op ooghoogte; aanraking is zorgvuldig."],
      negatiefBewijs: [],
      positiefMetKanttekening: [],
      bewonersstem: "",
      checkVraagAntwoorden: { "10_1": "Ja", "10_2": "Ja", "10_3": "Ja", "10_4": "Ja", "10_5": "Deels", "10_6": "Deels", "10_7": "Ja", "10_8": "Ja" },
    },
  ];

  for (const ts of themaScoresData) {
    await prisma.themaScore.create({
      data: {
        locatieCheckId: check.id,
        themaId: ts.themaId,
        ingevoerdeScore: ts.ingevoerdeScore,
        positiefBewijs: JSON.stringify(ts.positiefBewijs),
        negatiefBewijs: JSON.stringify(ts.negatiefBewijs),
        positiefMetKanttekening: JSON.stringify(ts.positiefMetKanttekening),
        bewonersstem: ts.bewonersstem,
        checkVraagAntwoorden: JSON.stringify(ts.checkVraagAntwoorden),
      },
    });
  }

  console.log("✅ ThemaScores aangemaakt");

  // ─── BOM Observaties ─────────────────────────────────────────────────────────
  await prisma.bOMObservatie.create({
    data: {
      locatieCheckId: check.id,
      sectie: "eerste_indruk",
      antwoorden: JSON.stringify({
        ei_1: "Sfeer was redelijk rustig; één medewerker begroette ons direct bij binnenkomst.",
        ei_2: "Muziek op de achtergrond (wat te luid), licht ochtendlicht vanuit ramen, geur neutraal.",
        ei_3: "De meeste bewoners zaten in de huiskamer; twee lagen nog op bed.",
        ei_4: "Medewerker Y maakte direct oogcontact en introduceerde zichzelf vriendelijk.",
      }),
      prikkelDuiding: JSON.stringify({ type: "gunstig", toelichting: "Begroeting was warm en bewoners reageerden ontspannen op nieuwe aanwezigheid." }),
      gekoppeldeThemas: JSON.stringify([6, 10]),
      participerend: false,
      watDeedObserveerder: "",
      effectOpBewoners: "",
    },
  });

  await prisma.bOMObservatie.create({
    data: {
      locatieCheckId: check.id,
      sectie: "bejegening",
      antwoorden: JSON.stringify({
        bej_1: "Medewerkers spreken bewoners aan op rustige toon, gebruiken voornaam op verzoek van bewoner.",
        bej_2: "Bij zorgtaak (maaltijdondersteuning) maakt medewerker actief oogcontact.",
        bej_3: "Bewoner krijgt zichtbaar ruimte om te reageren; medewerker wacht geduldig.",
        bej_4: "Keuzes over kleding worden expliciet nagevraagd.",
        bej_5: "Geen infantilisering waargenomen; toon is gelijkwaardig.",
      }),
      prikkelDuiding: JSON.stringify({ type: "gunstig", toelichting: "Bejegening is warm, geduldig en persoonsgecentreerd tijdens observatieperiode." }),
      gekoppeldeThemas: JSON.stringify([2, 5, 6, 10]),
      participerend: true,
      watDeedObserveerder: "Mee-eten aan tafel (ontbijt), aanwezig bij twee zorggesprekken.",
      effectOpBewoners: "Geen merkbare extra onrust; bewoner X vroeg observeerder om krant.",
    },
  });

  console.log("✅ BOM observaties aangemaakt");

  // ─── Hospitality quickscan ───────────────────────────────────────────────────
  await prisma.hospitalityItem.create({
    data: {
      locatieCheckId: check.id,
      categorie: "eerste_indruk",
      antwoorden: JSON.stringify({
        ei_1: true,
        ei_2: true,
        ei_3: true,
        ei_4: true,
        ei_5: true,
      }),
      notities: "Entree was schoon en netjes; medewerker bij de balie begroette actief.",
    },
  });

  await prisma.hospitalityItem.create({
    data: {
      locatieCheckId: check.id,
      categorie: "eten_drinken",
      antwoorden: JSON.stringify({
        ed_1: true,
        ed_2: true,
        ed_3: false,
        ed_4: true,
        ed_5: true,
      }),
      notities: "Keuzevrijheid in eten is beperkt – slechts één dagmenu. Overige punten positief.",
    },
  });

  console.log("✅ Hospitality quickscan aangemaakt");
  console.log(`\n🎉 Seed voltooid. LocatieCheck ID: ${check.id}`);
  console.log("   Ga naar http://localhost:3000 om de app te bekijken.");
}

main()
  .catch((e) => {
    console.error("Seed fout:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
