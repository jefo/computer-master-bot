import { TelegramClient } from "packages/telegram-client"; // Corrected import path
import {
	getConversationState,
	setConversationState,
	clearConversationState,
	initializeConversationState,
	ConversationState,
} from "./conversation-state";
import {
	InlineKeyboardMarkup,
	ReplyKeyboardMarkup,
} from "packages/telegram-client/telegram-types";
import { showPricesUseCase } from "@src/app/show-prices.use-case";

const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";

/**
 * Экранирует специальные символы для Telegram MarkdownV2.
 * @param text Текст для экранирования.
 */
const escapeMarkdownV2 = (text: string | number): string => {
	const textStr = String(text);
	// Список зарезервированных символов в MarkdownV2
	const reservedChars = /[_*\[\]()~`>#+\-=|{}.!\\]/g; // FIXED: Added backslash to be escaped
	return textStr.replace(reservedChars, "\\$&");
};

// --- Emergency Problems (Hardcoded for now) ---
const emergencyProblems = [
	{ id: "no_power", text: "Компьютер не включается" },
	{ id: "bsod", text: "Синий экран смерти" },
	{ id: "virus_slow", text: "Вирусы / Медленная работа" },
	{ id: "no_internet", text: "Нет интернета" },
	{ id: "other", text: "Другая проблема" },
];

// --- Simulate Master Status ---
const getMasterStatus = (): string => {
	// For now, hardcode a status. In a real app, this would be dynamic.
	const statuses = [
		"свободен",
		"освободится через 15 минут",
		"будет свободен c 10:00",
	];
	return statuses[Math.floor(Math.random() * statuses.length)];
};

export const runBot = async () => {
	if (!BOT_TOKEN || BOT_TOKEN === "YOUR_BOT_TOKEN_HERE") {
		console.error(
			"Ошибка: Не задан токен для телеграм-бота. Укажите его в переменной окружения BOT_TOKEN.",
		);
		return;
	}

	const client = new TelegramClient(BOT_TOKEN);
	let offset = 0;

	console.log("Бот запущен...");

	while (true) {
		try {
			const updates = await client.getUpdates({ offset, timeout: 30 });

			for (const update of updates) {
				offset = update.update_id + 1;
				const chatId =
					update.message?.chat.id || update.callback_query?.message?.chat.id;
				if (!chatId) continue;

				let currentState = getConversationState(chatId);
				if (!currentState) {
					currentState = initializeConversationState(chatId);
				}

				// --- Обработка команд и текстовых сообщений ---
				if (update.message) {
					const messageText = update.message.text;

					if (messageText === "/start") {
						clearConversationState(chatId); // Сбрасываем состояние при /start
						const masterStatus = getMasterStatus();
						const welcomeMessage = escapeMarkdownV2(
							`Привет 👋!\nЯ личный робот-ассистент Мастера Евгения.\nСтатус мастера: *${masterStatus}*\n
							\nГотов помочь с  🩺 диагностикой, 🔧 ремонтом и ⚙ настройкой вашего ПК и интернета (сеть/WiFi).`,
						);
						const replyKeyboard: ReplyKeyboardMarkup = {
							keyboard: [
								[{ text: "Услуги и Цены" }],
								[{ text: "Записаться на Прием" }],
								// [{ text: 'Рассчитать Стоимость' }], // Будущая функция
								// [{ text: 'Связаться с Мастером' }], // Будущая функция
							],
							resize_keyboard: true,
							one_time_keyboard: false,
						};

						await client.sendMessage({
							chat_id: chatId,
							text: welcomeMessage,
							parse_mode: "MarkdownV2",
							reply_markup: replyKeyboard, // Only ReplyKeyboard here
						});

						// Send a second message with the inline keyboard
						const emergencyInlineKeyboard: InlineKeyboardMarkup = {
							inline_keyboard: [
								[
									{
										text: "🚨 Экстренная помощь",
										callback_data: "emergency_help",
									},
								],
							],
						};
						await client.sendMessage({
							chat_id: chatId,
							text: escapeMarkdownV2(
								"Для экстренной помощи, нажмите кнопку ниже:",
							),
							parse_mode: "MarkdownV2",
							reply_markup: emergencyInlineKeyboard,
						});
					} else if (
						messageText === "Услуги и Цены" ||
						messageText === "/prices"
					) {
						const priceList = await showPricesUseCase();
						const formattedPriceList = priceList
							.map((item) => {
								const name = item.name;
								const price = item.price;
								const description = item.description;
								return `*${name}* - ${price} руб\n_${description}_`; // Removed manual escaping
							})
							.join("\n\n");

						await client.sendMessage({
							chat_id: chatId,
							text: escapeMarkdownV2(`*Наши услуги:*\n\n${formattedPriceList}`), // Applied escapeMarkdownV2 to the whole text
							parse_mode: "MarkdownV2",
						});
					} else if (
						messageText === "Записаться на Прием" ||
						messageText === "/book"
					) {
						clearConversationState(chatId);
						setConversationState(chatId, { step: "SELECT_SERVICE" });

						const services = await showPricesUseCase();
						const inlineKeyboardButtons = services.map((service) => [
							{
								text: service.name,
								callback_data: `book_service_${service.id}`,
							},
						]);
						inlineKeyboardButtons.push([
							{ text: "Отмена", callback_data: "cancel_booking" },
						]);

						const inlineKeyboard: InlineKeyboardMarkup = {
							inline_keyboard: inlineKeyboardButtons,
						};

						await client.sendMessage({
							chat_id: chatId,
							text: escapeMarkdownV2(
								"Отлично! Чтобы записаться на прием, пожалуйста, выберите интересующую вас услугу:",
							),
							parse_mode: "MarkdownV2",
							reply_markup: inlineKeyboard,
						});
					} else {
						// Обработка неизвестных текстовых сообщений
						await client.sendMessage({
							chat_id: chatId,
							text: escapeMarkdownV2(
								"Извините, я не понял вашу команду.\nПожалуйста, воспользуйтесь кнопками меню или отправьте /start, чтобы увидеть доступные опции.",
							),
							parse_mode: "MarkdownV2",
						});
					}
				}

				// --- Обработка callback_query (нажатий на Inline кнопки) ---
				if (update.callback_query) {
					const callbackData = update.callback_query.data;
					const messageId = update.callback_query.message?.message_id;

					if (callbackData === "cancel_booking") {
						clearConversationState(chatId);
						await client.editMessageText({
							chat_id: chatId,
							message_id: messageId,
							text: escapeMarkdownV2(
								"Запись отменена. Вы можете начать заново, отправив /start.",
							),
							parse_mode: "MarkdownV2",
						});
						// Отправляем главное меню после отмены
						const replyKeyboard: ReplyKeyboardMarkup = {
							keyboard: [
								[{ text: "Услуги и Цены" }],
								[{ text: "Записаться на Прием" }],
							],
							resize_keyboard: true,
							one_time_keyboard: false,
						};
						await client.sendMessage({
							chat_id: chatId,
							text: escapeMarkdownV2("Чем еще могу помочь?"),
							parse_mode: "MarkdownV2",
							reply_markup: replyKeyboard,
						});
					} else if (callbackData === "emergency_help") {
						clearConversationState(chatId);
						setConversationState(chatId, {
							step: "EMERGENCY_SELECT_PROBLEMS",
							selectedEmergencyProblems: [],
						});

						const problemButtons = emergencyProblems.map((problem) => [
							{
								text: problem.text,
								callback_data: `emergency_problem_${problem.id}`,
							},
						]);
						problemButtons.push([
							{ text: "Далее", callback_data: "emergency_next" },
						]);
						problemButtons.push([
							{ text: "Отмена", callback_data: "cancel_booking" },
						]);

						const inlineKeyboard: InlineKeyboardMarkup = {
							inline_keyboard: problemButtons,
						};

						await client.editMessageText({
							chat_id: chatId,
							message_id: messageId,
							text: escapeMarkdownV2(
								"Мастер свяжется с вами в течение 10 минут, укажите вашу проблему:",
							),
							parse_mode: "MarkdownV2",
							reply_markup: inlineKeyboard,
						});
					} else if (callbackData.startsWith("emergency_problem_")) {
						const problemId = callbackData.replace("emergency_problem_", "");
						const problemText = emergencyProblems.find(
							(p) => p.id === problemId,
						)?.text;

						if (
							problemText &&
							currentState.step === "EMERGENCY_SELECT_PROBLEMS"
						) {
							const currentProblems =
								currentState.selectedEmergencyProblems || [];
							const problemIndex = currentProblems.indexOf(problemId);

							let newProblems: string[];
							if (problemIndex > -1) {
								newProblems = currentProblems.filter((id) => id !== problemId); // Deselect
							} else {
								newProblems = [...currentProblems, problemId]; // Select
							}

							setConversationState(chatId, {
								...currentState,
								selectedEmergencyProblems: newProblems,
							});

							// Re-render the problem selection message to show selected/deselected state
							const updatedProblemButtons = emergencyProblems.map((problem) => {
								const isSelected = newProblems.includes(problem.id);
								return [
									{
										text: `${isSelected ? "✅ " : ""}${problem.text}`,
										callback_data: `emergency_problem_${problem.id}`,
									},
								];
							});
							updatedProblemButtons.push([
								{ text: "Далее", callback_data: "emergency_next" },
							]);
							updatedProblemButtons.push([
								{ text: "Отмена", callback_data: "cancel_booking" },
							]);

							const updatedInlineKeyboard: InlineKeyboardMarkup = {
								inline_keyboard: updatedProblemButtons,
							};

							await client.editMessageReplyMarkup({
								// Use editMessageReplyMarkup to only update buttons
								chat_id: chatId,
								message_id: messageId,
								reply_markup: updatedInlineKeyboard,
							});
						}
					} else if (callbackData === "emergency_next") {
						if (
							currentState.step === "EMERGENCY_SELECT_PROBLEMS" &&
							currentState.selectedEmergencyProblems &&
							currentState.selectedEmergencyProblems.length > 0
						) {
							const selectedProblemTexts =
								currentState.selectedEmergencyProblems.map(
									(id) =>
										emergencyProblems.find((p) => p.id === id)?.text || id,
								);
							const messageToMaster = escapeMarkdownV2(
								`*НОВАЯ ЭКСТРЕННАЯ ЗАЯВКА*\n\nОт пользователя: ${update.callback_query.from.first_name} (ID: ${update.callback_query.from.id})\nВыбранные проблемы:\n- ${selectedProblemTexts.join("\n- ")}\n\nМастер свяжется с вами в ближайшее время.`,
							);

							// TODO: Отправить это сообщение мастеру (например, в отдельный чат или по email)
							console.log("Сообщение мастеру:", messageToMaster); // For now, log to console

							clearConversationState(chatId);
							await client.editMessageText({
								chat_id: chatId,
								message_id: messageId,
								text: escapeMarkdownV2(
									"Спасибо! Ваша заявка на экстренную помощь принята. Мастер свяжется с вами в течение 10 минут.",
								),
								parse_mode: "MarkdownV2",
							});
							// Отправляем главное меню
							const replyKeyboard: ReplyKeyboardMarkup = {
								keyboard: [
									[{ text: "Услуги и Цены" }],
									[{ text: "Записаться на Прием" }],
								],
								resize_keyboard: true,
								one_time_keyboard: false,
							};
							await client.sendMessage({
								chat_id: chatId,
								text: escapeMarkdownV2("Чем еще могу помочь?"),
								parse_mode: "MarkdownV2",
								reply_markup: replyKeyboard,
							});
						} else {
							await client.answerCallbackQuery({
								callback_query_id: update.callback_query.id,
								text: "Пожалуйста, выберите хотя бы одну проблему.",
								show_alert: true,
							});
						}
					} else if (callbackData.startsWith("book_service_")) {
						const serviceId = callbackData.replace("book_service_", "");
						const services = await showPricesUseCase();
						const selectedService = services.find((s) => s.id === serviceId);

						if (selectedService) {
							setConversationState(chatId, {
								...currentState,
								step: "ASK_DATE",
								serviceId: selectedService.id,
								serviceName: selectedService.name,
							});
							await client.editMessageText({
								chat_id: chatId,
								message_id: messageId,
								text: escapeMarkdownV2(
									`Вы выбрали: *${selectedService.name}*.\nНа какую дату вы хотели бы записаться? Пожалуйста, укажите дату в формате ДД.ММ.ГГГГ (например, 25.09.2025).`,
								),
								parse_mode: "MarkdownV2",
							});
						} else {
							await client.editMessageText({
								chat_id: chatId,
								message_id: messageId,
								text: escapeMarkdownV2(
									"Извините, выбранная услуга не найдена. Пожалуйста, попробуйте еще раз.",
								),
								parse_mode: "MarkdownV2",
							});
							setConversationState(chatId, { step: "SELECT_SERVICE" }); // Возвращаем на шаг выбора услуги
						}
					}
					// Всегда отвечаем на callback_query, чтобы убрать "часики" с кнопки
					await client.answerCallbackQuery({
						callback_query_id: update.callback_query.id,
					});
				}
			}
		} catch (error) {
			console.error("Ошибка при получении обновлений:", error);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}
};
