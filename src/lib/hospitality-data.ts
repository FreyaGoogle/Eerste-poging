// Hospitality quickscan – Categorieën en checklistitems
// Bronlabel: "Hospitality 01-2024"
// Items zijn zelfgeformuleerd, conceptueel passend bij het Hospitality boekje Domus Valuas jan 2024.

export interface HospitalityItem {
  id: string;
  omschrijving: string;
}

export interface HospitalityCategorie {
  id: string;
  naam: string;
  omschrijving: string;
  items: HospitalityItem[];
}

export const HOSPITALITY_CATEGORIEEN: HospitalityCategorie[] = [
  {
    id: "eerste_indruk",
    naam: "Eerste Indruk",
    omschrijving: "De eerste indruk bepaalt de toon voor het gehele bezoek. Let op ontvangst, uitstraling en sfeer.",
    items: [
      { id: "ei_1", omschrijving: "De entree is schoon, opgeruimd en uitnodigend." },
      { id: "ei_2", omschrijving: "Bezoekers worden actief begroet bij binnenkomst." },
      { id: "ei_3", omschrijving: "Er is duidelijke bewegwijzering voor bezoekers en bewoners." },
      { id: "ei_4", omschrijving: "De receptie of aanmeldplek is herkenbaar en bemand." },
      { id: "ei_5", omschrijving: "De sfeer in de hal/entree is warm en gastvrij." },
    ],
  },
  {
    id: "representativiteit",
    naam: "Representativiteit",
    omschrijving: "Het gebouw en de inrichting stralen kwaliteit en zorg uit.",
    items: [
      { id: "rep_1", omschrijving: "Gemeenschappelijke ruimten zijn schoon en goed onderhouden." },
      { id: "rep_2", omschrijving: "De inrichting is sfeervol, huiselijk en niet institutioneel." },
      { id: "rep_3", omschrijving: "Er is persoonlijke decoratie die aansluit op de doelgroep (seizoen, cultuur)." },
      { id: "rep_4", omschrijving: "Medewerkers zijn herkenbaar (naambordje, uniform) en verzorgd." },
      { id: "rep_5", omschrijving: "Geluidsomgeving is prettig (geen storende achtergrondgeluiden of televisie)." },
    ],
  },
  {
    id: "contactstijl",
    naam: "Contactstijl",
    omschrijving: "De manier waarop medewerkers contact maken met bewoners en bezoekers.",
    items: [
      { id: "cs_1", omschrijving: "Medewerkers maken actief oogcontact en glimlachen." },
      { id: "cs_2", omschrijving: "Gesprekken worden op ooghoogte gevoerd (bij zittende bewoners: bukken/hurken)." },
      { id: "cs_3", omschrijving: "Medewerkers spreken bewoners aan op de gewenste manier (voornaam/aanspreektitel)." },
      { id: "cs_4", omschrijving: "Er is ruimte voor small-talk en persoonlijk contact naast de taak." },
      { id: "cs_5", omschrijving: "Bij binnenkomst kloppen medewerkers aan en kondigen zichzelf aan." },
    ],
  },
  {
    id: "eten_drinken",
    naam: "Eten & Drinken",
    omschrijving: "De maaltijdbeleving als sociaal en zintuiglijk moment.",
    items: [
      { id: "ed_1", omschrijving: "Er is altijd een drankje beschikbaar voor bezoekers en bewoners." },
      { id: "ed_2", omschrijving: "Maaltijden worden aantrekkelijk gepresenteerd." },
      { id: "ed_3", omschrijving: "Bewoners krijgen keuzevrijheid in eten en drinken." },
      { id: "ed_4", omschrijving: "Er is aandacht voor individuele voedingswensen en -gewoonten." },
      { id: "ed_5", omschrijving: "De maaltijd is een sociaal moment: bewoners zitten samen, gesprekken vinden plaats." },
    ],
  },
  {
    id: "tafeletiquette",
    naam: "Tafeletiquette",
    omschrijving: "De tafelopmaak en het verloop van de maaltijd weerspiegelen respect en kwaliteit.",
    items: [
      { id: "te_1", omschrijving: "Tafels zijn netjes gedekt met schoon servies en tafelkleed/-runner." },
      { id: "te_2", omschrijving: "Bestekplaatsing is correct en passend voor de doelgroep." },
      { id: "te_3", omschrijving: "Eten wordt geserveerd in een rustig tempo, afgestemd op de bewoner." },
      { id: "te_4", omschrijving: "Hulp bij eten wordt discreet en respectvol geboden." },
      { id: "te_5", omschrijving: "Na de maaltijd wordt afgeruimd en de ruimte wordt netjes achtergelaten." },
    ],
  },
];

export function getHospitaliteitsCategorie(id: string): HospitalityCategorie | undefined {
  return HOSPITALITY_CATEGORIEEN.find((c) => c.id === id);
}

// Evidence prompts voor thema 5 (Autonomie & Eigen Regie)
export const THEMA5_EVIDENCE_PROMPTS: string[] = [
  "Bewoners krijgen keuzevrijheid in maaltijden en dranken (zie: Eten & Drinken).",
  "Gesprekken worden op gelijkwaardige wijze gevoerd (zie: Contactstijl).",
  "Bewoners worden aangesproken op de wijze die zij prefereren (zie: Contactstijl).",
  "Hulp bij maaltijd wordt discreet en respectvol geboden zonder bevoogding (zie: Tafeletiquette).",
];
