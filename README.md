# WelzijnCheck v5 + BOM

Evaluatietool voor welzijn in de zorg op basis van het **IJKKADER Welzijn in Beeld v5**, geïntegreerd met de **Brein Omgeving Methodiek (BOM)** observatiemodule en een **Hospitality quickscan**.

**Tech stack:** Next.js 14 (App Router) · TypeScript · SQLite via Prisma · Tailwind CSS · Recharts · jsPDF

---

## Inhoudsopgave

- [Installatie](#installatie)
- [Database setup](#database-setup)
- [Development starten](#development-starten)
- [Tests uitvoeren](#tests-uitvoeren)
- [Bronnen](#bronnen-beleid)
- [Functionaliteiten](#functionaliteiten)
- [Methodische bewaking](#methodische-bewaking)

---

## Installatie

```bash
# Vereisten: Node.js >= 18
npm install
```

---

## Database setup

```bash
# Maak de SQLite-database aan en voer migraties uit
npm run db:migrate
# Vul met voorbeelddata (1 LocatieCheck + observaties + BOM + Hospitality)
npm run db:seed
```

De database wordt opgeslagen als `prisma/dev.db` (lokaal, niet in de repo).

---

## Development starten

```bash
npm run dev
```

De app draait op [http://localhost:3000](http://localhost:3000).

---

## Tests uitvoeren

```bash
npm test
```

Unit tests voor:
- **Scoreberekening** (gewogen totaalscore, drempelregels, caps, fasebepaling)
- **Privacy guard** (detectie van mogelijke persoonsgegevens)

```bash
npm run test:watch   # interactieve modus
```

---

## Bronnen beleid

> **De app bevat geen bronbestanden.** Er worden geen PDF/DOCX-bestanden meegeleverd of opgeslagen.

Alle checklists, definities en vragen in de app zijn **zelfgeschreven** en conceptueel afgestemd op drie interne referentiedocumenten. Er worden geen tekstkopieën of citaten overgenomen.

De drie interne bronnen worden uitsluitend als **bronlabels** (chips) weergegeven:

| Label | Document |
|---|---|
| `IJKKADER v5` | IJKKADER Welzijn in Beeld 2026 – v5 Houding & Betekenis |
| `BOM Deel 3` | Deel 3 – Lesstof – Syllabus Basisopleiding – Brein Omgeving Methodiek – 2022 |
| `Hospitality 01-2024` | Hospitality boekje Domus Valuas – januari 2024 |

Via de **Bronnenpagina** (`/bronnen`) kan per document een SharePoint-link of intern pad worden ingevuld zodat gebruikers de originele documenten snel kunnen raadplegen.

---

## Functionaliteiten

### A. LocatieCheck (v5)

- CRUD voor locaties met: naam, datum, afdeling, doelgroepverdeling, context, conceptstatus
- Losse observaties per locatie (plaats, moment, bewijstype, tags, inhoud)
- **Privacy guard**: client-side detectie van mogelijke persoonsnamen, kamernummers en geboortedatums

### B. 10 Thema's IJKKADER v5

Dashboard met 10 thema-tegels inclusief badge "Zwaar gewogen" bij thema's 2, 5, 6 en 10.

Per thema:
- Definitie (zelfgeformuleerd, 1-2 zinnen)
- 8 checkvragen met antwoord Ja/Deels/Nee/Onbekend
- Bewijsvelden: Positief / Negatief / Positief met kanttekening
- Bewonersstem (geanonimiseerd)
- Score selector 1.0–10.0 in stappen van 0.5 met scorelabels

### C. Methodische bewaking

**Gewogen scoring:** Zware thema's (2, 5, 6, 10) wegen 2× mee.

**Drempelregels:**

| Code | Regel |
|---|---|
| DR-A | Thema 6 < 3.0 → Fase 3 en 4 niet toegestaan |
| DR-B | Thema 2 én Thema 6 beiden < 3.0 → Eindscore maximaal 2.7 |
| DR-C | Thema 10 < 3.0 → Thema 5 en 6 begrensd op effectieve score 5.0 |

**Fasebepaling:**

| Fase | Scorerange |
|---|---|
| Fase 1 | < 4.0 – Basiskwaliteit onder druk |
| Fase 2 | 4.0 – 5.9 – Basiskwaliteit aanwezig |
| Fase 3 | 6.0 – 7.9 – Groeiende kwaliteit |
| Fase 4 | ≥ 8.0 – Uitstekend welzijnsniveau |

De UI toont altijd **ingevoerde score** én **effectieve score** wanneer een cap van toepassing is.

### D. BOM-module

Tab "BOM Observatie" met 5 secties (conceptueel conform BOM syllabus 2022):
1. Eerste indruk
2. Bewoner in de huiskamer
3. Werk-leefprocessen (24-uurs)
4. Bejegening en interactie
5. Voorafgaand aan onbegrepen gedrag

Per sectie: antwoorden, prikkelduiding (gunstig/ongunstig + toelichting), koppeling naar thema's.

**Participerend observeren:** veld "Wat deed de observeerder zelf?" + effect op bewoners.

**BOM conceptsuggesties** voor thema's 6 en 10 zijn altijd gelabeld als "Conceptsuggestie" en vereisen actieve bevestiging door de gebruiker.

### E. Hospitality quickscan

Checklist in 5 categorieën met bronlabel `Hospitality 01-2024`. Vult geen score automatisch, maar biedt **evidence-prompts** voor Thema 5 (Autonomie & Eigen Regie).

### F. Rapport & Export

- Staaf- of radardiagram met 10 thema-scores
- Overzicht zware thema's (fundament OK / kwetsbaar / niet ingevuld)
- Drempelregel-meldingen + uitleg caps
- Top-5 verbeteracties (prioriteit op zware thema's + BOM-prikkelpunten)
- **JSON export** van complete LocatieCheck inclusief BOM/Hospitality
- **PDF export** "Conceptevaluatie WelzijnCheck v5 + BOM" met:
  - Situatieoverzicht
  - Samenvatting per thema (max 3 bullets voor zware thema's, 1 bullet overige)
  - Scoretabel ingevoerd vs effectief
  - Fase + drempelregels
  - Top-5 verbeteracties
  - Concept-label op elke pagina (zolang status = concept)
  - Bronlabels onderaan (geen tekstquotes)

### G. Bronnenpagina

Lijst van 3 interne documenten met invulveld voor SharePoint-link of intern pad.

---

## Privacy

- Geen persoonsgegevens opslaan
- Geen echte namen, kamernummers of geboortedatums
- Client-side heuristiek waarschuwt bij mogelijke persoonsgegevens
- Gebruik altijd "bewoner X", "medewerker Y" of vergelijkbare anonieme aanduidingen

---

## Conceptlabel

Alle rapporten en exports krijgen automatisch het label **CONCEPT** zolang de LocatieCheck-status op "concept" staat. Wijzig naar "definitief" via de knop op de check-overzichtpagina.

---

## Licentie en verantwoordelijkheid

De app verzint niets: alle suggesties worden gelabeld als "Conceptsuggestie" en vereisen bevestiging door de gebruiker. De methodische bewaking (drempelregels, caps, fasebepaling) is geïmplementeerd conform de beschreven regels in de functionele eisen.
