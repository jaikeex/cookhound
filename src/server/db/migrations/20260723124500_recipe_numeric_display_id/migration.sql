ALTER TABLE "recipes" RENAME COLUMN "display_id" TO "legacy_display_id";
ALTER TABLE "recipes" ALTER COLUMN "legacy_display_id" DROP NOT NULL;
ALTER INDEX "recipes_display_id_key" RENAME TO "recipes_legacy_display_id_key";
DROP INDEX "recipes_display_id_idx";

ALTER TABLE "recipes" ADD COLUMN "display_id" VARCHAR(8);

DO $$
DECLARE
    rec RECORD;
    candidate TEXT;
BEGIN
    FOR rec IN SELECT "id" FROM "recipes" ORDER BY "id" LOOP
        LOOP
            candidate := (floor(random() * 900000) + 100000)::bigint::text;
            EXIT WHEN NOT EXISTS (
                SELECT 1 FROM "recipes" WHERE "display_id" = candidate
            );
        END LOOP;
        UPDATE "recipes" SET "display_id" = candidate WHERE "id" = rec."id";
    END LOOP;
END $$;

ALTER TABLE "recipes" ALTER COLUMN "display_id" SET NOT NULL;
CREATE UNIQUE INDEX "recipes_display_id_key" ON "recipes"("display_id");
CREATE INDEX "recipes_display_id_idx" ON "recipes"("display_id");
