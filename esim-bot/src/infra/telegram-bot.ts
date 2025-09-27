import { TelegramClient } from "../../../packages/telegram-client";
import { 
  getConversationState, 
  setConversationState, 
  clearConversationState, 
  initializeConversationState 
} from "./conversation-state";
import * as Views from "../views/telegram-views";
import { MessageBuilder } from "./message-builder";
import type { InlineKeyboardMarkup } from "packages/telegram-client/telegram-types";

const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";

export const runBot = async () => {
  if (!BOT_TOKEN || BOT_TOKEN === "YOUR_BOT_TOKEN_HERE") {
    console.error(
      "Ошибка: Не задан токен для телеграм-бота. Укажите его в переменной окружения BOT_TOKEN.",
    );
    return;
  }

  const client = new TelegramClient(BOT_TOKEN);
  let offset = 0;
  console.log("eSIM бот запущен...");

  while (true) {
    try {
      const updates = await client.getUpdates({ offset, timeout: 30 });

      for (const update of updates) {
        offset = update.update_id + 1;

        const message = update.message || update.callback_query?.message;
        const chatId = message?.chat.id;
        if (!chatId) continue;

        const currentState = 
          getConversationState(chatId) || initializeConversationState(chatId);

        if (update.message?.text) {
          const text = update.message.text;
          console.log(`[${chatId}] Received text: "${text}"`);

          if (text === "/start") {
            clearConversationState(chatId);
            await Views.showMainMenu(client, chatId);
          }
        } else if (update.callback_query) {
          const callbackData = update.callback_query.data;
          const from = update.callback_query.from;
          console.log(`[${chatId}] Received callback_data: "${callbackData}"`);

          // Handle callback queries based on current state
          if (callbackData === "show_esim_catalog") {
            await Views.showESimCatalog(client, chatId);
          } else if (callbackData === "show_popular_plans") {
            await Views.showPopularPlans(client, chatId);
          } else if (callbackData.startsWith("select_country_")) {
            const country = callbackData.replace("select_country_", "");
            await Views.showCountryESimOptions(client, chatId, country);
          } else if (callbackData.startsWith("select_plan_")) {
            const planId = callbackData.replace("select_plan_", "");
            await Views.showPlanDetails(client, chatId, planId);
          } else if (callbackData === "purchase_plan") {
            // In a real implementation, this would connect to payment processing
            await Views.showCheckout(client, chatId);
          } else if (callbackData === "my_orders") {
            await Views.showMyOrders(client, chatId);
          } else if (callbackData === "help") {
            await Views.showHelp(client, chatId);
          } else if (callbackData === "show_esim_info") {
            await Views.showESimInfo(client, chatId);
          } else if (callbackData === "repeat_order") {
            // In a real implementation, this would repeat a previous order
            await Views.showESimCatalog(client, chatId);
          } else if (callbackData === "back_to_main") {
            clearConversationState(chatId);
            await Views.showMainMenu(client, chatId);
          }

          await client.answerCallbackQuery({
            callback_query_id: update.callback_query.id,
          });
        }
      }
    } catch (error) {
      console.error("Критическая ошибка в главном цикле бота:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Prevent fast crash loop
    }
  }
};