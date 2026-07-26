#!/usr/bin/env bash
# Деплой на сервере: забрать код, собрать, перезапустить.
#   ssh tsoika@server '/srv/tsoika/deploy/deploy.sh'
set -euo pipefail

APP_DIR=${APP_DIR:-/srv/tsoika}
cd "$APP_DIR"

echo "==> git pull"
git pull --ff-only

echo "==> npm ci"
npm ci

echo "==> build"
npm run build

echo "==> restart"
sudo systemctl restart tsoika

sleep 3
systemctl is-active --quiet tsoika && echo "==> tsoika запущен" || {
  echo "==> ОШИБКА, логи:"
  journalctl -u tsoika -n 40 --no-pager
  exit 1
}

curl -fsS -o /dev/null -w "==> healthcheck / -> %{http_code}\n" http://127.0.0.1:3000/
