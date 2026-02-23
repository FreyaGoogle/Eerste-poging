// Client-side privacy heuristiek: detecteer mogelijke persoonsnamen in tekst
// Gebaseerd op patroonherkenning; geen externe API's.

const DUTCH_TITLES = ["de heer", "dhr", "mevrouw", "mevr", "mvr", "dhr.", "mevr.", "dr.", "prof.", "mr.", "ir."];

// Bekende Nederlandstalige voornamen (eerste letters) – heuristisch
const VOORNAAM_PATRONEN = [
  /\b[A-Z][a-z]{2,12}\s+[A-Z][a-z]{2,12}\b/g, // Voornaam Achternaam (twee hoofdletterwoorden)
  /\b[A-Z][a-z]{2,12}\s+(?:van|de|den|der|ten|te|op|in|'t)\s+[A-Z][a-z]{2,12}\b/gi, // tussenvoegsel
];

const KAMER_PATROON = /\bkamer\s*\d+\b|\bapartement\s*\d+|\bnummer\s*\d+/gi;
const GEBOORTEDATUM_PATROON =
  /\b\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\b|\b\d{1,2}\s+(?:januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)\s+\d{4}\b/gi;

export interface PrivacyWaarschuwing {
  type: "mogelijke_naam" | "kamernummer" | "geboortedatum" | "titel_naam";
  gevonden: string;
  bericht: string;
}

export function detecteerPrivacyRisicos(tekst: string): PrivacyWaarschuwing[] {
  const waarschuwingen: PrivacyWaarschuwing[] = [];

  if (!tekst || tekst.trim().length < 3) return [];

  // Titel + naam patronen
  for (const titel of DUTCH_TITLES) {
    const regex = new RegExp(
      `\\b${titel.replace(".", "\\.")}\\s+[A-Z][a-z]{2,20}\\b`,
      "gi"
    );
    const matches = tekst.match(regex);
    if (matches) {
      for (const m of matches) {
        waarschuwingen.push({
          type: "titel_naam",
          gevonden: m,
          bericht: `Mogelijk persoonsnaam gevonden: "${m}". Vervang door "bewoner X" of "medewerker Y".`,
        });
      }
    }
  }

  // Twee woorden met hoofdletter (mogelijke voor- en achternaam)
  for (const patroon of VOORNAAM_PATRONEN) {
    const kopie = new RegExp(patroon.source, patroon.flags);
    let match: RegExpExecArray | null;
    while ((match = kopie.exec(tekst)) !== null) {
      const gevonden = match[0];
      // Filter gebruikelijke zinsstarters
      if (!isZinsstarter(gevonden)) {
        waarschuwingen.push({
          type: "mogelijke_naam",
          gevonden,
          bericht: `Mogelijke persoonsnaam: "${gevonden}". Gebruik anonieme aanduiding (bewoner X / medewerker Y).`,
        });
      }
    }
  }

  // Kamernummers
  const kamerMatches = tekst.match(KAMER_PATROON);
  if (kamerMatches) {
    for (const m of kamerMatches) {
      waarschuwingen.push({
        type: "kamernummer",
        gevonden: m,
        bericht: `Kamernummer gevonden: "${m}". Vermijd kamernummers om anonimiteit te bewaken.`,
      });
    }
  }

  // Geboortedatums
  const datumMatches = tekst.match(GEBOORTEDATUM_PATROON);
  if (datumMatches) {
    for (const m of datumMatches) {
      waarschuwingen.push({
        type: "geboortedatum",
        gevonden: m,
        bericht: `Mogelijke geboortedatum gevonden: "${m}". Verwijder persoonsgerelateerde datums.`,
      });
    }
  }

  // Dedupliceer
  const uniek = waarschuwingen.filter(
    (w, i, arr) =>
      arr.findIndex((x) => x.gevonden.toLowerCase() === w.gevonden.toLowerCase()) === i
  );

  return uniek;
}

// Woorden die normaal aan het begin van een zin staan, niet als naam worden herkend
const GEEN_NAAM_WOORDEN = [
  "De bewoner", "De medewerker", "Het team", "De familie", "De zorgverlener",
  "Het zorgplan", "De huiskamer", "De activiteit", "Het overleg",
];

function isZinsstarter(tekst: string): boolean {
  return GEEN_NAAM_WOORDEN.some(
    (w) => tekst.toLowerCase().startsWith(w.toLowerCase())
  );
}
