#!/usr/bin/env sh
# Read-only probe for the host-side Ruang proxy. Exit nonzero on failure.
set -eu

ORIGIN="${RUANG_HEALTH_ORIGIN:-http://192.168.10.111:3001}"
TIMEOUT="${RUANG_HEALTH_TIMEOUT:-10}"

body="$(curl --fail --silent --show-error --max-time "$TIMEOUT" "$ORIGIN/api/health")"
printf '%s' "$body" | grep -Eq '"ok"[[:space:]]*:[[:space:]]*true'
