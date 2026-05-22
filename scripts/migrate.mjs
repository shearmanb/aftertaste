import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const TABLES = [
  [`Producer`, `
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "quality"   TEXT,
    "beanNotes" TEXT,
    "variance"  TEXT,
    "website"   TEXT,
    CONSTRAINT "Producer_pkey" PRIMARY KEY ("id")
  `],
  [`WaterProfile`, `
    "id"        TEXT NOT NULL,
    "brand"     TEXT NOT NULL,
    "additives" TEXT,
    "notes"     TEXT,
    CONSTRAINT "WaterProfile_pkey" PRIMARY KEY ("id")
  `],
  [`GrindProfile`, `
    "id"      TEXT NOT NULL,
    "name"    TEXT NOT NULL,
    "grinder" TEXT NOT NULL DEFAULT 'Fellow Ode Gen 2',
    "setting" DOUBLE PRECISION NOT NULL,
    "notes"   TEXT,
    CONSTRAINT "GrindProfile_pkey" PRIMARY KEY ("id")
  `],
  [`AidenProfile`, `
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "coffeeG"     DOUBLE PRECISION NOT NULL,
    "waterG"      DOUBLE PRECISION NOT NULL,
    "tempF"       INTEGER NOT NULL,
    "bloomTimeS"  INTEGER NOT NULL,
    "bloomWaterG" DOUBLE PRECISION NOT NULL,
    "pours"       JSONB NOT NULL,
    "notes"       TEXT,
    CONSTRAINT "AidenProfile_pkey" PRIMARY KEY ("id")
  `],
  [`Bean`, `
    "id"           TEXT NOT NULL,
    "producerId"   TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "region"       TEXT,
    "roastLevel"   TEXT NOT NULL,
    "process"      TEXT,
    "tastingNotes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "imageUrl"     TEXT,
    "productUrl"   TEXT,
    "notes"        TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bean_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Bean_producerId_fkey" FOREIGN KEY ("producerId")
      REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  `],
  [`Brew`, `
    "id"             TEXT NOT NULL,
    "brewedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roastedOn"      TIMESTAMP(3),
    "openedOn"       TIMESTAMP(3),
    "beanId"         TEXT NOT NULL,
    "waterProfileId" TEXT,
    "grindProfileId" TEXT NOT NULL,
    "aidenProfileId" TEXT NOT NULL,
    CONSTRAINT "Brew_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Brew_beanId_fkey" FOREIGN KEY ("beanId")
      REFERENCES "Bean"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Brew_waterProfileId_fkey" FOREIGN KEY ("waterProfileId")
      REFERENCES "WaterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Brew_grindProfileId_fkey" FOREIGN KEY ("grindProfileId")
      REFERENCES "GrindProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Brew_aidenProfileId_fkey" FOREIGN KEY ("aidenProfileId")
      REFERENCES "AidenProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE
  `],
  [`TastingNote`, `
    "id"              TEXT NOT NULL,
    "brewId"          TEXT NOT NULL,
    "overallScore"    INTEGER NOT NULL,
    "fruit"           INTEGER NOT NULL,
    "bitterness"      INTEGER NOT NULL,
    "chocolate"       INTEGER NOT NULL,
    "sourness"        INTEGER NOT NULL,
    "drinkingTempF"   INTEGER,
    "flavorTags"      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "confirmedTags"   TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "missedTags"      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "bonusTags"       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "initialThoughts" TEXT,
    "bestPart"        TEXT,
    "worstPart"       TEXT,
    "changesToMake"   TEXT,
    "wouldBrewAgain"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TastingNote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TastingNote_brewId_key" UNIQUE ("brewId"),
    CONSTRAINT "TastingNote_brewId_fkey" FOREIGN KEY ("brewId")
      REFERENCES "Brew"("id") ON DELETE CASCADE ON UPDATE CASCADE
  `],
];

const client = await pool.connect();
try {
  for (const [name, cols] of TABLES) {
    await client.query(`CREATE TABLE IF NOT EXISTS "${name}" (${cols})`);
    console.log(`✓ ${name}`);
  }
  console.log("Schema applied.");
} finally {
  client.release();
  await pool.end();
}
