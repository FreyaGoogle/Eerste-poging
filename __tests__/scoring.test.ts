import {
  berekenEffectieveScores,
  berekenDrempelRegels,
  berekenGewogenTotaal,
  bepaalFase,
  berekenZwareFundering,
  berekenScoreResultaat,
  SCORE_STAPPEN,
  type ScoreInput,
} from "../src/lib/scoring";

// ─── Helper ───────────────────────────────────────────────────────────────────

function scores(overrides: Partial<Record<number, number>>): ScoreInput[] {
  // Build all 10 themas with default score 0 (not filled) unless overridden
  return Array.from({ length: 10 }, (_, i) => i + 1).map((id) => ({
    themaId: id,
    ingevoerdeScore: overrides[id] ?? 0,
  }));
}

// ─── SCORE_STAPPEN ────────────────────────────────────────────────────────────

describe("SCORE_STAPPEN", () => {
  it("bevat 19 stappen van 1.0 tot 10.0", () => {
    expect(SCORE_STAPPEN).toHaveLength(19);
    expect(SCORE_STAPPEN[0]).toBe(1.0);
    expect(SCORE_STAPPEN[18]).toBe(10.0);
  });

  it("elk stap is 0.5 hoger dan de vorige", () => {
    for (let i = 1; i < SCORE_STAPPEN.length; i++) {
      expect(SCORE_STAPPEN[i] - SCORE_STAPPEN[i - 1]).toBeCloseTo(0.5);
    }
  });
});

// ─── berekenDrempelRegels ─────────────────────────────────────────────────────

describe("berekenDrempelRegels", () => {
  it("geen actieve regels als alle scores OK", () => {
    const invoer = scores({ 2: 5.0, 6: 5.0, 10: 5.0 });
    const regels = berekenDrempelRegels(invoer);
    expect(regels.every((r) => !r.actief)).toBe(true);
  });

  it("DR-A actief als thema 6 < 3.0", () => {
    const invoer = scores({ 6: 2.5 });
    const regels = berekenDrempelRegels(invoer);
    const drA = regels.find((r) => r.code === "DR-A");
    expect(drA?.actief).toBe(true);
  });

  it("DR-A NIET actief als thema 6 precies 3.0", () => {
    const invoer = scores({ 6: 3.0 });
    const regels = berekenDrempelRegels(invoer);
    const drA = regels.find((r) => r.code === "DR-A");
    expect(drA?.actief).toBe(false);
  });

  it("DR-A NIET actief als thema 6 niet ingevuld (score 0)", () => {
    const invoer = scores({}); // alle 0
    const regels = berekenDrempelRegels(invoer);
    const drA = regels.find((r) => r.code === "DR-A");
    expect(drA?.actief).toBe(false);
  });

  it("DR-B actief als thema 2 EN thema 6 beiden < 3.0", () => {
    const invoer = scores({ 2: 2.0, 6: 2.5 });
    const regels = berekenDrempelRegels(invoer);
    const drB = regels.find((r) => r.code === "DR-B");
    expect(drB?.actief).toBe(true);
  });

  it("DR-B NIET actief als alleen thema 2 < 3.0 maar thema 6 >= 3.0", () => {
    const invoer = scores({ 2: 2.0, 6: 4.0 });
    const regels = berekenDrempelRegels(invoer);
    const drB = regels.find((r) => r.code === "DR-B");
    expect(drB?.actief).toBe(false);
  });

  it("DR-C actief als thema 10 < 3.0", () => {
    const invoer = scores({ 10: 2.0 });
    const regels = berekenDrempelRegels(invoer);
    const drC = regels.find((r) => r.code === "DR-C");
    expect(drC?.actief).toBe(true);
  });

  it("DR-C NIET actief als thema 10 niet ingevuld", () => {
    const invoer = scores({});
    const regels = berekenDrempelRegels(invoer);
    const drC = regels.find((r) => r.code === "DR-C");
    expect(drC?.actief).toBe(false);
  });
});

// ─── berekenEffectieveScores ──────────────────────────────────────────────────

