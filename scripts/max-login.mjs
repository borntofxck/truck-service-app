import { chromium } from "playwright";
import dotenv from "dotenv";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

dotenv.config();

const sessionDir = path.resolve(process.env.MAX_SESSION_DIR || ".max-session");
const maxWebUrl = process.env.MAX_WEB_URL || "https://web.max.ru/";

const rl = readline.createInterface({ input, output });

console.log("Открываю браузер MAX для сохранения сессии.");
console.log("1. Войдите в аккаунт MAX.");
console.log("2. Откройте чат, куда должны приходить заявки.");
console.log("3. Скопируйте URL этого чата в MAX_WEB_CHAT_URL в .env.");
console.log("4. Вернитесь в терминал и нажмите Enter.");

const context = await chromium.launchPersistentContext(sessionDir, {
  headless: false,
  viewport: { width: 1280, height: 900 },
});

const page = context.pages()[0] || (await context.newPage());
await page.goto(maxWebUrl, { waitUntil: "domcontentloaded" });

await rl.question("\nПосле входа и открытия нужного чата нажмите Enter...");

console.log(`\nТекущий URL: ${page.url()}`);
console.log("Если это URL нужного чата, вставьте его в .env как MAX_WEB_CHAT_URL.");

await context.close();
rl.close();
