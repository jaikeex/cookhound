/*
  Warnings:

  - The primary key for the `recipes_ingredients` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "public"."recipes_ingredients" DROP CONSTRAINT "recipes_ingredients_pkey",
ADD COLUMN     "category" VARCHAR(100),
ADD COLUMN     "category_order" INTEGER,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "recipes_ingredients_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "recipes_ingredients_recipe_id_ingredient_id_idx" ON "public"."recipes_ingredients"("recipe_id", "ingredient_id");

-- CreateIndex
CREATE INDEX "recipes_ingredients_recipe_id_category_idx" ON "public"."recipes_ingredients"("recipe_id", "category");

-- CreateIndex
CREATE INDEX "recipes_ingredients_recipe_id_category_order_idx" ON "public"."recipes_ingredients"("recipe_id", "category_order");
