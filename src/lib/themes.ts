// IJKKADER Welzijn in Beeld v5 – 10 thema's (zelfgeformuleerde definities en checkvragen)
// Bronlabel: "IJKKADER v5"

export interface CheckVraag {
  id: string;
  vraag: string;
}

export interface Thema {
  id: number;
  naam: string;
  definitie: string; // 1-2 zinnen, zelfgeformuleerd
  zwaarGewogen: boolean; // thema's 2, 5, 6, 10
  bronLabel: string;
  checkVragen: CheckVraag[]; // 8 stuks
}

export const THEMAS: Thema[] = [
  {
    id: 1,
    naam: "Identiteit & Levensverhaal",
    definitie:
      "Elke bewoner wordt gezien als uniek persoon met een eigen levensgeschiedenis. " +
      "Medewerkers kennen het verhaal achter de bewoner en sluiten hier actief op aan in de dagelijkse zorg.",
    zwaarGewogen: false,
    bronLabel: "IJKKADER v5",
    checkVragen: [
      { id: "1_1", vraag: "Is er een actueel en persoonlijk levensverhaal beschikbaar voor elke bewoner?" },
      { id: "1_2", vraag: "Gebruikt het team kennis van het levensverhaal aantoonbaar in de dagelijkse omgang?" },
      { id: "1_3", vraag: "Worden persoonlijke voorwerpen en symbolen van de bewoner gerespecteerd en zichtbaar gemaakt?" },
      { id: "1_4", vraag: "Worden familieleden actief betrokken bij het ophalen van achtergrondverhalen?" },
      { id: "1_5", vraag: "Is er aandacht voor culturele en religieuze achtergrond in de dagelijkse praktijk?" },
      { id: "1_6", vraag: "Worden vroegere beroepen, rollen en gewoonten herkend en gehonoreerd?" },
      { id: "1_7", vraag: "Sluit het activiteitenaanbod aan op de persoonlijke interesses uit het levensverhaal?" },
      { id: "1_8", vraag: "Worden nieuwe medewerkers en vrijwilligers geïntroduceerd aan het levensverhaal?" },
    ],
  },
  {
    id: 2,
    naam: "Zingeving & Betekenis",
    definitie:
      "Bewoners ervaren dat hun bestaan er toe doet en dat dagelijkse activiteiten betekenisvol zijn. " +
      "De locatie biedt structureel ruimte voor spiritualiteit, rituelen en existentiële gesprekken.",
    zwaarGewogen: true,
    bronLabel: "IJKKADER v5",
    checkVragen: [
      { id: "2_1", vraag: "Is er een aanbod van zingevingsactiviteiten afgestemd op diverse achtergronden?" },
      { id: "2_2", vraag: "Wordt aandacht besteed aan rituelen rondom geboorte, verjaardag, rouw en overlijden?" },
      { id: "2_3", vraag: "Kunnen bewoners religieuze of spirituele praktijken vrijelijk uitoefenen?" },
      { id: "2_4", vraag: "Is er beschikbaarheid van een geestelijk verzorger of vergelijkbare ondersteuning?" },
      { id: "2_5", vraag: "Voelen bewoners dat zij bijdragen aan de gemeenschap binnen de locatie?" },
      { id: "2_6", vraag: "Is er bewuste aandacht voor het omgaan met verlies (gezondheid, naasten, zelfstandigheid)?" },
      { id: "2_7", vraag: "Worden kleine rituelen en gewoonten (ochtendroutines, avondgebed) gerespecteerd?" },
      { id: "2_8", vraag: "Reflecteren medewerkers op eigen waarden in relatie tot zingeving van bewoners?" },
    ],
  },
  {
    id: 3,
    naam: "Sociale Relaties & Netwerk",
    definitie:
      "Bewoners onderhouden en ontwikkelen sociale contacten, zowel binnen als buiten de locatie. " +
      "De organisatie faciliteert actief dat relaties worden bewaard en nieuwe ontstaan.",
    zwaarGewogen: false,
    bronLabel: "IJKKADER v5",
    checkVragen: [
      { id: "3_1", vraag: "Worden bezoeken van familie en vrienden actief gefaciliteerd en verwelkomd?" },
      { id: "3_2", vraag: "Is er aandacht voor bewoners die weinig bezoek ontvangen (risico op isolement)?" },
      { id: "3_3", vraag: "Biedt de locatie gelegenheid voor onderlinge ontmoeting tussen bewoners?" },
      { id: "3_4", vraag: "Worden contacten met de buurt en maatschappij gestimuleerd?" },
      { id: "3_5", vraag: "Wordt de sociale kaart van de bewoner regelmatig met hem/haar besproken?" },
      { id: "3_6", vraag: "Zijn er vrijwilligers actief voor sociaal contact met geïsoleerde bewoners?" },
      { id: "3_7", vraag: "Worden relaties en vriendschappen tussen bewoners onderling gezien en ondersteund?" },
      { id: "3_8", vraag: "Wordt digitale communicatie (video-bellen, e-mail) ondersteund voor bewoners die dat willen?" },
    ],
  },
  {
    id: 4,
    naam: "Welbevinden & Stemming",
    definitie:
      "Het dagelijks welbevinden van bewoners is zichtbaar positief of wordt actief bewaakt. " +
      "Signalen van ongemak, angst of verdriet worden tijdig herkend en bespreekbaar gemaakt.",
    zwaarGewogen: false,
    bronLabel: "IJKKADER v5",
    checkVragen: [
      { id: "4_1", vraag: "Wordt het welbevinden van bewoners systematisch geobserveerd en gedocumenteerd?" },
      { id: "4_2", vraag: "Is er een methodiek voor het signaleren van pijn en ongemak, ook bij beperkte communicatie?" },
      { id: "4_3", vraag: "Voelen bewoners zich vrij om negatieve gevoelens te uiten zonder negatieve reacties?" },
      { id: "4_4", vraag: "Zijn er voldoende momenten van positief contact, plezier en humor in de dag?" },
      { id: "4_5", vraag: "Wordt structurele neerslachtigheid herkend en bespreekbaar gemaakt met behandelaar?" },
      { id: "4_6", vraag: "Zijn medewerkers getraind in het herkennen van non-verbale stemmingssignalen?" },
      { id: "4_7", vraag: "Is er terugkoppeling naar bewoner/familie na signalering van verminderd welbevinden?" },
      { id: "4_8", vraag: "Sluit het omgevingsontwerp aan op welbevinden (rust, licht, geuren, geluid)?" },
    ],
  },
  {
    id: 5,
    naam: "Autonomie & Eigen Regie",
    definitie:
      "Bewoners maken zoveel mogelijk zelf beslissingen over hun dagelijks leven. " +
      "De zorgverlening vertrekt vanuit 'wat wil de bewoner?' en niet vanuit het zorgaanbod.",
    zwaarGewogen: true,
    bronLabel: "IJKKADER v5",
    checkVragen: [
      { id: "5_1", vraag: "Kunnen bewoners zelf bepalen wanneer zij opstaan, slapen en maaltijden gebruiken?" },
      { id: "5_2", vraag: "Worden keuzes over dagbesteding, kleding en vrijetijdsbesteding gerespecteerd?" },
      { id: "5_3", vraag: "Is het zorgplan opgesteld vanuit de wensen en doelen van de bewoner zelf?" },
      { id: "5_4", vraag: "Wordt een 'nee' van een bewoner serieus genomen en gedocumenteerd?" },
      { id: "5_5", vraag: "Zijn er procedures voor besluitvorming bij bewoners met verminderd cognitief vermogen?" },
      { id: "5_6", vraag: "Worden mantelzorgers betrokken op basis van de wens van de bewoner?" },
      { id: "5_7", vraag: "Is er keuzevrijheid in maaltijden, activiteiten en bezoektijden?" },
      { id: "5_8", vraag: "Worden afspraken over regie bij toenemende zorgbehoefte tijdig herzien?" },
    ],
  },
  {
    id: 6,
    naam: "Veiligheid & Vertrouwen",
    definitie:
      "Bewoners voelen zich fysiek en emotioneel veilig. " +
      "Er is een cultuur van openheid, waarbij signalen van onveiligheid (ook subtiel) serieus worden opgepakt.",
    zwaarGewogen: true,
    bronLabel: "IJKKADER v5",
    checkVragen: [
      { id: "6_1", vraag: "Voelen bewoners zich veilig in hun omgeving, ook 's nachts?" },
      { id: "6_2", vraag: "Is er een laagdrempelig meldpunt voor (ervaren) onveiligheid voor bewoners én familie?" },
      { id: "6_3", vraag: "Worden vrijheidsbeperkende interventies minimaal toegepast en goed gedocumenteerd?" },
      { id: "6_4", vraag: "Is het team getraind in het herkennen van tekenen van onveiligheidsbeleving?" },
      { id: "6_5", vraag: "Is er een cultuur van openheid over fouten, incidenten en bijnasituaties?" },
      { id: "6_6", vraag: "Worden bewoners en families tijdig en eerlijk geïnformeerd bij incidenten?" },
      { id: "6_7", vraag: "Is er aandacht voor het voorkomen van medicatiefouten en valrisico's?" },
      { id: "6_8", vraag: "Zijn er duidelijke protocollen voor grensoverschrijdend gedrag (tussen bewoners, of door medewerkers)?" },
    ],
  },
  {
    id: 7,
    naam: "Dagstructuur & Activiteiten",
    definitie:
      "De dag kent een herkenbare en zinvolle structuur die aansluit bij de behoeften en mogelijkheden van bewoners. " +
      "Activiteiten worden afgestemd op de doelgroep en individuele mogelijkheden.",
    zwaarGewogen: false,
    bronLabel: "IJKKADER v5",
    checkVragen: [
      { id: "7_1", vraag: "Is er een gevarieerd en betekenisvol activiteitenprogramma?" },
      { id: "7_2", vraag: "Sluit de dagstructuur aan op de biologische ritmes en voorkeuren van bewoners?" },
      { id: "7_3", vraag: "Zijn er activiteiten op verschillende cognitieve en fysieke niveaus beschikbaar?" },
      { id: "7_4", vraag: "Is er ruimte voor spontane en informele activiteiten naast het programma?" },
      { id: "7_5", vraag: "Worden seizoenen, feestdagen en persoonlijke mijlpalen gevierd?" },
      { id: "7_6", vraag: "Is er voldoende rust in de dagstructuur, naast activiteiten?" },
      { id: "7_7", vraag: "Worden activiteiten geëvalueerd op deelname en beleving?" },
      { id: "7_8", vraag: "Is er een gekwalificeerde activiteitenbegeleider of dagbestedingscoördinator?" },
    ],
  },
  {
    id: 8,
    naam: "Lichamelijk Welzijn",
    definitie:
      "De lichamelijke gezondheid van bewoners wordt actief bewaakt en bevorderd. " +
      "Er is aandacht voor voeding, beweging, pijn, slaap en persoonlijke verzorging als integraal onderdeel van welzijn.",
    zwaarGewogen: false,
    bronLabel: "IJKKADER v5",
    checkVragen: [
      { id: "8_1", vraag: "Is de voedingszorg afgestemd op individuele wensen, cultuur en medische behoeften?" },
      { id: "8_2", vraag: "Wordt beweging actief gestimuleerd, passend bij het niveau van de bewoner?" },
      { id: "8_3", vraag: "Is er systematische aandacht voor pijnbeleving en pijnmanagement?" },
      { id: "8_4", vraag: "Worden slaapproblemen gesignaleerd en bespreekbaar gemaakt?" },
      { id: "8_5", vraag: "Is de persoonlijke verzorging afgestemd op gewoonten en voorkeuren van de bewoner?" },
      { id: "8_6", vraag: "Is er aandacht voor tandzorg, mondverzorging en andere preventieve zorg?" },
      { id: "8_7", vraag: "Worden lichamelijke achteruitgang en veranderingen tijdig gesignaleerd en gemeld?" },
      { id: "8_8", vraag: "Is er samenwerking met paramedici (fysiotherapeut, diëtist, logopedist) als dat nodig is?" },
    ],
  },
  {
    id: 9,
    naam: "Wonen & Leefomgeving",
    definitie:
      "De fysieke leefomgeving biedt comfort, herkenbaarheid en prikkeling die bijdraagt aan welzijn. " +
      "Bewoners kunnen hun directe woonomgeving zoveel mogelijk naar eigen smaak inrichten.",
    zwaarGewogen: false,
    bronLabel: "IJKKADER v5",
    checkVragen: [
      { id: "9_1", vraag: "Kunnen bewoners hun eigen kamer of appartement persoonlijk inrichten?" },
      { id: "9_2", vraag: "Is de gemeenschappelijke ruimte huiselijk, overzichtelijk en prikkelarm waar nodig?" },
      { id: "9_3", vraag: "Is er voldoende daglicht en zijn er zichtlijnen naar buiten (tuin, natuur)?" },
      { id: "9_4", vraag: "Is de akoestiek aangepast (geen overmatig omgevingsgeluid)?" },
      { id: "9_5", vraag: "Is de omgeving toegankelijk voor bewoners met mobiliteitsproblemen?" },
      { id: "9_6", vraag: "Is er een tuin of buitenruimte beschikbaar en veilig toegankelijk?" },
      { id: "9_7", vraag: "Worden kleur, materiaal en geur bewust ingezet voor oriëntatie en welbevinden?" },
      { id: "9_8", vraag: "Worden temperatuur en luchtkwaliteit bewaakt en afgestemd op bewonersbehoeften?" },
    ],
  },
  {
    id: 10,
    naam: "Houding & Bejegening",
    definitie:
      "Medewerkers benaderen bewoners vanuit oprechte betrokkenheid, gelijkwaardigheid en respect. " +
      "De organisatiecultuur versterkt een houding van menswaardigheid in alle contactmomenten.",
    zwaarGewogen: true,
    bronLabel: "IJKKADER v5",
    checkVragen: [
      { id: "10_1", vraag: "Spreken medewerkers bewoners aan op een respectvolle en persoonlijke manier?" },
      { id: "10_2", vraag: "Is er aandacht voor non-verbale communicatie (oogcontact, lichaamstaal, aanraking)?" },
      { id: "10_3", vraag: "Worden bewoners betrokken bij beslissingen die hen direct aangaan?" },
      { id: "10_4", vraag: "Is er een actief beleid tegen infantilisering (kinderlijk benaderen van ouderen)?" },
      { id: "10_5", vraag: "Reflecteren medewerkers op hun eigen houding en gedrag in teamoverleg?" },
      { id: "10_6", vraag: "Krijgen nieuwe medewerkers training in persoonsgerichte bejegening?" },
      { id: "10_7", vraag: "Is de bejegening consistent, ook in drukke momenten en bij lastige situaties?" },
      { id: "10_8", vraag: "Worden klachten en feedback van bewoners serieus genomen en teruggekoppeld?" },
    ],
  },
];

export const ZWARE_THEMAS = [2, 5, 6, 10];

export function isZwaarGewogen(themaId: number): boolean {
  return ZWARE_THEMAS.includes(themaId);
}

export function getThema(id: number): Thema | undefined {
  return THEMAS.find((t) => t.id === id);
}

export function getThemaLabel(id: number): string {
  const t = getThema(id);
  return t ? `Thema ${id}: ${t.naam}` : `Thema ${id}`;
}
