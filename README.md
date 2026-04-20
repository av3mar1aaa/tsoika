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
- `public/uploads/` — загруженные фото (в git не попадают)
- `scripts/` — утилиты: `set-password.ts`, `seed.ts`

## Переменные окружения (`.env.local`)

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt-хеш>
SESSION_SECRET=<минимум 16 символов случайной строки>
```

## Продакшен

```bash
npm run build
npm run start
```

Для продакшена храните `data/app.db` и `public/uploads/` на персистентном томе (не сбрасывайте при деплое).
