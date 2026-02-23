-- CreateTable
CREATE TABLE "LocatieCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locatieNaam" TEXT NOT NULL,
    "datum" DATETIME NOT NULL,
    "afdeling" TEXT NOT NULL,
    "doelgroep" TEXT NOT NULL,
    "context" TEXT NOT NULL DEFAULT '',
    "conceptStatus" TEXT NOT NULL DEFAULT 'concept',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Observatie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locatieCheckId" TEXT NOT NULL,
    "plaats" TEXT NOT NULL,
    "moment" TEXT NOT NULL,
    "bewijsType" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "inhoud" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Observatie_locatieCheckId_fkey" FOREIGN KEY ("locatieCheckId") REFERENCES "LocatieCheck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThemaScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locatieCheckId" TEXT NOT NULL,
    "themaId" INTEGER NOT NULL,
    "ingevoerdeScore" REAL NOT NULL DEFAULT 0,
    "positiefBewijs" TEXT NOT NULL DEFAULT '',
    "negatiefBewijs" TEXT NOT NULL DEFAULT '',
    "positiefMetKanttekening" TEXT NOT NULL DEFAULT '',
    "bewonersstem" TEXT NOT NULL DEFAULT '',
    "checkVraagAntwoorden" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ThemaScore_locatieCheckId_fkey" FOREIGN KEY ("locatieCheckId") REFERENCES "LocatieCheck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BOMObservatie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locatieCheckId" TEXT NOT NULL,
    "sectie" TEXT NOT NULL,
    "antwoorden" TEXT NOT NULL DEFAULT '',
    "prikkelDuiding" TEXT NOT NULL DEFAULT '',
    "gekoppeldeThemas" TEXT NOT NULL DEFAULT '',
    "participerend" BOOLEAN NOT NULL DEFAULT false,
    "watDeedObserveerder" TEXT NOT NULL DEFAULT '',
    "effectOpBewoners" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BOMObservatie_locatieCheckId_fkey" FOREIGN KEY ("locatieCheckId") REFERENCES "LocatieCheck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HospitalityItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locatieCheckId" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "antwoorden" TEXT NOT NULL DEFAULT '',
    "notities" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HospitalityItem_locatieCheckId_fkey" FOREIGN KEY ("locatieCheckId") REFERENCES "LocatieCheck" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bron" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "versie" TEXT NOT NULL,
    "datum" TEXT NOT NULL,
    "locatie" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ThemaScore_locatieCheckId_themaId_key" ON "ThemaScore"("locatieCheckId", "themaId");

-- CreateIndex
CREATE UNIQUE INDEX "BOMObservatie_locatieCheckId_sectie_key" ON "BOMObservatie"("locatieCheckId", "sectie");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalityItem_locatieCheckId_categorie_key" ON "HospitalityItem"("locatieCheckId", "categorie");

-- CreateIndex
CREATE UNIQUE INDEX "Bron_label_key" ON "Bron"("label");
