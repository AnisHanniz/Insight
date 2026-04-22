#!/bin/sh
set -e

echo "[entrypoint] waiting for db at ${DATABASE_HOST:-db}:${DATABASE_PORT:-5432}..."
until nc -z "${DATABASE_HOST:-db}" "${DATABASE_PORT:-5432}" 2>/dev/null; do
  sleep 1
done
echo "[entrypoint] db up"

echo "[entrypoint] running prisma migrate deploy"
npx prisma migrate deploy

echo "[entrypoint] seeding (idempotent)"
node --import tsx prisma/seed.ts || echo "[entrypoint] seed warning: $?"

echo "[entrypoint] launching: $*"
exec "$@"
