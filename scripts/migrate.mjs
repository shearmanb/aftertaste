import pg from "pg";
import { createHash } from "crypto";

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
  [`FilterProfile`, `
    "id"    TEXT NOT NULL,
    "name"  TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "FilterProfile_pkey" PRIMARY KEY ("id")
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
  [`DropdownOption`, `
    "id"       TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "value"    TEXT NOT NULL,
    CONSTRAINT "DropdownOption_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DropdownOption_category_value_key" UNIQUE ("category", "value")
  `],
];

const SEED = [
  // process
  ["process", "Washed"], ["process", "Natural"], ["process", "Honey"],
  ["process", "Anaerobic Natural"], ["process", "Anaerobic Washed"],
  ["process", "Wet-Hulled"], ["process", "Other"],
  // roastLevel
  ["roastLevel", "light"], ["roastLevel", "medium-light"], ["roastLevel", "medium"],
  ["roastLevel", "medium-dark"], ["roastLevel", "dark"],
  // beanTastingNote
  ["beanTastingNote", "blueberry"], ["beanTastingNote", "strawberry"], ["beanTastingNote", "raspberry"],
  ["beanTastingNote", "cherry"], ["beanTastingNote", "stone fruit"], ["beanTastingNote", "peach"],
  ["beanTastingNote", "mango"], ["beanTastingNote", "tropical"], ["beanTastingNote", "passionfruit"],
  ["beanTastingNote", "citrus"], ["beanTastingNote", "lemon"], ["beanTastingNote", "orange"],
  ["beanTastingNote", "grapefruit"], ["beanTastingNote", "jasmine"], ["beanTastingNote", "rose"],
  ["beanTastingNote", "floral"], ["beanTastingNote", "lavender"], ["beanTastingNote", "caramel"],
  ["beanTastingNote", "brown sugar"], ["beanTastingNote", "honey"], ["beanTastingNote", "chocolate"],
  ["beanTastingNote", "dark chocolate"], ["beanTastingNote", "vanilla"], ["beanTastingNote", "maple"],
  ["beanTastingNote", "hazelnut"], ["beanTastingNote", "almond"], ["beanTastingNote", "nutty"],
  ["beanTastingNote", "cinnamon"], ["beanTastingNote", "cardamom"], ["beanTastingNote", "bright"],
  ["beanTastingNote", "clean"], ["beanTastingNote", "complex"], ["beanTastingNote", "juicy"],
  ["beanTastingNote", "tea-like"], ["beanTastingNote", "earthy"], ["beanTastingNote", "smoky"],
  ["beanTastingNote", "wine"],
  // brewIssue
  ["brewIssue", "channeling"], ["brewIssue", "uneven extraction"], ["brewIssue", "under-extracted"],
  ["brewIssue", "over-extracted"], ["brewIssue", "grind too coarse"], ["brewIssue", "grind too fine"],
  ["brewIssue", "water too hot"], ["brewIssue", "water too cold"], ["brewIssue", "bloom too short"],
  ["brewIssue", "bloom too long"], ["brewIssue", "wrong dose"], ["brewIssue", "scale error"],
  ["brewIssue", "stale beans"], ["brewIssue", "clogged filter"], ["brewIssue", "equipment issue"],
  // flavorTag
  ["flavorTag", "jasmine"], ["flavorTag", "berry"], ["flavorTag", "citrus"],
  ["flavorTag", "tropical"], ["flavorTag", "stone fruit"], ["flavorTag", "apple"],
  ["flavorTag", "caramel"], ["flavorTag", "chocolate"], ["flavorTag", "nutty"],
  ["flavorTag", "brown sugar"], ["flavorTag", "vanilla"], ["flavorTag", "roasty"],
  ["flavorTag", "smoky"], ["flavorTag", "earthy"], ["flavorTag", "floral"],
  ["flavorTag", "bright"], ["flavorTag", "clean"], ["flavorTag", "complex"],
];

function seedId(category, value) {
  return createHash("md5").update(`${category}:${value}`).digest("hex");
}

const client = await pool.connect();
try {
  for (const [name, cols] of TABLES) {
    await client.query(`CREATE TABLE IF NOT EXISTS "${name}" (${cols})`);
    console.log(`✓ ${name}`);
  }
  await client.query(`
    ALTER TABLE "Brew"
      ADD COLUMN IF NOT EXISTS "filterProfileId" TEXT
        REFERENCES "FilterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE
  `);
  await client.query(`ALTER TABLE "Brew" ADD COLUMN IF NOT EXISTS "roastedOn" TIMESTAMP(3)`);
  await client.query(`ALTER TABLE "Brew" ADD COLUMN IF NOT EXISTS "openedOn" TIMESTAMP(3)`);
  await client.query(`ALTER TABLE "Brew" ADD COLUMN IF NOT EXISTS "brewIssues" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`);
  await client.query(`ALTER TABLE "Brew" ADD COLUMN IF NOT EXISTS "actualCoffeeG" DOUBLE PRECISION`);
  console.log("✓ Brew columns");

  await client.query(`ALTER TABLE "Bean" ADD COLUMN IF NOT EXISTS "productUrl" TEXT`);
  console.log("✓ Bean columns");

  await client.query(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'TastingNote' AND column_name = 'overallScore' AND data_type = 'integer'
      ) THEN
        ALTER TABLE "TastingNote" ALTER COLUMN "overallScore" TYPE DOUBLE PRECISION;
        ALTER TABLE "TastingNote" ALTER COLUMN "fruit"        TYPE DOUBLE PRECISION;
        ALTER TABLE "TastingNote" ALTER COLUMN "bitterness"   TYPE DOUBLE PRECISION;
        ALTER TABLE "TastingNote" ALTER COLUMN "chocolate"    TYPE DOUBLE PRECISION;
        ALTER TABLE "TastingNote" ALTER COLUMN "sourness"     TYPE DOUBLE PRECISION;
      END IF;
    END $$
  `);
  console.log("✓ TastingNote score columns → DOUBLE PRECISION");

  await client.query(`ALTER TABLE "TastingNote" ADD COLUMN IF NOT EXISTS "confirmedTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`);
  await client.query(`ALTER TABLE "TastingNote" ADD COLUMN IF NOT EXISTS "missedTags"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`);
  await client.query(`ALTER TABLE "TastingNote" ADD COLUMN IF NOT EXISTS "bonusTags"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`);
  console.log("✓ TastingNote columns");

  await client.query(`ALTER TABLE "Bean" ADD COLUMN IF NOT EXISTS "producerId" TEXT`);
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'Bean_producerId_fkey' AND table_name = 'Bean'
      ) THEN
        ALTER TABLE "Bean" ADD CONSTRAINT "Bean_producerId_fkey"
          FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END $$
  `);
  console.log("✓ Bean.producerId column");

  await client.query(`DELETE FROM "TastingNote" WHERE "brewId" IN (SELECT "id" FROM "Brew" WHERE "beanId" IN (SELECT "id" FROM "Bean" WHERE "producerId" IS NULL))`);
  await client.query(`DELETE FROM "Brew" WHERE "beanId" IN (SELECT "id" FROM "Bean" WHERE "producerId" IS NULL)`);
  await client.query(`DELETE FROM "Bean" WHERE "producerId" IS NULL`);
  await client.query(`ALTER TABLE "Bean" DROP COLUMN IF EXISTS "producer"`);
  console.log("✓ Bean cleanup: orphan rows removed, old producer column dropped");

  for (const [category, value] of SEED) {
    await client.query(
      `INSERT INTO "DropdownOption" ("id", "category", "value") VALUES ($1, $2, $3) ON CONFLICT ("category", "value") DO NOTHING`,
      [seedId(category, value), category, value]
    );
  }
  console.log(`✓ DropdownOption seeded (${SEED.length} defaults)`);
  console.log("Schema applied.");
} finally {
  client.release();
  await pool.end();
}
