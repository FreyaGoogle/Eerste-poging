// Scoreberekening voor WelzijnCheck v5
// Gewogen totaalscore + drempelregels + fasebepaling + cap-logica

import { ZWARE_THEMAS } from "./themes";

export type ScoreInput = {
  themaId: number;
  ingevoerdeScore: number; // 0 = niet ingevuld, anders 1.0 - 10.0
};

export type EffectieveScore = {
  themaId: number;
  ingevoerdeScore: number;
  effectieveScore: number;
  isCapped: boolean;
  capReden?: string;
};

export type DrempelRegel = {
  code: string;
  beschrijving: string;
  actief: boolean;
};

export type ScoreResultaat = {
  effectieveScores: EffectieveScore[];
  gewogenTotaalScore: number | null; // null als niet genoeg thema's ingevuld
  fase: 1 | 2 | 3 | 4 | null;
  drempelregels: DrempelRegel[];
  zwareFundering: {
    themaId: number;
    score: number | null;
    status: "fundament_ok" | "kwetsbaar" | "niet_ingevuld";
  }[];
};

// ─── Gewichten ────────────────────────────────────────────────────────────────

function gewicht(themaId: number): number {
  return ZWARE_THEMAS.includes(themaId) ? 2 : 1;
}

// ─── Caps (drempelregels) ─────────────────────────────────────────────────────

/**
 * Pas caps toe op de ingevoerde scores.
 * Returns een array van effectieve scores met cap-informatie.
 */
export function berekenEffectieveScores(invoer: ScoreInput[]): EffectieveScore[] {
  const scoreMap = new Map<number, number>(invoer.map((s) => [s.themaId, s.ingevoerdeScore]));

  function getScore(id: number): number {
    return scoreMap.get(id) ?? 0;
  }

  const thema6Score = getScore(6);
  const thema2Score = getScore(2);
  const thema10Score = getScore(10);

  const resultaat: EffectieveScore[] = [];

  for (const item of invoer) {
    let effectief = item.ingevoerdeScore;
    let isCapped = false;
    let capReden: string | undefined;

    if (item.ingevoerdeScore === 0) {
      // Niet ingevuld – geen cap toepassen
      resultaat.push({ themaId: item.themaId, ingevoerdeScore: 0, effectieveScore: 0, isCapped: false });
      continue;
    }

    // Drempelregel c: Thema 10 < 3.0 → cap op thema 5 en 6 (max 5.0)
    if (thema10Score > 0 && thema10Score < 3.0) {
      if (item.themaId === 5 || item.themaId === 6) {
        const cap = 5.0;
        if (effectief > cap) {
          effectief = cap;
          isCapped = true;
          capReden = `Thema 10 (Houding & Bejegening) scoort < 3.0 (${thema10Score}). ` +
            `Thema ${item.themaId} wordt begrensd op ${cap}.`;
        }
      }
    }

    resultaat.push({ themaId: item.themaId, ingevoerdeScore: item.ingevoerdeScore, effectieveScore: effectief, isCapped, capReden });
  }

  return resultaat;
}

// ─── Drempelregels ────────────────────────────────────────────────────────────

export function berekenDrempelRegels(invoer: ScoreInput[]): DrempelRegel[] {
  const scoreMap = new Map<number, number>(invoer.map((s) => [s.themaId, s.ingevoerdeScore]));

  function getScore(id: number): number {
    return scoreMap.get(id) ?? 0;
  }

  const thema6Score = getScore(6);
  const thema2Score = getScore(2);
  const thema10Score = getScore(10);

  const regels: DrempelRegel[] = [
    {
      code: "DR-A",
      beschrijving: `Drempelregel A: Thema 6 (Veiligheid & Vertrouwen) < 3.0 → Fase 3 en 4 zijn NIET toegestaan.`,
      actief: thema6Score > 0 && thema6Score < 3.0,
    },
    {
      code: "DR-B",
      beschrijving:
        `Drempelregel B: Thema 2 (Zingeving) én Thema 6 (Veiligheid) zijn beiden < 3.0 → ` +
        `Eindscore maximaal 2.7 totdat beide minimaal 4.0 scoren.`,
      actief: thema2Score > 0 && thema6Score > 0 && thema2Score < 3.0 && thema6Score < 3.0,
    },
    {
      code: "DR-C",
      beschrijving:
        `Drempelregel C: Thema 10 (Houding & Bejegening) < 3.0 → ` +
        `Effectieve scores van Thema 5 en 6 worden begrensd op 5.0.`,
      actief: thema10Score > 0 && thema10Score < 3.0,
    },
  ];

  return regels;
}

// ─── Fasebepaling ─────────────────────────────────────────────────────────────

