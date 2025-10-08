-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deletion_scheduled_for" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."account_deletion_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(512),
    "reason" TEXT,
    "proof_hash" VARCHAR(255) NOT NULL,
    "user_email" VARCHAR(255) NOT NULL,
    "user_name" VARCHAR(128) NOT NULL,

    CONSTRAINT "account_deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "account_deletion_requests_user_id_idx" ON "public"."account_deletion_requests"("user_id");

-- CreateIndex
CREATE INDEX "account_deletion_requests_requested_at_idx" ON "public"."account_deletion_requests"("requested_at");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "public"."users"("status");

-- CreateIndex
CREATE INDEX "users_deletion_scheduled_for_idx" ON "public"."users"("deletion_scheduled_for");

-- AddForeignKey
ALTER TABLE "public"."account_deletion_requests" ADD CONSTRAINT "account_deletion_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
