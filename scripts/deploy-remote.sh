#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${VPS_DEPLOY_PATH:-/opt/discord-ai-hook}"
BRANCH="${DEPLOY_BRANCH:-main}"

cd "$DEPLOY_PATH"
git fetch origin
git reset --hard "origin/${BRANCH}"
npm ci
npm run build
pm2 reload ecosystem.config.cjs --update-env
echo "Deploy complete: $(git rev-parse --short HEAD)"
