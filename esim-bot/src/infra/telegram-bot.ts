import { TelegramClient } from "../../../packages/telegram-client";
import { 
  getConversationState, 
  setConversationState, 
  clearConversationState, 
  initializeConversationState 
} from "./conversation-state";
import * as Views from "../views/telegram-views";
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
						// In a PoC implementation, this shows the confirmation view
						await Views.showPurchaseConfirmation(client, chatId);
					} else if (callbackData === "my_orders") {
						await Views.showMyOrders(client, chatId);
					} else if (callbackData === "help") {
						await Views.showHelp(client, chatId);
					} else if (callbackData === "show_esim_info") {
						await Views.showESimInfo(client, chatId);
					} else if (callbackData === "esim_settings_help") {
						// In a PoC implementation, this would provide eSIM setup instructions
						await Views.showESimInfo(client, chatId);
					} else if (callbackData === "repeat_order") {
						// In a PoC implementation, this would show popular plans to encourage re-purchase
						await Views.showPopularPlans(client, chatId);
					} else if (callbackData === "back_to_main") {
						clearConversationState(chatId);
						await Views.showMainMenu(client, chatId);
					} else if (callbackData.startsWith("prev_plan_")) {
						// Extract country and current index from callback data
						const parts = callbackData.split("_");
						if (parts.length >= 4) { // prev_plan_country_index
							const country = parts[2];
							const currentIndex = parseInt(parts[3]);
							// We'll handle the navigation in the view
							await Views.showCountryESimOptions(client, chatId, country, messageId, currentIndex - 1);
						}
					} else if (callbackData.startsWith("next_plan_")) {
						// Extract country and current index from callback data
						const parts = callbackData.split("_");
						if (parts.length >= 4) { // next_plan_country_index
							const country = parts[2];
							const currentIndex = parseInt(parts[3]);
							// We'll handle the navigation in the view
							await Views.showCountryESimOptions(client, chatId, country, messageId, currentIndex + 1);
						}
					} else if (callbackData.startsWith("add_to_compare_")) {
						const planId = callbackData.replace("add_to_compare_", "");
						// This will be handled by a new function to add to comparison list
						await Views.addToComparison(client, chatId, planId);
					} else if (callbackData === "start_comparison") {
						// Show the comparison view
						await Views.showComparisonView(client, chatId);
					} else if (callbackData === "clear_comparison") {
						// Clear the comparison list
						await Views.clearComparison(client, chatId);
					}

					client.answerCallbackQuery({
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
