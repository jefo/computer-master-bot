
import { TelegramClient } from "@bot-machine/telegram-client";
import { Router, session, FlowController } from "@bot-machine/telegram-sdk";
import { purchaseFlow } from "./flows/purchase.flow";

async function main() {
  // 1. Инициализация клиента Telegram
  if (!process.env.BOT_TOKEN) {
    throw new Error("BOT_TOKEN must be provided!");
  }
  const client = new TelegramClient(process.env.BOT_TOKEN);

  // 2. Инициализация роутера
  const router = new Router();

  // 3. Подключение Middleware для сессий
  // Используем сессии в памяти по умолчанию
  console.log("Using in-memory session storage.");
  router.use(session());

  // 4. Регистрация диалоговых флоу
  const purchaseFlowController = new FlowController(purchaseFlow.config, purchaseFlow.name);
  router.addFlow(purchaseFlowController);

  // 5. Регистрация stateless-команд
  router.onCommand("start", async (ctx) => {
    // Запускаем флоу покупки при старте
    await ctx.enterFlow(purchaseFlow.name, "selectPlan");
  });

  router.onCommand("help", async (ctx) => {
    await ctx.reply("Этот бот продает VPN. Введите /start, чтобы начать.");
  });

  // 6. Запуск бота
  console.log("Bot starting...");
  client.startPolling(router);
}

main().catch(console.error);

// Graceful shutdown
process.once('SIGINT', () => {
    // TODO: Find out how to gracefully stop the client
    console.log('Stopping bot...');
    process.exit(0);
});
process.once('SIGTERM', () => {
    // TODO: Find out how to gracefully stop the client
    console.log('Stopping bot...');
    process.exit(0);
});
