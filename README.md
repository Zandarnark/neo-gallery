# NeoGallery

NeoGallery подготовлен для деплоя на Render или Vercel с Supabase как базой данных и файловым хранилищем.

## Локальный запуск

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env.local` на основе `.env.example`.

Минимально нужны такие переменные:

```env
JWT_SECRET=change-me-to-a-long-random-string
ADMIN_EMAIL=admin@neogallery.local
ADMIN_PASSWORD=admin123456
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=neogallery
```

3. Запустить проект:

```bash
npm run dev
```

4. Открыть `http://localhost:3000`

## Подготовка Supabase

1. Создай проект в Supabase
2. Выполни SQL из `supabase/schema.sql`
3. Создай storage bucket `neogallery` или укажи свое имя в `SUPABASE_STORAGE_BUCKET`
4. Добавь первого администратора вручную в таблицу `users` или используй сид-скрипт проекта

## Что нужно перенести в Supabase

- таблицы из `supabase/schema.sql`
- изображения в Supabase Storage
- пользователей, выставки, работы, билеты и заказы

## Что уже работает

- регистрация и вход без Supabase
- роли `visitor`, `artist`, `admin`
- автоматическое создание первого администратора
- Supabase Postgres как основная база
- серверная корзина для авторизованных пользователей
- заказы с mock-оплатой
- избранное
- админка с управлением ролями, выставками и работами

## Важно

- для гостей корзина хранится локально в браузере
- для авторизованных пользователей корзина синхронизируется через Supabase
- платежи сейчас только тестовые заглушки

## Деплой

### Render

1. Подключи GitHub-репозиторий
2. Build Command:

```bash
npm install && npm run build
```

3. Start Command:

```bash
npm run start
```

4. Добавь все переменные окружения из `.env.example`

### Vercel

1. Импортируй проект в Vercel
2. Добавь переменные окружения из `.env.example`
3. Убедись, что схема и storage уже созданы в Supabase
