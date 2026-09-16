#!/usr/bin/env bash
#
# release.sh — Push to GitHub; CI builds, deploys, and purges the cache.
#
# The Eleventy build, the GitHub Pages deploy, and the Cloudflare cache purge
# now all run in GitHub Actions (see .github/workflows/deploy.yml), so a
# release is just a push to origin/main.
#
# Usage:
#   ./release.sh              # push to origin/main (no local purge)
#   ./release.sh --purge-now  # also purge the Cloudflare cache immediately
#   ./release.sh --help
#
# Why no default purge? CI purges the cache *after* the Pages deploy, so
# visitors never see the old deployed site with a purged cache. --purge-now is
# only for emergencies (bad cached asset, unsynced cache, nothing else).
#
# For --purge-now you need:
#   CLOUDFLARE_API_TOKEN — Custom API token with Zone -> Cache Purge -> Purge,
#                          scoped to intermynd-instruments.com. There is no
#                          ready-made template for this; use "Create Custom
#                          Token" at:
#                          https://dash.cloudflare.com/profile/api-tokens
#
# The token is read from ./.env (git-ignored) if present, otherwise from the
# environment.

set -euo pipefail

# --- Config -----------------------------------------------------------------

ZONE_ID="3372f90cf6eb9c5a2ab3fd77654b700d"
BRANCH="main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Load .env if present ---------------------------------------------------

if [ -f "${SCRIPT_DIR}/.env" ]; then
  # shellcheck source=/dev/null
  . "${SCRIPT_DIR}/.env"
fi

# --- Flags ------------------------------------------------------------------

PURGE_NOW=false
for arg in "$@"; do
  case "$arg" in
    --purge-now) PURGE_NOW=true ;;
    --no-purge)
      echo "Note: --no-purge is the default — CI purges after deploying."
      ;;
    -h|--help)
      echo "Usage: ./release.sh [--purge-now]"
      echo ""
      echo "  --purge-now  Also purge the Cloudflare cache right now (CI"
      echo "               already purges it after every deploy; use this only"
      echo "               as an escape hatch)."
      exit 0
      ;;
    *)
      echo "Unknown flag: $arg"
      exit 1
      ;;
  esac
done

# --- Pre-flight checks ------------------------------------------------------

if ! git -C "${SCRIPT_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: not inside a git repository."
  exit 1
fi

if [ -n "$(git -C "${SCRIPT_DIR}" status --porcelain)" ]; then
  echo "Warning: working tree has uncommitted changes."
  echo "Commit them before releasing, or they won't be pushed."
  echo ""
  git -C "${SCRIPT_DIR}" status --short
  echo ""
  read -rp "Continue anyway? [y/N] " confirm
  [ "${confirm,,}" = "y" ] || exit 0
fi

# --- Emergency cache purge --------------------------------------------------

purge_cloudflare() {
  if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo "Error: CLOUDFLARE_API_TOKEN is not set."
    echo "At https://dash.cloudflare.com/profile/api-tokens choose"
    echo '"Create Custom Token" and add: Zone -> Cache Purge -> Purge,'
    echo "scoped to intermynd-instruments.com."
    echo ""
    echo "Then export it, or add CLOUDFLARE_API_TOKEN=... to ./.env"
    exit 1
  fi

  echo "Purging Cloudflare cache for intermynd-instruments.com..."

  RESPONSE=$(curl -s --fail-with-body -X POST \
    "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything": true}' 2>&1) || {
    echo "Error: cache purge request failed."
    echo "$RESPONSE"
    exit 1
  }

  if ! echo "$RESPONSE" | grep -q '"success":true'; then
    echo "Error: cache purge was not successful."
    echo "$RESPONSE"
    exit 1
  fi

  echo "Cache purged successfully."
}

if [ "$PURGE_NOW" = true ]; then
  purge_cloudflare
else
  echo "Skipping local purge — CI purges the cache after deploying."
  echo "(Use ./release.sh --purge-now for an immediate manual purge.)"
fi

# --- Push to GitHub ---------------------------------------------------------

echo "Pushing to origin/${BRANCH}..."
git -C "${SCRIPT_DIR}" push origin "${BRANCH}"
echo ""
echo "Done. GitHub Actions will now:"
echo "  1. npm ci && npm run build (Eleventy + Tailwind)"
echo "  2. deploy _site to GitHub Pages"
echo "  3. purge the Cloudflare cache"
echo ""
echo "Follow it at https://github.com/intermynd-instruments/intermynd-instruments.github.io/actions"
