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

ALTER TABLE "tags" ADD COLUMN "name" VARCHAR(50);

UPDATE "tags" t
SET "name" = COALESCE(
    (SELECT tr."name"
     FROM "tag_translations" tr
     WHERE tr."tag_id" = t."id" AND tr."language" = 'cs'),
    REPLACE(t."slug", '-', ' ')  -- safety fallback; the seed re-asserts constants afterwards
);

ALTER TABLE "tags" ALTER COLUMN "name" SET NOT NULL;

DROP TABLE "tag_translations";

DROP INDEX "recipes_language_idx";
ALTER TABLE "recipes" DROP COLUMN "language";

DROP INDEX "ingredients_language_idx";
DROP INDEX "ingredients_language_name_key";
DROP INDEX "ingredients_name_idx";
ALTER TABLE "ingredients" DROP COLUMN "language";

CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

ALTER TABLE "cookbooks" DROP COLUMN "language";
