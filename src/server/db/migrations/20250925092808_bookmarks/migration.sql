/*
  Warnings:

  - A unique constraint covering the columns `[owner_id,owner_order]` on the table `cookbooks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."cookbooks" ADD COLUMN     "owner_order" INTEGER;

-- CreateTable
CREATE TABLE "public"."cookbook_bookmarks" (
    "user_id" INTEGER NOT NULL,
    "cookbook_id" INTEGER NOT NULL,
    "bookmark_order" INTEGER NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cookbook_bookmarks_pkey" PRIMARY KEY ("user_id","cookbook_id")
);

-- CreateIndex
CREATE INDEX "cookbook_bookmarks_cookbook_id_idx" ON "public"."cookbook_bookmarks"("cookbook_id");

-- CreateIndex
ALTER TABLE public.cookbook_bookmarks
  ADD CONSTRAINT cookbook_bookmarks_user_id_bookmark_order_key
  UNIQUE (user_id, bookmark_order)
  DEFERRABLE INITIALLY DEFERRED;

-- CreateIndex
ALTER TABLE public.cookbooks
  ADD CONSTRAINT cookbooks_owner_id_owner_order_key
  UNIQUE (owner_id, owner_order)
  DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "public"."cookbook_bookmarks" ADD CONSTRAINT "cookbook_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cookbook_bookmarks" ADD CONSTRAINT "cookbook_bookmarks_cookbook_id_fkey" FOREIGN KEY ("cookbook_id") REFERENCES "public"."cookbooks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

