#!/usr/bin/env bash
set -euo pipefail

# Apply any pending Prisma migrations. Safe to run every start.
if [ -f "/app/prisma/schema.prisma" ]; then
  echo "Migrating database..."
  npx prisma migrate deploy
fi

# Finally exec the container CMD
exec "$@"
