# Truck Service App

Веб-приложение для грузового автосервиса: лендинг, форма заявки, сохранение заявок в PostgreSQL, админ-панель и MVP-уведомления в MAX через web-worker.

## Что есть в проекте

- Лендинг автосервиса с услугами, ценами, отзывами, картами и SEO.
- Форма заявки с выбором услуги.
- API `POST /api/requests` для создания заявки.
- PostgreSQL + Prisma.
- Админ-панель `/admin` для просмотра заявок и смены статуса.
- Вход администратора через базу данных, хэш пароля и cookie-сессию.
- MAX web-worker на Playwright для отправки уведомлений в чат.
- `robots.txt`, `sitemap.xml`, OpenGraph/Twitter metadata, страница `/privacy`.

## Стек

- Next.js App Router
- React
- TypeScript
- Prisma
- PostgreSQL
- Playwright
- Tailwind CSS

## Быстрый старт

```bash
npm install
npx prisma generate
npm run dev
```

Приложение откроется на:

```text
http://localhost:3000
```

## Переменные окружения

Создайте `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Основные переменные:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/truck_service_db"
ADMIN_LOGIN="admin"
ADMIN_PASSWORD="replace-with-strong-password"
ADMIN_SESSION_SECRET="replace-with-random-session-secret"

MAX_WEB_URL="https://web.max.ru/"
MAX_WEB_CHAT_URL="https://web.max.ru/445055049"
MAX_SESSION_DIR="C:\\Users\\Getsu\\truck-service-max-session"
MAX_HEADLESS="false"
MAX_WORKER_INTERVAL_MS="8000"
```

Настоящий `.env` нельзя коммитить в git.

## База данных

Применить Prisma schema к PostgreSQL:

```bash
npx prisma db push
```

Сгенерировать Prisma Client:

```bash
npx prisma generate
```

## Админка

Админ-панель открывается по адресу:

```text
http://localhost:3000/admin
```

Если в таблице `admins` нет пользователей, приложение предложит создать первого администратора на странице `/admin/setup`. Дальше вход выполняется через `/admin/login`, пароль хранится в базе в виде хэша.

## MAX worker

Уведомления отправляются не внутри HTTP-запроса, а отдельным worker-процессом.

Сохранить сессию MAX:

```bash
npx playwright install chromium
npm run max:login
```

После входа в MAX откройте нужный чат, скопируйте его URL и укажите:

```env
MAX_WEB_CHAT_URL="https://web.max.ru/..."
```

Запустить worker:

```bash
npm run worker:max
```

Подробности есть в [MAX_WORKER_SETUP.md](./MAX_WORKER_SETUP.md).

## Скрипты

```bash
npm run dev          # локальная разработка
npm run build        # production build
npm run start        # запуск production-сборки
npm run lint         # проверка ESLint
npm run max:login    # вход в MAX и сохранение web-сессии
npm run worker:max   # worker отправки уведомлений в MAX
```

## Продакшен

Минимальный порядок деплоя на VPS:

```bash
npm ci
npx prisma generate
npx prisma db push
npx playwright install --with-deps chromium
npm run build
```

Запуск через PM2:

```bash
pm2 start npm --name truck-site -- start
pm2 start npm --name max-worker -- run worker:max
pm2 save
```

Рекомендуется поставить Nginx и SSL через Certbot.

## Важно для git

В репозиторий не должны попадать:

- `.env`
- `.max-session/`
- `node_modules/`
- `.next/`
- `max-worker-errors/`
- логи worker/dev-сервера
