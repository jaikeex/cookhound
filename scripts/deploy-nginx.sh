#!/usr/bin/env bash
#
# Deploy the versioned nginx config (deploy/nginx/) to the droplet.
#
# The repo is the source of truth; this pushes a copy to the server, tests it,
# and reloads ONLY if the test passes. A broken config never goes live.
#
# The remote activate/test/rollback logic is NOT duplicated here — it lives in
# scripts/nginx-activate.sh (shared with the CI deploy job) and is piped to
# the droplet via `bash -s`.
#
# Usage:
#   DROPLET_IP=203.0.113.10 ./scripts/deploy-nginx.sh
#   DROPLET_IP=203.0.113.10 SSH_KEY=ssh/cookhound-digitalocean ./scripts/deploy-nginx.sh
#
set -euo pipefail

# --- config -----------------------------------------------------------------
DROPLET_IP="${DROPLET_IP:-}"
SSH_USER="${SSH_USER:-root}"
SSH_KEY="${SSH_KEY:-ssh/cookhound-digitalocean}"

# Resolve paths relative to the repo root (this script lives in scripts/).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
NGINX_DIR="${REPO_ROOT}/deploy/nginx"

GLOBAL_SRC="${NGINX_DIR}/nginx.conf"
SITE_SRC="${NGINX_DIR}/cookhound.com.conf"
ACTIVATE_SCRIPT="${SCRIPT_DIR}/nginx-activate.sh"

# Staging paths on the droplet; nothing is activated until it tests OK.
# /tmp so the upload itself does not touch /etc/nginx.
GLOBAL_STAGE="/tmp/cookhound-nginx.conf.new"
SITE_STAGE="/tmp/cookhound.com.conf.new"

# --- guards -----------------------------------------------------------------
if [[ -z "${DROPLET_IP}" ]]; then
    echo "error: DROPLET_IP is not set. Usage: DROPLET_IP=<ip> ./scripts/deploy-nginx.sh" >&2
    exit 1
fi

for f in "${GLOBAL_SRC}" "${SITE_SRC}" "${ACTIVATE_SCRIPT}"; do
    if [[ ! -f "${f}" ]]; then
        echo "error: missing file: ${f}" >&2
        exit 1
    fi
done

SSH_TARGET="${SSH_USER}@${DROPLET_IP}"
SSH_OPTS=(-i "${SSH_KEY}")

echo "==> Deploying nginx config to ${SSH_TARGET}"

# --- copy to staging paths --------------------------------------------------
echo "--> Uploading global config -> ${GLOBAL_STAGE}"
scp "${SSH_OPTS[@]}" "${GLOBAL_SRC}" "${SSH_TARGET}:${GLOBAL_STAGE}"

echo "--> Uploading site config   -> ${SITE_STAGE}"
scp "${SSH_OPTS[@]}" "${SITE_SRC}" "${SSH_TARGET}:${SITE_STAGE}"

# --- activate, test, and roll back on failure -------------------------------
echo "--> Validating and activating (broken config is rolled back automatically)"
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" \
    "bash -s -- '${GLOBAL_STAGE}' '${SITE_STAGE}'" <"${ACTIVATE_SCRIPT}"

echo "==> Done. Verify anti-spoofing:"
echo "    curl -H 'X-Forwarded-For: 1.2.3.4' https://cookhound.com/ -I"
echo "    (the recorded IP in logs/consent must be your real IP, not 1.2.3.4)"
