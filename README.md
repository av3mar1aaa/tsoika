# Цойка

Сайт-витрина домашней кондитерской с админ-панелью для добавления десертов и рецептов.

## Быстрый старт

```bash
# 1. Установить зависимости (уже выполнено)
npm install

# 2. Сгенерировать пароль админа и секрет сессии
npm run set-password -- "мой-пароль-123"
# → скопируйте три строки в файл .env.local (создайте из .env.local.example)

# 3. (Опционально) Засеять примерами
npm run seed

# 4. Запустить dev-сервер
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000). Админка — [/admin/login](http://localhost:3000/admin/login).

## Структура

- `app/` — страницы (App Router)
  - `page.tsx` — главная с сеткой десертов
  - `catalog/page.tsx` — каталог
  - `products/[id]/page.tsx` — страница десерта с рецептами
  - `admin/login/` — вход
  - `admin/(panel)/` — дашборд, создание и редактирование
  - `api/admin/` — REST-эндпоинты для CRUD
- `lib/` — доступ к БД, авторизация, загрузка файлов
- `components/` — React-компоненты (публичные и `admin/`)
- `proxy.ts` — защита `/admin/*` и `/api/admin/*` (аналог middleware в Next 16)
- `data/app.db` — SQLite база (создаётся автоматически, в git не попадает)
- `deploy/` — systemd-юниты, nginx, скрипт деплоя и [инструкция по переезду](deploy/README.md)
- `scripts/` — утилиты (см. ниже)

## Хранение данных

- **База** — SQLite-файл. Путь берётся из `DATABASE_PATH`, по умолчанию `data/app.db`.
  Если задан `TURSO_DATABASE_URL`, приложение работает с удалённой базой Turso.
- **Фото и видео** — Yandex Object Storage. В базе хранятся только публичные URL.
  Изображения перед загрузкой прогоняются через sharp: поворот по EXIF,
  вписывание в 1600×1600, WebP q82. Видео заливаются потоком, лимит 100 МБ.

## Переменные окружения (`.env.local`)

Полный список — в [.env.local.example](.env.local.example). Минимум для локального запуска:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt-хеш>
SESSION_SECRET=<минимум 16 символов случайной строки>
YC_ACCESS_KEY_ID=<для загрузки фото>
YC_SECRET_ACCESS_KEY=
YC_BUCKET=
```

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run set-password -- "пароль"` | Генерирует `ADMIN_PASSWORD_HASH` и `SESSION_SECRET` |
| `npm run seed` | Засеивает примерами |
| `npm run dump-turso [-- путь] [--force]` | Копирует базу Turso в локальный SQLite-файл со сверкой счётчиков |
| `npm run audit-media [-- --fix] [--delete-orphans]` | Сверяет ссылки в БД с бакетом: битые ссылки и файлы-сироты |
| `npm run backfill-image-dims` | Дозаполняет `image_width/height` у товаров |
| `npm run backfill-categories` | Расставляет категории по названию и рецепту |
| `npm run backup-db` | Снимок базы + gzip + выгрузка в бакет (запускается по таймеру на сервере) |

## Продакшен

```bash
npm run build
npm run start
```

Разворачивание на VPS — [deploy/README.md](deploy/README.md). База должна лежать
на персистентном диске вне каталога с кодом (`DATABASE_PATH=/var/lib/tsoika/app.db`).
