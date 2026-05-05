# MAX web worker setup

Этот MVP отправляет уведомления в MAX через веб-интерфейс с помощью Playwright.
Сайт не ждет отправку сообщения: заявка сохраняется в БД, уведомление получает
статус `pending`, а отдельный worker отправляет его в MAX.

## Локальная настройка

1. Установить браузеры Playwright:

```bash
npx playwright install chromium
```

2. Открыть отдельный браузер для MAX и сохранить сессию:

```bash
npm run max:login
```

3. В открывшемся окне войти в MAX, открыть чат руководителя или группу для
заявок и скопировать текущий URL.

4. Вставить URL в `.env`:

```env
MAX_WEB_URL="https://web.max.ru/"
MAX_WEB_CHAT_URL="сюда-url-открытого-чата"
MAX_SESSION_DIR="C:\\Users\\Getsu\\truck-service-max-session"
MAX_HEADLESS="false"
```

5. Запустить worker:

```bash
npm run worker:max
```

Если сообщение не отправляется, worker сохранит скриншот в `max-worker-errors/`.
В этом случае обычно нужно уточнить селектор поля ввода или кнопки отправки:

```env
MAX_MESSAGE_INPUT_SELECTOR="[contenteditable='true']"
MAX_SEND_BUTTON_SELECTOR="button[aria-label*='Send']"
```

На Windows лучше хранить `MAX_SESSION_DIR` в пути без кириллицы и OneDrive,
например `C:\Users\Getsu\truck-service-max-session`. Chromium может закрываться
сразу, если профиль лежит в проблемном пути.

## VPS

Минимальный порядок:

```bash
npm ci
npx prisma generate
npx prisma db push
npx playwright install --with-deps chromium
npm run build
```

На VPS нужно один раз выполнить логин в MAX. Если сервер без графического
интерфейса, удобнее временно запустить login-скрипт через Xvfb или выполнить
логин локально и перенести папку `.max-session` на сервер.

Запуск через pm2:

```bash
pm2 start npm --name truck-site -- start
pm2 start npm --name max-worker -- run worker:max
pm2 save
```

Для прода обязательно задать надежные значения:

```env
DATABASE_URL="postgresql://..."
ADMIN_LOGIN="..."
ADMIN_PASSWORD="..."
MAX_WEB_CHAT_URL="..."
MAX_HEADLESS="true"
```
