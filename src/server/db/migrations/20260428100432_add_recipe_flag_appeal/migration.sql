-- CreateTable
CREATE TABLE "recipe_flag_appeals" (
    "id" SERIAL NOT NULL,
    "flag_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "reviewed_by_id" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_flag_appeals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recipe_flag_appeals_flag_id_idx" ON "recipe_flag_appeals"("flag_id");

-- CreateIndex
CREATE INDEX "recipe_flag_appeals_flag_id_status_idx" ON "recipe_flag_appeals"("flag_id", "status");

-- CreateIndex
CREATE INDEX "recipe_flag_appeals_user_id_idx" ON "recipe_flag_appeals"("user_id");

-- CreateIndex
CREATE INDEX "recipe_flag_appeals_status_idx" ON "recipe_flag_appeals"("status");

-- CreateIndex
CREATE INDEX "recipe_flags_recipe_id_active_idx" ON "recipe_flags"("recipe_id", "active");

-- AddForeignKey
ALTER TABLE "recipe_flag_appeals" ADD CONSTRAINT "recipe_flag_appeals_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "recipe_flags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_flag_appeals" ADD CONSTRAINT "recipe_flag_appeals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_flag_appeals" ADD CONSTRAINT "recipe_flag_appeals_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
