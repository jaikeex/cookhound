-- CreateEnum
CREATE TYPE "public"."CookbookVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- CreateTable
CREATE TABLE "public"."cookbooks" (
    "id" SERIAL NOT NULL,
    "display_id" VARCHAR(36) NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "language" VARCHAR(2) NOT NULL DEFAULT 'cs',
    "cover_image_url" VARCHAR(255),
    "visibility" "public"."CookbookVisibility" NOT NULL DEFAULT 'PRIVATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cookbooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cookbooks_recipes" (
    "cookbook_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "recipe_order" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cookbooks_recipes_pkey" PRIMARY KEY ("cookbook_id","recipe_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cookbooks_display_id_key" ON "public"."cookbooks"("display_id");

-- CreateIndex
CREATE INDEX "cookbooks_owner_id_idx" ON "public"."cookbooks"("owner_id");

-- CreateIndex
CREATE INDEX "cookbooks_title_idx" ON "public"."cookbooks"("title");

-- CreateIndex
CREATE INDEX "cookbooks_visibility_idx" ON "public"."cookbooks"("visibility");

-- CreateIndex
CREATE INDEX "cookbooks_recipes_recipe_id_idx" ON "public"."cookbooks_recipes"("recipe_id");

-- CreateConstraint (deferrable)
ALTER TABLE "public"."cookbooks_recipes" 
  ADD CONSTRAINT "cookbooks_recipes_cookbook_id_recipe_order_key" 
  UNIQUE ("cookbook_id", "recipe_order") 
  DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "public"."cookbooks" ADD CONSTRAINT "cookbooks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cookbooks_recipes" ADD CONSTRAINT "cookbooks_recipes_cookbook_id_fkey" FOREIGN KEY ("cookbook_id") REFERENCES "public"."cookbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cookbooks_recipes" ADD CONSTRAINT "cookbooks_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
