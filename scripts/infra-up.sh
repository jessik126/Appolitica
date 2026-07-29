#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ensure_docker() {
  if command -v colima >/dev/null 2>&1; then
    if ! colima status >/dev/null 2>&1; then
      echo "Starting Colima..."
      colima start
    else
      echo "Colima is already running."
    fi
  elif ! docker info >/dev/null 2>&1; then
    echo "Error: Docker is not available."
    echo "Install Colima (https://github.com/abiosoft/colima) or Docker Desktop, then retry."
    exit 1
  fi
}

wait_for_postgres() {
  echo "Waiting for Postgres to become healthy..."
  local attempts=0
  local max_attempts=30

  while [ "$attempts" -lt "$max_attempts" ]; do
    if docker compose ps --status running postgres 2>/dev/null | grep -q postgres; then
      if docker compose exec -T postgres pg_isready -U appolitica -d appolitica >/dev/null 2>&1; then
        echo "Postgres is ready."
        return 0
      fi
    fi

    attempts=$((attempts + 1))
    sleep 2
  done

  echo "Error: Postgres did not become healthy in time."
  docker compose ps
  exit 1
}

ensure_docker
docker compose up -d
wait_for_postgres

echo ""
echo "Infrastructure is up."
echo "DATABASE_URL=postgresql://appolitica:appolitica@localhost:5432/appolitica"
echo ""
echo "Next steps:"
echo "  pnpm --filter @appolitica/api db:migrate"
echo "  pnpm --filter @appolitica/api seed:mock   # first time only"
echo "  pnpm --filter @appolitica/api sync"
echo "  pnpm dev"
