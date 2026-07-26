# Переезд на российский VPS

Netlify (бесплатный) + Turso (США, Орегон) → VPS в Москве + локальный SQLite.
Object Storage остаётся в Yandex Cloud — он уже российский.

**Ориентир по стоимости:** VDS ~880 ₽/мес (2 CPU / 2 ГБ / 40 ГБ NVMe, годовая оплата),
домен `.ru` ~250 ₽/год, Object Storage ~0 ₽ (база 1.6 МБ + фото 28 МБ).

Меньше 2 ГБ RAM не берите: `next build` со `sharp` на 1 ГБ уходит в OOM.
Хостинг обязательно **VDS с диском**, не «App Platform» — там эфемерная
файловая система и SQLite-файл будет стираться каждым деплоем.

---

## 1. Сервер

Ubuntu 24.04. Под root:

```bash
apt update && apt install -y curl git nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs

adduser --system --group --home /srv/tsoika tsoika
mkdir -p /srv/tsoika /var/lib/tsoika
chown -R tsoika:tsoika /srv/tsoika /var/lib/tsoika
```

2 ГБ RAM для сборки впритык — добавьте swap:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 2. Код

```bash
sudo -u tsoika git clone <repo-url> /srv/tsoika
cd /srv/tsoika
sudo -u tsoika npm ci
```

## 3. Переменные окружения

Создайте `/srv/tsoika/.env.local` (владелец `tsoika`, права `600`).
Скопируйте значения из старого `.env.local`, но **без `TURSO_DATABASE_URL`
и `TURSO_AUTH_TOKEN`** — их отсутствие переключает приложение на локальный файл.

```
ADMIN_USERNAME=…
ADMIN_PASSWORD_HASH=…
SESSION_SECRET=…

YC_ACCESS_KEY_ID=…
YC_SECRET_ACCESS_KEY=…
YC_BUCKET=tsoika-media
BACKUP_BUCKET=tsoika-backups

TELEGRAM_BOT_TOKEN=…
TELEGRAM_ALLOWED_CHAT_IDS=…
TELEGRAM_WEBHOOK_SECRET=…

SITE_URL=https://tsoika.ru
```

`EnvironmentFile` в systemd не понимает кавычки и `export` — пишите
`КЛЮЧ=значение` без них. Знаки `$` в bcrypt-хеше экранировать **не нужно**
(в отличие от локального `.env.local` для `next dev`).

```bash
chown tsoika:tsoika /srv/tsoika/.env.local && chmod 600 /srv/tsoika/.env.local
```

## 4. База

Локально, с ещё живым Turso в `.env.local`:

```bash
npm run dump-turso -- --force        # -> data/app.db, сверяет счётчики строк
```

Заливаем на сервер (файл ~1.6 МБ):

```bash
scp data/app.db root@СЕРВЕР:/var/lib/tsoika/app.db
ssh root@СЕРВЕР 'chown tsoika:tsoika /var/lib/tsoika/app.db'
```

Путь задаётся переменной `DATABASE_PATH` (см. `tsoika.service`). База лежит
**вне** `/srv/tsoika`, поэтому `git pull` её не затрагивает.

## 5. Сборка и systemd

```bash
sudo -u tsoika bash -c 'cd /srv/tsoika && npm run build'

cp /srv/tsoika/deploy/tsoika.service        /etc/systemd/system/
cp /srv/tsoika/deploy/tsoika-backup.service /etc/systemd/system/
cp /srv/tsoika/deploy/tsoika-backup.timer   /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now tsoika tsoika-backup.timer
systemctl status tsoika
```

## 6. Nginx + HTTPS

Пропишите A-запись домена на IP сервера, дождитесь распространения, затем:

```bash
cp /srv/tsoika/deploy/nginx.conf /etc/nginx/sites-available/tsoika
# замените tsoika.ru на свой домен
ln -sf /etc/nginx/sites-available/tsoika /etc/nginx/sites-enabled/tsoika
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

apt install -y certbot python3-certbot-nginx
certbot --nginx -d tsoika.ru -d www.tsoika.ru
```

Certbot сам допишет `listen 443 ssl` и редирект с 80. Автопродление уже
включено таймером `certbot.timer`.

## 7. Telegram-вебхук

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://tsoika.ru/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"

curl -s "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

В ответе `getWebhookInfo` должно быть новое `url` и пустое `last_error_message`.

## 8. Проверка

```bash
curl -I https://tsoika.ru/
curl -s https://tsoika.ru/catalog | grep -c 'products/'
curl -s https://tsoika.ru/sitemap.xml | head -5     # должен быть свой домен
```

Зайдите в `/admin/login`, откройте товар на редактирование, загрузите фото и
видео — так проверяется и запись в базу, и Object Storage, и лимит
`client_max_body_size`. Отправьте боту фото с подписью — проверится вебхук.

## 9. Выключить старое

Только после того как новый домен отработал сутки:

- Netlify: Site settings → Danger zone → удалить сайт (или снять авто-деплой).
- Turso: база уже не используется. Держите её месяц как аварийную копию,
  потом удалите.
- Токен Turso после выключения — отозвать.

---

## Дальше: обновления

```bash
ssh tsoika@СЕРВЕР '/srv/tsoika/deploy/deploy.sh'
```

Скрипту нужен `sudo systemctl restart tsoika` без пароля:

```
# /etc/sudoers.d/tsoika
tsoika ALL=(root) NOPASSWD: /usr/bin/systemctl restart tsoika
```

## Бэкапы

Заранее создайте в консоли Yandex Cloud **отдельный бакет** `tsoika-backups`
с доступом **«Ограниченный»** (не публичный) и пропишите его в `BACKUP_BUCKET`.
Класть дампы в `tsoika-media` нельзя: тот бакет открыт на публичное чтение,
и базу скачал бы любой, кто угадает дату в имени файла. Скрипт откажется
работать, если `BACKUP_BUCKET` не задан или совпадает с `YC_BUCKET`.

`tsoika-backup.timer` каждую ночь в 03:30 UTC делает `VACUUM INTO`, жмёт gzip
и кладёт в бакет как `backups/app-ГГГГ-ММ-ДД-ЧЧММ.db.gz` (~290 КБ). Копии
старше 14 дней удаляются (`BACKUP_RETENTION_DAYS`).

Проверить руками:

```bash
systemctl start tsoika-backup && journalctl -u tsoika-backup -n 20 --no-pager
```

Восстановление:

```bash
systemctl stop tsoika
# копию из приватного бакета качать через консоль Yandex Cloud или yc CLI
gunzip -c app-2026-07-26-0330.db.gz > /var/lib/tsoika/app.db
chown tsoika:tsoika /var/lib/tsoika/app.db
systemctl start tsoika
```

## Логи

```bash
journalctl -u tsoika -f
journalctl -u tsoika --since '1 hour ago' | grep -i error
```

## Обслуживание

Сверка ссылок в базе с содержимым бакета:

```bash
npm run audit-media                              # отчёт
npm run audit-media -- --fix                     # чинит битые ссылки
npm run audit-media -- --fix --delete-orphans    # + чистит файлы-сироты
```
