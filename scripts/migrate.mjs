import pg from "pg";
import { createHash, randomUUID } from "crypto";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE = "20260525000001_baseline";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  // Ensure Prisma's migrations tracking table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id"                  VARCHAR(36) NOT NULL,
      "checksum"            VARCHAR(64) NOT NULL,
      "finished_at"         TIMESTAMPTZ,
      "migration_name"      VARCHAR(255) NOT NULL,
      "logs"                TEXT,
      "rolled_back_at"      TIMESTAMPTZ,
      "started_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
      CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
    )
  `);

  // On an existing DB the tables already exist — mark baseline as applied
  // without running its SQL, so prisma migrate deploy only runs new migrations.
  const { rowCount } = await client.query(
    `SELECT 1 FROM "_prisma_migrations" WHERE "migration_name" = $1`,
    [BASELINE]
  );
  if (rowCount === 0) {
    const sqlPath = join(__dirname, `../prisma/migrations/${BASELINE}/migration.sql`);
    const sql = readFileSync(sqlPath, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    await client.query(
      `INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","applied_steps_count")
       VALUES ($1,$2,NOW(),$3,1)`,
      [randomUUID(), checksum, BASELINE]
    );
    console.log(`✓ Baseline recorded: ${BASELINE}`);
  } else {
    console.log(`✓ Baseline already applied`);
  }

  // Seed all dropdown options (safe to re-run; ON CONFLICT is a no-op)
  const SEEDS = [
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
    // outsideCupMethod
    ["outsideCupMethod", "Espresso"], ["outsideCupMethod", "Americano"],
    ["outsideCupMethod", "Pour Over"], ["outsideCupMethod", "Drip"],
    ["outsideCupMethod", "French Press"], ["outsideCupMethod", "Aeropress"],
    ["outsideCupMethod", "Cold Brew"], ["outsideCupMethod", "Latte"],
    ["outsideCupMethod", "Cortado"], ["outsideCupMethod", "Flat White"],
    ["outsideCupMethod", "Cappuccino"], ["outsideCupMethod", "Other"],
  ];

  for (const [category, value] of SEEDS) {
    await client.query(
      `INSERT INTO "DropdownOption" ("id","category","value") VALUES ($1,$2,$3) ON CONFLICT ("category","value") DO NOTHING`,
      [createHash("md5").update(`${category}:${value}`).digest("hex"), category, value]
    );
  }
  console.log(`✓ DropdownOption seeds applied`);
} finally {
  client.release();
  await pool.end();
}

console.log("Running prisma migrate deploy...");
execSync("node_modules/.bin/prisma migrate deploy", { stdio: "inherit" });
console.log("Schema applied.");
