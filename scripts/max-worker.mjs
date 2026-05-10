import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs/promises";

dotenv.config();

const prisma = new PrismaClient();

const sessionDir = path.resolve(process.env.MAX_SESSION_DIR || ".max-session");
const maxWebUrl = process.env.MAX_WEB_URL || "https://web.max.ru/";
const chatUrl = process.env.MAX_WEB_CHAT_URL;
const pollIntervalMs = Number(process.env.MAX_WORKER_INTERVAL_MS || 8000);
const headless = process.env.MAX_HEADLESS !== "false";
const screenshotDir = path.resolve(
  process.env.MAX_SCREENSHOT_DIR || "max-worker-errors",
);

const inputSelectors = [
  process.env.MAX_MESSAGE_INPUT_SELECTOR,
  '[contenteditable="true"]',
  '[role="textbox"]',
  "textarea",
  'div[aria-label*="Message"]',
  'div[aria-label*="сообщ"]',
].filter(Boolean);

const sendSelectors = [
  process.env.MAX_SEND_BUTTON_SELECTOR,
  'button[aria-label*="Send"]',
  'button[aria-label*="send"]',
  'button[aria-label*="Отправ"]',
  'button[type="submit"]',
].filter(Boolean);

function formatMessage(notification) {
  const request = notification.request;

  return [
    "Новая заявка с сайта",
    "",
    `Имя: ${request.clientName}`,
    `Телефон: ${request.phone}`,
    `Техника: ${request.truckModel}`,
    `Услуга: ${request.service.title}`,
    `Проблема: ${request.problemDescription}`,
  ].join("\n");
}

async function claimNotification() {
  const notification = await prisma.notification.findFirst({
    where: {
      channel: "max_web",
      status: "pending",
    },
    include: {
      request: {
        include: {
          service: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  if (!notification) {
    return null;
  }

  const claimed = await prisma.notification.updateMany({
    where: {
      id: notification.id,
      status: "pending",
    },
    data: {
      status: "processing",
      errorMessage: null,
    },
  });

  return claimed.count === 1 ? notification : null;
}

async function findVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector).last();

    try {
      await locator.waitFor({ state: "visible", timeout: 2500 });
      return locator;
    } catch {
      // Try next selector.
    }
  }

  throw new Error(
    "Не найдено поле ввода сообщения. Укажите MAX_MESSAGE_INPUT_SELECTOR в .env.",
  );
}

async function clickSendButtonIfPresent(page) {
  for (const selector of sendSelectors) {
    const locator = page.locator(selector).last();

    try {
      await locator.waitFor({ state: "visible", timeout: 1000 });
      await locator.click();
      return true;
    } catch {
      // Try next selector.
    }
  }

  return false;
}

async function openChat(page) {
  await page.goto(chatUrl || maxWebUrl, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("domcontentloaded");
}

async function sendMessage(page, text) {
  await openChat(page);

  const input = await findVisibleLocator(page, inputSelectors);
  await input.click();
  await page.keyboard.insertText(text);

  const clickedSend = await clickSendButtonIfPresent(page);

  if (!clickedSend) {
    await page.keyboard.press("Enter");
  }

  await page.waitForTimeout(1200);
}

async function markSent(notificationId) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: "sent",
      sentAt: new Date(),
      errorMessage: null,
    },
  });
}

async function markError(notificationId, error) {
  const message = error instanceof Error ? error.message : String(error);

  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: "error",
      errorMessage: message.slice(0, 1000),
    },
  });
}

async function saveErrorScreenshot(page, notificationId) {
  await fs.mkdir(screenshotDir, { recursive: true });

  const screenshotPath = path.join(
    screenshotDir,
    `notification-${notificationId}-${Date.now()}.png`,
  );

  await page.screenshot({ path: screenshotPath, fullPage: true });
  return screenshotPath;
}

const context = await chromium.launchPersistentContext(sessionDir, {
  headless,
  viewport: { width: 1280, height: 900 },
});

const page = context.pages()[0] || (await context.newPage());

await prisma.notification.updateMany({
  where: {
    channel: "max_web",
    status: "processing",
  },
  data: {
    status: "pending",
    errorMessage: "Возвращено в очередь после перезапуска worker",
  },
});

console.log("MAX worker запущен.");
console.log(`Сессия: ${sessionDir}`);
console.log(`Режим: ${headless ? "headless" : "visible"}`);

if (!chatUrl) {
  console.log(
    "MAX_WEB_CHAT_URL не задан. Worker откроет MAX_WEB_URL и попробует отправлять в текущий чат.",
  );
}

try {
  await openChat(page);
} catch (error) {
  console.warn("Не удалось открыть MAX при старте worker:", error);
}

while (true) {
  const notification = await claimNotification();

  if (!notification) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    continue;
  }

  try {
    await sendMessage(page, formatMessage(notification));
    await markSent(notification.id);
    console.log(`Уведомление #${notification.id} отправлено.`);
  } catch (error) {
    let screenshotPath = "";

    try {
      screenshotPath = await saveErrorScreenshot(page, notification.id);
    } catch {
      // Screenshot is diagnostic only.
    }

    await markError(
      notification.id,
      new Error(
        `${error instanceof Error ? error.message : String(error)}${
          screenshotPath ? ` | screenshot: ${screenshotPath}` : ""
        }`,
      ),
    );

    console.error(`Ошибка отправки #${notification.id}:`, error);
  }
}
