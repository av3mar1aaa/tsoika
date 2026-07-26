#!/usr/bin/env bash
# Деплой со сборкой на своей машине — для VPS с 1 ГБ RAM,
# где `next build` (пик ~780 МБ) не помещается.
#
# Запускать ЛОКАЛЬНО из корня проекта:
#   SERVER=tsoika@1.2.3.4 ./deploy/deploy-from-local.sh
#
# На сервер уезжает готовый .next и public; там выполняется только
# `npm ci --omit=dev` (без компиляции, sharp ставится готовым бинарником)
# и перезапуск сервиса. Пик памяти на сервере — те же ~120 МБ.
set -euo pipefail

: "${SERVER:?Укажите SERVER=пользователь@хост}"
APP_DIR=${APP_DIR:-/srv/tsoika}

echo "==> сборка локально"
npm run build

echo "==> код на сервер"
# Сборка платформозависима только в части node_modules, их не копируем.
git push
ssh "$SERVER" "cd $APP_DIR && git pull --ff-only && npm ci --omit=dev"

echo "==> артефакты сборки на сервер"
rsync -az --delete .next/ "$SERVER:$APP_DIR/.next/"
rsync -az --delete public/ "$SERVER:$APP_DIR/public/"

echo "==> перезапуск"
ssh "$SERVER" "sudo systemctl restart tsoika"

sleep 3
ssh "$SERVER" "systemctl is-active --quiet tsoika" || {
  echo "==> ОШИБКА, логи:"
  ssh "$SERVER" "journalctl -u tsoika -n 40 --no-pager"
  exit 1
}
ssh "$SERVER" "curl -fsS -o /dev/null -w '==> healthcheck / -> %{http_code}\n' http://127.0.0.1:3000/"
