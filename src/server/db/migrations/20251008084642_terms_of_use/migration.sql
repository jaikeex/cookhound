-- CreateTable
CREATE TABLE "public"."terms_acceptances" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "version" VARCHAR(255) NOT NULL DEFAULT '2025-10-07',
    "user_ip_address" VARCHAR(255),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "proof_hash" VARCHAR(255) NOT NULL,

    CONSTRAINT "terms_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "terms_acceptances_id_user_id_idx" ON "public"."terms_acceptances"("id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."terms_acceptances" ADD CONSTRAINT "terms_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