describe("berekenEffectieveScores", () => {
  it("geen cap als thema 10 >= 3.0", () => {
    const invoer = scores({ 5: 8.0, 6: 7.0, 10: 5.0 });
    const effectief = berekenEffectieveScores(invoer);
    const t5 = effectief.find((e) => e.themaId === 5)!;
    const t6 = effectief.find((e) => e.themaId === 6)!;
    expect(t5.isCapped).toBe(false);
    expect(t5.effectieveScore).toBe(8.0);
    expect(t6.isCapped).toBe(false);
    expect(t6.effectieveScore).toBe(7.0);
  });

  it("DR-C cap op thema 5 en 6 als thema 10 < 3.0", () => {
    const invoer = scores({ 5: 8.0, 6: 7.0, 10: 2.5 });
    const effectief = berekenEffectieveScores(invoer);
    const t5 = effectief.find((e) => e.themaId === 5)!;
    const t6 = effectief.find((e) => e.themaId === 6)!;
    expect(t5.isCapped).toBe(true);
    expect(t5.effectieveScore).toBe(5.0);
    expect(t6.isCapped).toBe(true);
    expect(t6.effectieveScore).toBe(5.0);
  });

  it("DR-C: thema 5 en 6 onder de cap worden NIET gecapt", () => {
    const invoer = scores({ 5: 4.0, 6: 3.5, 10: 1.0 });
    const effectief = berekenEffectieveScores(invoer);
    const t5 = effectief.find((e) => e.themaId === 5)!;
    const t6 = effectief.find((e) => e.themaId === 6)!;
    // Under cap: isCapped remains false
    expect(t5.isCapped).toBe(false);
    expect(t5.effectieveScore).toBe(4.0);
    expect(t6.isCapped).toBe(false);
    expect(t6.effectieveScore).toBe(3.5);
  });

  it("scores van 0 worden niet gecapt en niet meegenomen", () => {
    const invoer = scores({ 10: 1.0 }); // rest is 0
    const effectief = berekenEffectieveScores(invoer);
    const t5 = effectief.find((e) => e.themaId === 5)!;
    expect(t5.ingevoerdeScore).toBe(0);
    expect(t5.isCapped).toBe(false);
  });
});

// ─── berekenGewogenTotaal ─────────────────────────────────────────────────────

describe("berekenGewogenTotaal", () => {
  it("retourneert null als niets ingevuld", () => {
    const invoer = scores({});
    const effectief = berekenEffectieveScores(invoer);
    const drempel = berekenDrempelRegels(invoer);
    expect(berekenGewogenTotaal(effectief, drempel)).toBeNull();
  });

  it("berekent gewogen gemiddelde correct (zwaar 2x)", () => {
    // T1 (normaal, 1x) = 6.0, T2 (zwaar, 2x) = 4.0
    // gewogen: (6.0*1 + 4.0*2) / (1+2) = 14/3 ≈ 4.67
    const invoer = scores({ 1: 6.0, 2: 4.0 });
    const effectief = berekenEffectieveScores(invoer);
    const drempel = berekenDrempelRegels(invoer);
    const totaal = berekenGewogenTotaal(effectief, drempel);
    expect(totaal).toBeCloseTo(4.7, 1);
  });

  it("DR-B cap: eindscore maximaal 2.7 als T2 en T6 beiden < 3.0", () => {
    const invoer = scores({ 2: 2.0, 6: 2.0, 1: 8.0 });
    // Without cap: (8*1 + 2*2 + 2*2) / (1+2+2) = 20/5 = 4.0 -> capped to 2.7
    const effectief = berekenEffectieveScores(invoer);
    const drempel = berekenDrempelRegels(invoer);
    expect(drempel.find((d) => d.code === "DR-B")?.actief).toBe(true);
    const totaal = berekenGewogenTotaal(effectief, drempel);
    expect(totaal).toBe(2.7);
  });

  it("alle zware thema's tellen 2x mee", () => {
    // T2=5, T5=5, T6=5, T10=5 (all zwaar), T1=5 (normaal)
    // gewogen: (5*1 + 5*2 + 5*2 + 5*2 + 5*2) / (1+2+2+2+2) = 45/9 = 5.0
    const invoer = scores({ 1: 5.0, 2: 5.0, 5: 5.0, 6: 5.0, 10: 5.0 });
    const effectief = berekenEffectieveScores(invoer);
    const drempel = berekenDrempelRegels(invoer);
    const totaal = berekenGewogenTotaal(effectief, drempel);
    expect(totaal).toBe(5.0);
  });
});

// ─── bepaalFase ───────────────────────────────────────────────────────────────

