-- Collapse any pre-existing duplicate open reports (keep the newest per
-- reporter+target) so the partial unique index below can be created. A no-op
-- when there are no duplicates. Scoped to real reporters (reporter_id <> -1)
-- to match the index predicate: the -1 sentinel is the anonymization bucket for
-- deleted users and is intentionally left unconstrained.
UPDATE "content_reports" c
SET "status" = 'dismissed'
WHERE "status" IN ('pending', 'reviewing')
  AND c."reporter_id" <> -1
  AND EXISTS (
    SELECT 1 FROM "content_reports" c2
    WHERE c2."reporter_id" = c."reporter_id"
      AND c2."target_type" = c."target_type"
      AND c2."target_id" = c."target_id"
      AND c2."status" IN ('pending', 'reviewing')
      AND (c2."created_at" > c."created_at"
           OR (c2."created_at" = c."created_at" AND c2."id" > c."id"))
  );

-- Enforce "one open report per reporter per target" at the database level,
-- closing the check-then-act (TOCTOU) race in ContentReportService.createReport
-- where two concurrent requests could both pass the getOpenByReporterAndTarget
-- check and insert duplicate open reports. Partial (open statuses only) so that
-- resolved reports do not block the reporter from re-reporting the target later.
--
-- reporter_id <> -1 excludes the anonymization sentinel: when a user is deleted,
-- their open reports are remapped to reporter_id -1 (see UserModel hard delete),
-- and two deleted users who both had an open report on the same target would
-- otherwise collide on this index and abort the deletion transaction. The -1
-- bucket is not a real reporter, so deduping it is meaningless.
CREATE UNIQUE INDEX "content_reports_one_open_per_target"
    ON "content_reports" ("reporter_id", "target_type", "target_id")
    WHERE "status" IN ('pending', 'reviewing') AND "reporter_id" <> -1;
