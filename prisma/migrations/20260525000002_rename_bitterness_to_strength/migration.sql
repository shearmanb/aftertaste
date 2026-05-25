-- Rename bitterness to strength.
-- The column now stores the raw slider position (-10 to +10)
-- instead of a derived 0-5 score. Existing rows retain their
-- old derived values; the app handles legacy display gracefully.

ALTER TABLE "TastingNote" RENAME COLUMN "bitterness" TO "strength";
