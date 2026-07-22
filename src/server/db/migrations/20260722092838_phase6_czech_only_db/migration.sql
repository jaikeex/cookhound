-- Phase 6: Czech-only collapse.
-- Collapses tag_translations into tags.name and drops the language columns from
-- recipes, ingredients and cookbooks. Runs in one transaction — a guard failure
-- rolls everything back and leaves the old schema intact.

-- 0) Safety guards: re-verify the phase 0 audit against THIS database before
--    destroying data.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "recipes"     WHERE "language" <> 'cs')
    OR EXISTS (SELECT 1 FROM "cookbooks"   WHERE "language" <> 'cs')
    OR EXISTS (SELECT 1 FROM "ingredients" WHERE "language" <> 'cs') THEN
        RAISE EXCEPTION 'phase6: non-cs rows exist — re-run the phase 0 audit before migrating';
    END IF;

    IF EXISTS (SELECT "name" FROM "ingredients" GROUP BY "name" HAVING COUNT(*) > 1) THEN
        RAISE EXCEPTION 'phase6: duplicate ingredient names — cannot create unique index on name';
    END IF;
END $$;

-- 1) Collapse tag_translations into tags.name
--    (add nullable -> backfill from cs rows -> NOT NULL -> drop table)
ALTER TABLE "tags" ADD COLUMN "name" VARCHAR(50);

UPDATE "tags" t
SET "name" = COALESCE(
    (SELECT tr."name"
     FROM "tag_translations" tr
     WHERE tr."tag_id" = t."id" AND tr."language" = 'cs'),
    REPLACE(t."slug", '-', ' ')  -- safety fallback; the seed re-asserts constants afterwards
);

ALTER TABLE "tags" ALTER COLUMN "name" SET NOT NULL;

-- DropTable (also drops tag_translations_language_idx and the FK to tags)
DROP TABLE "tag_translations";

-- 2) recipes.language
DROP INDEX "recipes_language_idx";
ALTER TABLE "recipes" DROP COLUMN "language";

-- 3) ingredients.language (+ unique constraint swap, drop redundant name index)
DROP INDEX "ingredients_language_idx";
DROP INDEX "ingredients_language_name_key";
DROP INDEX "ingredients_name_idx";
ALTER TABLE "ingredients" DROP COLUMN "language";

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

-- 4) cookbooks.language
ALTER TABLE "cookbooks" DROP COLUMN "language";
