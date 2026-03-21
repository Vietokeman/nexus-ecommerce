#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL_DIR="$ROOT_DIR/scripts/sql"

DB_CONTAINER="${DB_CONTAINER:-src-nexusdb}"
DB_USER="${DB_USER:-admin}"
DB_PASSWORD="${DB_PASSWORD:-change_me_with_postgres_password}"
DB_PORT="${DB_PORT:-5432}"

PHASE_FILES=(
  "$SQL_DIR/phase-01-identity.sql"
  "$SQL_DIR/phase-02-catalog-inventory.sql"
  "$SQL_DIR/phase-03-campaigns.sql"
  "$SQL_DIR/phase-04-transactions.sql"
  "$SQL_DIR/phase-05-interactions.sql"
)

AUDIT_FILES=(
  "$SQL_DIR/audit-row-counts.sql"
  "$SQL_DIR/audit-cross-service-consistency.sql"
)

RUN_AUDIT="${RUN_AUDIT:-true}"

if ! command -v docker >/dev/null 2>&1; then
  echo "[ERROR] docker command is not available." >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
  echo "[ERROR] Container '${DB_CONTAINER}' is not running." >&2
  exit 1
fi

run_phase() {
  local phase_file="$1"
  local phase_name
  phase_name="$(basename "$phase_file")"

  if [[ ! -f "$phase_file" ]]; then
    echo "[ERROR] Missing phase file: $phase_file" >&2
    exit 1
  fi

  echo "[RUN] $phase_name"
  docker exec -i \
    -e PGPASSWORD="$DB_PASSWORD" \
    "$DB_CONTAINER" \
    psql -h localhost -p "$DB_PORT" -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 -f - < "$phase_file"
  echo "[PASS] $phase_name"
  echo ""
}

echo "== Nexus DB initialization started =="
echo "Container: $DB_CONTAINER"
echo "SQL dir:    $SQL_DIR"
echo ""

for phase in "${PHASE_FILES[@]}"; do
  run_phase "$phase"
done

if [[ "$RUN_AUDIT" == "true" ]]; then
  echo "== Running audit scripts =="
  for audit in "${AUDIT_FILES[@]}"; do
    run_phase "$audit"
  done
fi

echo "== DB initialization completed successfully =="
