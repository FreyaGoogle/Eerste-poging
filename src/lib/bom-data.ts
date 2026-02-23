// BOM (Brein Omgeving Methodiek) – Sectiedefinities en vragen
// Bronlabel: "BOM Deel 3"
// Vragen zijn zelfgeformuleerd, conceptueel passend bij de syllabus Basisopleiding BOM 2022.

export interface BOMVraag {
  id: string;
  vraag: string;
}

export interface BOMSectie {
  id: string;
  naam: string;
  omschrijving: string;
  vragen: BOMVraag[];
}

export const BOM_SECTIES: BOMSectie[] = [
  {
    id: "eerste_indruk",
    naam: "Eerste Indruk",
    omschrijving:
      "Wat valt op bij binnenkomst? Let op sfeer, rust, prikkels en de houding van medewerkers en bewoners.",
    vragen: [
      { id: "ei_1", vraag: "Wat is de algemene sfeer bij binnenkomst (rustig, druk, gespannen, warm)?" },
      { id: "ei_2", vraag: "Welke zintuiglijke prikkels vallen direct op (geluid, licht, geur, kleur)?" },
      { id: "ei_3", vraag: "Hoe reageren bewoners zichtbaar op de omgeving (ontspannen, teruggetrokken, alert)?" },
      { id: "ei_4", vraag: "Welke houding tonen medewerkers bij eerste contact (open, gehaast, betrokken)?" },
    ],
  },
  {
    id: "bewoner_huiskamer",
    naam: "Bewoner in de Huiskamer",
    omschrijving:
      "Observeer hoe bewoners de gemeenschappelijke leefruimte beleven. Let op positie, contact en activiteit.",
    vragen: [
      { id: "bh_1", vraag: "Hoe zijn bewoners gepositioneerd in de ruimte (centraal, afgezonderd, in groepjes)?" },
      { id: "bh_2", vraag: "Is er spontaan contact tussen bewoners onderling, of blijft ieder apart?" },
      { id: "bh_3", vraag: "Welke activiteiten vinden spontaan plaats (gesprek, kijken, bewegen, slapen)?" },
      { id: "bh_4", vraag: "Zijn er tekenen van onrust, irritatie of terugtrekgedrag bij specifieke prikkels?" },
      { id: "bh_5", vraag: "Hoe reageren bewoners op binnenkomst van medewerkers of bezoekers?" },
    ],
  },
  {
    id: "werkleefprocessen",
    naam: "Werk-Leefprocessen (24-uurs)",
    omschrijving:
      "Beschrijf de overgang tussen zorgtaken en leefmomenten. Noteer ritme, overdrachten en stiltemomenten.",
    vragen: [
      { id: "wl_1", vraag: "Hoe verloopt de overgang tussen zorgtaak en leefmoment (abrupt of geleidelijk)?" },
      { id: "wl_2", vraag: "Is er zichtbaar ritme in de dag dat bewoners houvast biedt?" },
      { id: "wl_3", vraag: "Worden maaltijden en rustmomenten bewust ingezet als welzijnsmoment?" },
      { id: "wl_4", vraag: "Zijn er storende onderbrekingen in de dagstructuur zichtbaar?" },
      { id: "wl_5", vraag: "Hoe wordt de avond-/nachtoverdracht vormgegeven ten aanzien van rust en continuïteit?" },
    ],
  },
  {
    id: "bejegening",
    naam: "Bejegening & Interactie",
    omschrijving:
      "Let op de kwaliteit van contact tussen medewerker en bewoner. Observeer toon, tempo, ruimte voor respons.",
    vragen: [
      { id: "bej_1", vraag: "Op welke toon en wijze spreken medewerkers bewoners aan (rustig, haastig, betrokken)?" },
      { id: "bej_2", vraag: "Is er oogcontact en fysieke afstemming bij zorghandelingen?" },
      { id: "bej_3", vraag: "Krijgt de bewoner voldoende tijd om te reageren voor een medewerker verdergaat?" },
      { id: "bej_4", vraag: "Worden keuzes en voorkeuren van bewoners herkend en gehonoreerd in het contact?" },
      { id: "bej_5", vraag: "Is er sprake van infantilisering of juist van gelijkwaardige bejegening?" },
    ],
  },
  {
    id: "onbegrepen_gedrag",
    naam: "Voorafgaand aan Onbegrepen Gedrag",
    omschrijving:
      "Analyseer de context rond momenten van onbegrepen gedrag. Zoek naar triggers, patronen en omgevingsfactoren.",
    vragen: [
      { id: "ob_1", vraag: "Welke prikkels (lawaai, licht, drukte, aanraking) gingen vooraf aan het gedrag?" },
      { id: "ob_2", vraag: "Was de bewoner al langer zichtbaar gespannen of onrustig voor het incident?" },
      { id: "ob_3", vraag: "Welke behoefte lijkt schuil te gaan achter het gedrag (veiligheid, contact, controle)?" },
      { id: "ob_4", vraag: "Hoe reageerde het team en welk effect had dit op de bewoner?" },
      { id: "ob_5", vraag: "Zijn er patroonmatige omstandigheden (tijdstip, overgang, medewerker) aan te wijzen?" },
    ],
  },
];

export function getBOMSectie(id: string): BOMSectie | undefined {
  return BOM_SECTIES.find((s) => s.id === id);
}

export const BOM_KOPPELBARE_THEMAS = [2, 5, 6, 8, 10];
