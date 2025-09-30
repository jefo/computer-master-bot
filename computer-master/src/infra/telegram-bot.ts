import {
	getConversationState,
	setConversationState,
	clearConversationState,
	initializeConversationState,
} from "./conversation-state";
import * as Views from "../views/telegram-views";
import { MessageBuilder } from "./message-builder";
import { showPricesUseCase } from "../app/show-prices.use-case";
import { TelegramClient } from "@tg/telegram-client";

const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";
const MASTER_CHAT_ID = process.env.MASTER_CHAT_ID;

export const runBot = async () => {
	if (!BOT_TOKEN || BOT_TOKEN === "YOUR_BOT_TOKEN_HERE") {
		console.error(
			"Ошибка: Не задан токен для телеграм-бота. Укажите его в переменной окружения BOT_TOKEN.",
		);
		return;
	}
	if (!MASTER_CHAT_ID) {
		console.warn(
			"Внимание: Не задан MASTER_CHAT_ID. Экстренные заявки не будут отправляться мастеру.",
		);
	}

	const client = new TelegramClient(BOT_TOKEN);
	let offset = 0;
	console.log("Бот запущен...");

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
				} else if (
					update.message?.contact &&
					currentState.step === "ASK_PHONE"
				) {
					const phone = update.message.contact.phone_number;
					const name =
						`${update.message.from.first_name} ${update.message.from.last_name || ""}`.trim();

					const summary = new MessageBuilder()
							.addSuccess("Заявка принята!")
							.newLine(2)
							.addText(
								"Спасибо! Мы получили вашу заявку и скоро свяжемся с вами для подтверждения.",
							)
							.newLine(2)
							.addSectionTitle("Детали заявки")
							.newLine()
							.addServicesList((currentState.selectedItems || []).map(item => item.name))
							.addBookingDateTime(currentState.selectedDate || "", currentState.selectedTime || "")
							.addContactInfo(name, phone)
							.build();

					await client.sendMessage({
						chat_id: chatId,
						text: summary,
						parse_mode: "MarkdownV2",
						reply_markup: { remove_keyboard: true },
					});
					clearConversationState(chatId);
				} else if (update.callback_query) {
					const callbackData = update.callback_query.data;
					const from = update.callback_query.from;
					console.log(`[${chatId}] Received callback_data: "${callbackData}"`);

					if (callbackData === "emergency_help") {
						clearConversationState(chatId);
						const messageIdToEdit = update.callback_query.message?.message_id;
						await Views.showSelectionScreen(
							client,
							chatId,
							"emergency",
							messageIdToEdit,
						);
					} else if (callbackData === "show_prices") {
						const priceList = await showPricesUseCase();
						const builder = new MessageBuilder()
							.addTitle("🛠 Наши услуги")
							.newLine(2);
						priceList.forEach((item) => {
							builder
								.addRawText(
									`*${MessageBuilder.escapeMarkdownV2(item.name)}* \- ${MessageBuilder.escapeMarkdownV2(String(item.price))} руб`,
								)
								.newLine()
								.addText(item.description)
								.newLine(2);
						});
						await client.sendMessage({
							chat_id: chatId,
							text: builder.build(),
							parse_mode: "MarkdownV2",
						});
					} else {
						const messageId = currentState.messageId;
						if (!messageId) {
							await client.answerCallbackQuery({
								callback_query_id: update.callback_query.id,
								text: "Ошибка сессии. Начните заново с /start",
								show_alert: true,
							});
							continue;
						}

						if (callbackData.startsWith("select_item_")) {
							const itemId = callbackData.replace("select_item_", "");
							const flowType = currentState.flowType;
							if (currentState.step === "SELECT_ITEMS" && flowType) {
								const allItems =
									flowType === "emergency"
										? Views.getEmergencyProblems()
										: await Views.getServices();
								const selectedItem = allItems.find((i) => i.id === itemId);
								if (selectedItem) {
									const currentItems = currentState.selectedItems || [];
									const itemIndex = currentItems.findIndex(
										(i) => i.id === itemId,
									);
									const newItems =
										itemIndex > -1
											? currentItems.filter((i) => i.id !== itemId)
											: [...currentItems, selectedItem];
									setConversationState(chatId, {
										...currentState,
										selectedItems: newItems,
									});
									await Views.showSelectionScreen(
										client,
										chatId,
										flowType,
										messageId,
									);
								}
							}
						} else if (callbackData === "selection_next") {
						if (
							currentState.step === "SELECT_ITEMS" &&
							currentState.selectedItems &&
							currentState.selectedItems.length > 0
						) {
							// For emergency flow, skip the confirmation step and go directly to date selection
							if (currentState.flowType === "emergency") {
								await Views.showDateSelectionScreen(client, chatId, messageId);
							} else {
								await Views.showReviewScreen(client, chatId, messageId);
							}
						} else {
							await client.answerCallbackQuery({
								callback_query_id: update.callback_query.id,
								text: "Пожалуйста, выберите хотя бы один пункт.",
								show_alert: true,
							});
						}
					} else if (callbackData === "selection_edit") {
							if (
								currentState.step === "REVIEW_SELECTION" &&
								currentState.flowType
							) {
								await Views.showSelectionScreen(
									client,
									chatId,
									currentState.flowType,
									messageId,
								);
							}
						} else if (callbackData === "confirm_selection") {
							if (currentState.step === "REVIEW_SELECTION") {
								await Views.showDateSelectionScreen(client, chatId, messageId);
							}
						} else if (callbackData === "book_now") {
							if (currentState.step === "ASK_DATE" && MASTER_CHAT_ID) {
								const masterMessage = new MessageBuilder()
									.addWarning("НОВАЯ ЭКСТРЕННАЯ ЗАЯВКА (СЕЙЧАС)")
									.newLine(2)
									.addDetail(
										"От", 
										`${MessageBuilder.escapeMarkdownV2(from.first_name)}${from.last_name ? ` ${MessageBuilder.escapeMarkdownV2(from.last_name)}` : ""} (@${from.username}, ID: ${from.id})`
									)
									.newLine(2)
									.addSectionTitle("Проблемы", "🛠")
									.newLine();

								(currentState.selectedItems || []).forEach((p) => {
									masterMessage.addListItem(p.name);
								});

								const masterKeyboard: InlineKeyboardMarkup = {
									inline_keyboard: [
										[
											{
												text: "💬 Связаться с клиентом",
												url: `tg://user?id=${from.id}`,
											},
										],
									],
								};

								await client.sendMessage({
									chat_id: MASTER_CHAT_ID,
									text: masterMessage.build(),
									parse_mode: "MarkdownV2",
									reply_markup: masterKeyboard,
								});

								await client.editMessageText({
									chat_id: chatId,
									message_id: messageId,
									text: "✅ Спасибо! Ваша заявка принята. Мастер свяжется с вами в ближайшее время.",
									parse_mode: "MarkdownV2",
								});
								clearConversationState(chatId);
							} else if (!MASTER_CHAT_ID) {
								await client.answerCallbackQuery({
									callback_query_id: update.callback_query.id,
									text: "Ошибка: Невозможно отправить заявку мастеру.",
									show_alert: true,
								});
							}
						} else if (callbackData.startsWith("book_date_")) {
							const date = callbackData.replace("book_date_", "");
							setConversationState(chatId, {
								...currentState,
								selectedDate: date,
							});
							await Views.showTimeSelectionScreen(client, chatId, messageId);
						} else if (callbackData.startsWith("book_time_")) {
							const time = callbackData.replace("book_time_", "");
							setConversationState(chatId, {
								...currentState,
								step: "ASK_PHONE",
								selectedTime: time,
							});
							await client.editMessageText({
								chat_id: chatId,
								message_id: messageId,
								text: "Для подтверждения бронирования, пожалуйста, поделитесь вашим номером телефона.",
							});
							await client.sendMessage({
								chat_id: chatId,
								text: "Нажмите на кнопку ниже, чтобы поделиться контактом 👇",
								reply_markup: {
									keyboard: [
										[
											{
												text: "📱 Поделиться номером",
												request_contact: true,
											},
										],
									],
									resize_keyboard: true,
									one_time_keyboard: true,
								},
							});
						} else if (callbackData === "cancel_flow") {
							await client.editMessageText({
								chat_id: chatId,
								message_id: messageId,
								text: "❌ Действие отменено. Вы можете начать заново.",
								parse_mode: "MarkdownV2",
							});
							clearConversationState(chatId);
						}
					}
					await client.answerCallbackQuery({
						callback_query_id: update.callback_query.id,
					});
				}
			}
		} catch (error) {
			console.error("Критическая ошибка в главном цикле бота:", error);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}
};
