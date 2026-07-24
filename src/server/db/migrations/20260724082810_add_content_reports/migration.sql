-- CreateTable
CREATE TABLE "content_reports" (
    "id" SERIAL NOT NULL,
    "reporter_id" INTEGER NOT NULL,
    "target_type" VARCHAR(32) NOT NULL,
    "target_id" INTEGER NOT NULL,
    "target_label" VARCHAR(255) NOT NULL,
    "target_url" VARCHAR(512) NOT NULL,
    "reason" VARCHAR(64) NOT NULL,
    "details" TEXT,
    "status" VARCHAR(32) NOT NULL DEFAULT 'pending',
    "reviewed_by_id" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_reports_target_type_target_id_idx" ON "content_reports"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "content_reports_status_idx" ON "content_reports"("status");

-- CreateIndex
CREATE INDEX "content_reports_reporter_id_idx" ON "content_reports"("reporter_id");

-- CreateIndex
CREATE INDEX "content_reports_reporter_id_target_type_target_id_status_idx" ON "content_reports"("reporter_id", "target_type", "target_id", "status");

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_reports" ADD CONSTRAINT "content_reports_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
