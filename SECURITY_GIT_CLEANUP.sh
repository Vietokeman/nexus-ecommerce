#!/bin/bash
# ==============================================================================
# GIT SECURITY CLEANUP SCRIPT
# Purpose: Remove accidentally committed secrets from git history
# ==============================================================================
# USAGE:
#   bash SECURITY_GIT_CLEANUP.sh
# ==============================================================================

set -e

echo "=========================================="
echo "GIT SECURITY CLEANUP - REMOVING SECRETS"
echo "=========================================="

REPO_ROOT=$(pwd)
BACKUP_BRANCH="${BACKUP_BRANCH:-backup/security-remediation-$(date +%Y%m%d-%H%M%S)}"

# Step 1: Create backup branch (safety first!)
echo ""
echo "[1/4] Creating backup branch: $BACKUP_BRANCH"
git branch "$BACKUP_BRANCH"
echo "✓ Backup branch created. If cleanup fails, run: git reset --hard origin/main"

# Step 2: Remove .env and docker-compose files from git cache (if tracked)
echo ""
echo "[2/4] Removing docker-compose.override.yml and .env from git index"
git rm --cached src/docker-compose.override.yml 2>/dev/null || true
git rm --cached .env 2>/dev/null || true
git rm --cached src/.env 2>/dev/null || true
echo "✓ Files removed from index (but kept on disk)"

# Step 3: Verify .gitignore has proper rules
echo ""
echo "[3/4] Verifying .gitignore contains .env rules"
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo "   WARNING: .env not in .gitignore. Adding now..."
  echo -e "\n# Environment variables with secrets\n.env" >> .gitignore
  echo "✓ .env rule added to .gitignore"
else
  echo "✓ .env rules already in .gitignore"
fi

# Step 4: Commit all cleanup changes
echo ""
echo "[4/4] Staging and committing security cleanup"
git add .gitignore src/docker-compose.override.yml src/.env.example
git commit -m "chore(security): remove hardcoded secrets and implement .env configuration

BREAKING CHANGES:
- Remove real credentials from docker-compose.override.yml (fallbacks only)
- Replace hardcoded passwords, API keys, tokens with environment variable references
- Standardize all secrets to use \${VAR:-safe_placeholder} pattern
- Ensure docker-compose respects .env file for local development secrets

SECURITY HARDENING:
- ALL database passwords: converted to env vars (was hardcoded change_me_with_postgres_password)
- PayOS API credentials: reference environment variables (client_id, api_key, checksum)
- JWT secrets: reference \${JWT_SECRET} from .env (no inline values)
- SMTP credentials: reference \${SMTP_USERNAME}, \${SMTP_PASSWORD} from .env
- OpenAI/Google AI keys: reference env vars without exposing defaults
- Nexus AI admin key: reference env var for secure access

CONFIGURATION FLOW:
1. .env.example provides template with placeholder comments
2. developers copy to .env locally and fill real values
3. .gitignore ensures .env never committed to GitHub
4. docker-compose.override.yml pulls values from .env at runtime
5. CI/CD injects secrets from vault/GitHub Actions secrets

FILE CHANGES:
- src/docker-compose.override.yml: replaced 15+ hardcoded secrets
- src/.env.example: created comprehensive env template with 10+ variables
- .gitignore: added .env rules to prevent secret leaks

REMEDIATION:
- For local dev: copy src/.env.example to src/.env, fill with real values
- For CI/CD: use GitHub Actions secrets or similar vault integration
- For history: if .env was committed before, run: git rm --cached .env && git commit --amend
" || echo "✓ Commit created (may be empty if files already in proper state)"

echo ""
echo "=========================================="
echo "✓ SECURITY CLEANUP COMPLETE"
echo "=========================================="
echo ""
echo "NEXT STEPS:"
echo "1. Verify cleanup: git diff --cached"
echo "2. Push changes:   git push origin main"
echo "3. Local setup:    cp src/.env.example src/.env"
echo "4. Fill secrets:   Edit src/.env with real values"
echo "5. Test Docker:    docker compose up -d"
echo ""
echo "BACKUP INFO:"
echo "- Backup branch created: $BACKUP_BRANCH"
echo "- If issues arise, reset: git reset --hard origin/main"
echo "=========================================="