describe("bepaalFase", () => {
  it("retourneert null als geen score", () => {
    expect(bepaalFase(null, [])).toBeNull();
  });

  it("Fase 1 bij score < 4.0", () => {
    const dr = berekenDrempelRegels(scores({}));
    expect(bepaalFase(3.5, dr)).toBe(1);
  });

  it("Fase 2 bij score 4.0 - 5.9", () => {
    const dr = berekenDrempelRegels(scores({}));
    expect(bepaalFase(5.5, dr)).toBe(2);
  });

  it("Fase 3 bij score 6.0 - 7.9", () => {
    const dr = berekenDrempelRegels(scores({}));
    expect(bepaalFase(7.0, dr)).toBe(3);
  });

  it("Fase 4 bij score >= 8.0", () => {
    const dr = berekenDrempelRegels(scores({}));
    expect(bepaalFase(9.0, dr)).toBe(4);
  });

  it("DR-A blokkeert fase 3: score 7.0 met T6 < 3.0 wordt fase 2", () => {
    const invoer = scores({ 6: 2.0 });
    const dr = berekenDrempelRegels(invoer);
    expect(dr.find((d) => d.code === "DR-A")?.actief).toBe(true);
    expect(bepaalFase(7.0, dr)).toBe(2);
  });

  it("DR-A blokkeert fase 4: score 9.0 met T6 < 3.0 wordt fase 2", () => {
    const invoer = scores({ 6: 1.0 });
    const dr = berekenDrempelRegels(invoer);
    expect(bepaalFase(9.0, dr)).toBe(2);
  });

  it("DR-A NIET actief: fase 3 en 4 gewoon mogelijk", () => {
    const invoer = scores({ 6: 7.0 });
    const dr = berekenDrempelRegels(invoer);
    expect(bepaalFase(7.0, dr)).toBe(3);
    expect(bepaalFase(8.5, dr)).toBe(4);
  });
});

// ─── berekenZwareFundering ────────────────────────────────────────────────────

describe("berekenZwareFundering", () => {
  it("geeft 4 items terug (T2, T5, T6, T10)", () => {
    const result = berekenZwareFundering(scores({}));
    expect(result).toHaveLength(4);
    expect(result.map((r) => r.themaId)).toEqual([2, 5, 6, 10]);
  });

  it("status fundament_ok bij score >= 5.0", () => {
    const result = berekenZwareFundering(scores({ 2: 5.0, 5: 7.0, 6: 6.0, 10: 8.0 }));
    expect(result.every((r) => r.status === "fundament_ok")).toBe(true);
  });

  it("status kwetsbaar bij score < 5.0", () => {
    const result = berekenZwareFundering(scores({ 2: 4.5, 5: 3.0, 6: 2.0, 10: 4.9 }));
    expect(result.every((r) => r.status === "kwetsbaar")).toBe(true);
  });

  it("status niet_ingevuld bij score 0", () => {
    const result = berekenZwareFundering(scores({}));
    expect(result.every((r) => r.status === "niet_ingevuld")).toBe(true);
  });
});

// ─── berekenScoreResultaat (integratie) ───────────────────────────────────────

describe("berekenScoreResultaat (integratie)", () => {
  it("volledig resultaat voor happy path", () => {
    const invoer = scores({ 1: 7.0, 2: 6.5, 3: 8.0, 5: 7.0, 6: 7.5, 10: 8.0 });
    const resultaat = berekenScoreResultaat(invoer);

    expect(resultaat.gewogenTotaalScore).not.toBeNull();
    expect(resultaat.fase).toBe(3); // ~7.x -> fase 3
    expect(resultaat.drempelregels.every((d) => !d.actief)).toBe(true);
    expect(resultaat.zwareFundering.filter((z) => z.status === "fundament_ok")).toHaveLength(4);
    // T4, T7, T8, T9 not filled -> effectieve score 0 and not capped
    const t4 = resultaat.effectieveScores.find((e) => e.themaId === 4);
    expect(t4?.ingevoerdeScore).toBe(0);
    expect(t4?.isCapped).toBe(false);
  });

  it("gecombineerd effect: DR-A + DR-C", () => {
    // T6 = 2.0 (activeert DR-A) + T10 = 2.0 (activeert DR-C, cap op T5 en T6)
    const invoer = scores({ 1: 9.0, 2: 8.0, 5: 9.0, 6: 2.0, 10: 2.0 });
    const resultaat = berekenScoreResultaat(invoer);

    const drA = resultaat.drempelregels.find((d) => d.code === "DR-A");
    const drC = resultaat.drempelregels.find((d) => d.code === "DR-C");
    expect(drA?.actief).toBe(true);
    expect(drC?.actief).toBe(true);

    const t5eff = resultaat.effectieveScores.find((e) => e.themaId === 5)!;
    expect(t5eff.isCapped).toBe(true);
    expect(t5eff.effectieveScore).toBe(5.0);

    // Fase capped by DR-A
    expect(resultaat.fase).toBeLessThanOrEqual(2);
  });

  it("empty invoer retourneert score null en fase null", () => {
    const invoer = scores({});
    const resultaat = berekenScoreResultaat(invoer);
    expect(resultaat.gewogenTotaalScore).toBeNull();
    expect(resultaat.fase).toBeNull();
  });
});
