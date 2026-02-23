import { detecteerPrivacyRisicos } from "../src/lib/privacy";

describe("detecteerPrivacyRisicos", () => {
  it("geeft lege array voor lege tekst", () => {
    expect(detecteerPrivacyRisicos("")).toHaveLength(0);
    expect(detecteerPrivacyRisicos("   ")).toHaveLength(0);
  });

  it("geeft lege array voor neutrale tekst", () => {
    const tekst = "De bewoner zat rustig in de huiskamer en keek naar buiten.";
    expect(detecteerPrivacyRisicos(tekst)).toHaveLength(0);
  });

  it("detecteert kamernummer", () => {
    const tekst = "Bewoner in kamer 12 was onrustig.";
    const warnings = detecteerPrivacyRisicos(tekst);
    expect(warnings.some((w) => w.type === "kamernummer")).toBe(true);
  });

  it("detecteert dhr. + naam als titel-naam combinatie", () => {
    const tekst = "dhr. Jansen was aanwezig bij de activiteit.";
    const warnings = detecteerPrivacyRisicos(tekst);
    expect(warnings.some((w) => w.type === "titel_naam")).toBe(true);
  });

  it("detecteert mevrouw + naam", () => {
    const tekst = "Mevrouw Pietersen vroeg om hulp.";
    const warnings = detecteerPrivacyRisicos(tekst);
    expect(warnings.some((w) => w.type === "titel_naam")).toBe(true);
  });

  it("detecteert geboortedatum formaat dd-mm-jjjj", () => {
    const tekst = "Bewoner geboren op 12-04-1942.";
    const warnings = detecteerPrivacyRisicos(tekst);
    expect(warnings.some((w) => w.type === "geboortedatum")).toBe(true);
  });

  it("detecteert geboortedatum formaat dd/mm/jjjj", () => {
    const tekst = "Geboortedatum: 05/11/1938.";
    const warnings = detecteerPrivacyRisicos(tekst);
    expect(warnings.some((w) => w.type === "geboortedatum")).toBe(true);
  });

  it("retourneert unieke waarschuwingen (geen duplicaten)", () => {
    const tekst = "dhr. Jansen dhr. Jansen";
    const warnings = detecteerPrivacyRisicos(tekst);
    const gevonden = warnings.map((w) => w.gevonden.toLowerCase());
    const uniek = [...new Set(gevonden)];
    expect(gevonden).toHaveLength(uniek.length);
  });

  it("waarschuwingen bevatten een bericht", () => {
    const tekst = "kamer 7 was leeg.";
    const warnings = detecteerPrivacyRisicos(tekst);
    expect(warnings.length).toBeGreaterThan(0);
    warnings.forEach((w) => {
      expect(w.bericht).toBeTruthy();
      expect(typeof w.bericht).toBe("string");
    });
  });
});