/**
 * Bepaal de fase (1-4) op basis van de gewogen totaalscore en drempelregels.
 * Fase 3 en 4 zijn geblokkeerd als DR-A actief is.
 */
export function bepaalFase(
  gewogenScore: number | null,
  drempelregels: DrempelRegel[]
): 1 | 2 | 3 | 4 | null {
  if (gewogenScore === null) return null;

  const drAActief = drempelregels.find((d) => d.code === "DR-A")?.actief ?? false;

  let fase: 1 | 2 | 3 | 4;

  if (gewogenScore < 4.0) {
    fase = 1;
  } else if (gewogenScore < 6.0) {
    fase = 2;
  } else if (gewogenScore < 8.0) {
    fase = 3;
  } else {
    fase = 4;
  }

  // Drempelregel A blokkeert fase 3 en 4
  if (drAActief && fase >= 3) {
    fase = 2;
  }

  return fase;
}

export const FASE_LABELS: Record<number, string> = {
  1: "Fase 1 – Basiskwaliteit onder druk",
  2: "Fase 2 – Basiskwaliteit aanwezig",
  3: "Fase 3 – Groeiende kwaliteit",
  4: "Fase 4 – Uitstekend welzijnsniveau",
};

// ─── Gewogen totaalscore ──────────────────────────────────────────────────────

/**
 * Bereken gewogen totaalscore over alle ingevulde thema's.
 * Zwaar gewogen thema's tellen 2x mee.
 * Retourneert null als geen enkel thema ingevuld is.
 * Past DR-B cap toe (max 2.7 als beide thema 2 en 6 < 3.0).
 */
export function berekenGewogenTotaal(
  effectieveScores: EffectieveScore[],
  drempelregels: DrempelRegel[]
): number | null {
  const ingevuld = effectieveScores.filter((s) => s.ingevoerdeScore > 0);
  if (ingevuld.length === 0) return null;

  let gewogenSom = 0;
  let gewogenTeller = 0;

  for (const s of ingevuld) {
    const w = gewicht(s.themaId);
    gewogenSom += s.effectieveScore * w;
    gewogenTeller += w;
  }

  let totaal = Math.round((gewogenSom / gewogenTeller) * 10) / 10;

  // Drempelregel B: cap op 2.7
  const drBActief = drempelregels.find((d) => d.code === "DR-B")?.actief ?? false;
  if (drBActief && totaal > 2.7) {
    totaal = 2.7;
  }

  return totaal;
}

// ─── Zware fundering status ───────────────────────────────────────────────────

export function berekenZwareFundering(
  invoer: ScoreInput[]
): { themaId: number; score: number | null; status: "fundament_ok" | "kwetsbaar" | "niet_ingevuld" }[] {
  const ZWARE = [2, 5, 6, 10];
  return ZWARE.map((id) => {
    const item = invoer.find((s) => s.themaId === id);
    if (!item || item.ingevoerdeScore === 0) {
      return { themaId: id, score: null, status: "niet_ingevuld" as const };
    }
    const status: "fundament_ok" | "kwetsbaar" = item.ingevoerdeScore >= 5.0 ? "fundament_ok" : "kwetsbaar";
    return { themaId: id, score: item.ingevoerdeScore, status };
  });
}

// ─── Alles-in-één berekening ──────────────────────────────────────────────────

export function berekenScoreResultaat(invoer: ScoreInput[]): ScoreResultaat {
  const effectieveScores = berekenEffectieveScores(invoer);
  const drempelregels = berekenDrempelRegels(invoer);
  const gewogenTotaal = berekenGewogenTotaal(effectieveScores, drempelregels);
  const fase = bepaalFase(gewogenTotaal, drempelregels);
  const zwareFundering = berekenZwareFundering(invoer);

  return {
    effectieveScores,
    gewogenTotaalScore: gewogenTotaal,
    fase,
    drempelregels,
    zwareFundering,
  };
}

// ─── Score labels ─────────────────────────────────────────────────────────────

export function getScoreLabel(score: number): string {
  if (score === 0) return "Niet ingevuld";
  if (score <= 1.0) return "1.0 – Zeer onvoldoende";
  if (score <= 2.0) return "2.0 – Onvoldoende";
  if (score <= 3.0) return "3.0 – Zwak";
  if (score <= 4.0) return "4.0 – Matig";
  if (score <= 5.0) return "5.0 – Voldoende";
  if (score <= 6.0) return "6.0 – Ruim voldoende";
  if (score <= 7.0) return "7.0 – Goed";
  if (score <= 8.0) return "8.0 – Ruim goed";
  if (score <= 9.0) return "9.0 – Zeer goed";
  return "10.0 – Uitstekend";
}

export const SCORE_STAPPEN = Array.from({ length: 19 }, (_, i) => 1.0 + i * 0.5);
// [1.0, 1.5, 2.0, ..., 10.0]
