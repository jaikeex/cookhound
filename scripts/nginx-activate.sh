#!/usr/bin/env bash
#
# Activate an nginx config on THIS machine: back up the live files, copy the
# new ones into place, run `nginx -t`, and reload only if the test passes.
#
# On failure the previous state is fully restored — including the first-deploy
# case where no site config existed yet: the broken site file and its
# sites-enabled symlink are REMOVED (there is nothing to restore), so a broken
# config is never left on disk to break the next reload or reboot.
#
# This is the single source of truth for the activate/test/rollback logic.
# It is executed:
#   - on the droplet by the CI deploy job, from the /cookhound checkout
#   - over ssh by scripts/deploy-nginx.sh (piped via `bash -s`)
#
# Usage:
#   nginx-activate.sh <global-nginx.conf-src> <site-conf-src>
#
set -euo pipefail

GLOBAL_SRC="${1:?usage: nginx-activate.sh <global-src> <site-src>}"
SITE_SRC="${2:?usage: nginx-activate.sh <global-src> <site-src>}"

GLOBAL_DEST=/etc/nginx/nginx.conf
SITE_DEST=/etc/nginx/sites-available/cookhound.com
SITE_LINK=/etc/nginx/sites-enabled/cookhound.com

SUDO=''
if [ "$(id -u)" -ne 0 ]; then SUDO='sudo'; fi

for f in "${GLOBAL_SRC}" "${SITE_SRC}"; do
    if [ ! -f "${f}" ]; then
        echo "error: missing config file: ${f}" >&2
        exit 1
    fi
done

# --- back up the live files ---------------------------------------------------
$SUDO cp -a "${GLOBAL_DEST}" "${GLOBAL_DEST}.bak"

SITE_EXISTED=0
if [ -f "${SITE_DEST}" ]; then
    SITE_EXISTED=1
    $SUDO cp -a "${SITE_DEST}" "${SITE_DEST}.bak"
fi

# --- activate -------------------------------------------------------------------
$SUDO cp "${GLOBAL_SRC}" "${GLOBAL_DEST}"
$SUDO cp "${SITE_SRC}" "${SITE_DEST}"
$SUDO ln -sf "${SITE_DEST}" "${SITE_LINK}"

# --- test, then reload or roll back ---------------------------------------------
if $SUDO nginx -t; then
    $SUDO systemctl reload nginx
    echo "nginx reloaded"
else
    echo "nginx -t failed — restoring previous config" >&2
    $SUDO mv "${GLOBAL_DEST}.bak" "${GLOBAL_DEST}"

    if [ "${SITE_EXISTED}" -eq 1 ]; then
        $SUDO mv "${SITE_DEST}.bak" "${SITE_DEST}"
    else
        # First deploy: no previous site config to restore — remove the broken
        # file and its symlink so nothing dangling survives the failure.
        $SUDO rm -f "${SITE_DEST}" "${SITE_LINK}"
    fi
    exit 1
fi
