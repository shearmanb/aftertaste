-- Add miscVars column to Brew for storing selected misc variables (e.g. "used lid")
ALTER TABLE "Brew" ADD COLUMN "miscVars" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
