#!/usr/bin/env bash
# deploy.sh — run on EC2 to pull and deploy the latest build.
# Usage: bash ~/lexie-frontend/deploy.sh
set -e

REPO_DIR="$HOME/lexie-frontend"
NGINX_ROOT="/var/www/html"

echo "==> Fetching latest from origin..."
git -C "$REPO_DIR" fetch origin main

echo "==> Resetting to origin/main (discards any local changes)..."
git -C "$REPO_DIR" reset --hard origin/main

# Install Node.js 20 via NodeSource if not already present.
if ! command -v node &>/dev/null; then
    echo "==> Node.js not found — installing..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

cd "$REPO_DIR"

echo "==> Installing npm dependencies..."
npm ci

echo "==> Building frontend..."
npm run build

echo "==> Deploying to $NGINX_ROOT..."
sudo mkdir -p "$NGINX_ROOT"
sudo cp -r dist/. "$NGINX_ROOT/"

echo "==> Reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "==> Done! Site is live."
