import { TelegramClient } from "packages/telegram-client";
import {
	getConversationState,
	setConversationState,
	clearConversationState,
	initializeConversationState,
	type ConversationState,
	type FlowType,
} from "./conversation-state";
import type {
	InlineKeyboardMarkup,
	ReplyKeyboardMarkup,
} from "packages/telegram-client/telegram-types";
import { showPricesUseCase } from "@src/app/show-prices.use-case";
import { MessageBuilder } from "./message-builder";

const BOT_TOKEN = process.env.BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";
const MASTER_CHAT_ID = process.env.MASTER_CHAT_ID;

// --- Data Sources ---
const getEmergencyProblems = () => [
	{ id: "no_power", name: "🖥 Компьютер не включается" },
	{ id: "bsod", name: "💀 Синий экран смерти" },
	{ id: "virus_slow", name: "🐌 Вирусы / Медленная работа" },
	{ id: "no_internet", name: "🌐 Нет интернета" },
	{ id: "other", name: "❓ Другая проблема" },
];

const getServices = async () => {
	const prices = await showPricesUseCase();
	return prices.map((p) => ({ id: p.id, name: p.name }));
};

// --- Simulate Master Status ---
const getMasterStatus = (): string => {
	const statuses = [
		"свободен",
		"освободится через 15 минут",
		"будет свободен c 10:00",
	];
	return statuses[Math.floor(Math.random() * statuses.length)];
};

// --- Helper Functions ---

const showMainMenu = async (client: TelegramClient, chatId: number) => {
	const masterStatus = getMasterStatus();

	const welcomeMessage = new MessageBuilder()
		.addText("🤖 Здравствуйте! Я личный робот-ассистент Компьютерного Мастера.")
		.newLine(2)
		.addText("Передам вашу заявку незамедлительно! Чего желаете?")
		.newLine(2)
		.addText("💻 Готов помочь с вирусами, ремонтом и настройкой вашего ПК.")
		.build();

	const replyKeyboard: ReplyKeyboardMarkup = {
		keyboard: [[{ text: "Услуги и Цены" }], [{ text: "Записаться на Прием" }]],
		resize_keyboard: true,
	};

	await client.sendMessage({
		chat_id: chatId,
		text: welcomeMessage,
		parse_mode: "MarkdownV2",
		reply_markup: replyKeyboard,
	});

	const emergencyKeyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[{ text: "🆘 Экстренная помощь", callback_data: "emergency_help" }],
		],
	};

	const emergencyMessage = new MessageBuilder()
		.addText("🚨 Если вам нужна экстренная помощь, нажмите кнопку ниже:")
		.build();

	await client.sendMessage({
		chat_id: chatId,
		text: emergencyMessage,
		parse_mode: "MarkdownV2",
		reply_markup: emergencyKeyboard,
	});
};

const showSelectionScreen = async (
	client: TelegramClient,
	chatId: number,
	flowType: FlowType,
	messageId?: number,
) => {
	console.log(
		`showSelectionScreen: chatId=${chatId}, flowType=${flowType}, messageId=${messageId}`,
	);
	const state =
		getConversationState(chatId) || initializeConversationState(chatId);

	const items =
		flowType === "emergency" ? getEmergencyProblems() : await getServices();
	const title =
		flowType === "emergency"
			? "🚨 Укажите вашу проблему (можно выбрать несколько):"
			: "🗓 Выберите интересующую вас услугу (можно выбрать несколько):";

	const selectedIds = new Set(
		state.selectedItems?.map((item) => item.id) || [],
	);

	const itemButtons = items.map((item) => [
		{
			text: `${selectedIds.has(item.id) ? "✅ " : ""}${item.name}`,
			callback_data: `select_item_${item.id}`,
		},
	]);

	const controlButtons = [
		{ text: "Далее", callback_data: "selection_next" },
		{ text: "Отмена", callback_data: "cancel_flow" },
	];
	const inlineKeyboard: InlineKeyboardMarkup = {
		inline_keyboard: [...itemButtons, controlButtons],
	};

	const messagePayload = {
		chat_id: chatId,
		text: new MessageBuilder().addText(title).build(),
		parse_mode: "MarkdownV2" as const,
		reply_markup: inlineKeyboard,
	};

	let sentMessage;
	if (messageId) {
		sentMessage = await client.editMessageText({
			...messagePayload,
			message_id: messageId,
		});
	} else {
		sentMessage = await client.sendMessage(messagePayload);
	}

	setConversationState(chatId, {
		...state,
		step: "SELECT_ITEMS",
		flowType: flowType,
		selectedItems: state.selectedItems || [],
		messageId: sentMessage.message_id,
	});
};

const humanizeSelection = (items: { name: string }[]): string => {
	if (items.length === 0) return "";
	const names = items.map((item) =>
		item.name
			.toLowerCase()
			.replace(/^[\s\S]{2}/, (match) => match.toUpperCase()),
	);
	if (items.length === 1) {
		return `Значит, у вас ${names[0]}`;
	}
	const last = names.pop();
	return `Значит, у вас ${names.join(", ")} и ${last}`;
};

const showReviewScreen = async (
	client: TelegramClient,
	chatId: number,
	messageId: number,
) => {
	console.log(`showReviewScreen: chatId=${chatId}, messageId=${messageId}`);
	const state = getConversationState(chatId);
	if (
		!state ||
		!state.flowType ||
		!state.selectedItems ||
		state.selectedItems.length === 0
	)
		return;

	setConversationState(chatId, { ...state, step: "REVIEW_SELECTION" });

	const humanizedText = humanizeSelection(state.selectedItems);

	const builder = new MessageBuilder()
		.addText(humanizedText)
		.newLine(2)
		.addText("Все верно?");

	const inlineKeyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[{ text: "✅ Верно", callback_data: "confirm_selection" }],
			[{ text: "✏ Изменить", callback_data: "selection_edit" }],
		],
	};

	await client.editMessageText({
		chat_id: chatId,
		message_id: messageId,
		text: builder.build(),
		parse_mode: "MarkdownV2",
		reply_markup: inlineKeyboard,
	});
};

const showDateSelectionScreen = async (
	client: TelegramClient,
	chatId: number,
	messageId: number,
) => {
	const state = getConversationState(chatId);
	if (!state) return;

	setConversationState(chatId, { ...state, step: "ASK_DATE" });

	const builder = new MessageBuilder().addText(
		"🗓 На какую дату вы хотели бы записаться?",
	);

	const dateKeyboard = [
		[
			{ text: "Сегодня", callback_data: "book_date_today" },
			{ text: "Завтра", callback_data: "book_date_tomorrow" },
			{ text: "Выбрать день", callback_data: "book_date_picker" },
		],
	];

	if (state.flowType === "emergency") {
		dateKeyboard.unshift([{ text: "🚨 Сейчас", callback_data: "book_now" }]);
	}

	const inlineKeyboard: InlineKeyboardMarkup = {
		inline_keyboard: dateKeyboard,
	};

	await client.editMessageText({
		chat_id: chatId,
		message_id: messageId,
		text: builder.build(),
		parse_mode: "MarkdownV2",
		reply_markup: inlineKeyboard,
	});
};

const showTimeSelectionScreen = async (client: TelegramClient, chatId: number, messageId: number) => {
    const state = getConversationState(chatId);
    if (!state) return;

    setConversationState(chatId, { ...state, step: "ASK_TIME" });

    const builder = new MessageBuilder().addText("🕓 Выберите удобное время:");

    const timeSlots = [
        "Ближайшее время", "10:00", "11:00", "12:00", "13:00", "14:00", 
        "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
    ];

    // Create a 3x4 grid
    const timeKeyboard: { text: string; callback_data: string }[][] = [];
    for (let i = 0; i < timeSlots.length; i += 4) {
        timeKeyboard.push(
            timeSlots.slice(i, i + 4).map(time => ({ text: time, callback_data: `book_time_${time}` }))
        );
    }

    const inlineKeyboard: InlineKeyboardMarkup = {
        inline_keyboard: timeKeyboard,
    };

    await client.editMessageText({
        chat_id: chatId,
        message_id: messageId,
        text: builder.build(),
        parse_mode: "MarkdownV2",
        reply_markup: inlineKeyboard,
    });
};

// --- Main Bot Logic ---

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

				if (update.message?.text) {
					const chatId = update.message.chat.id;
					const text = update.message.text;
					const currentState = getConversationState(chatId);
					console.log(`[${chatId}] Received text: "${text}"`);

					if (text === "/start") {
						clearConversationState(chatId);
						await showMainMenu(client, chatId);
					} else if (text === "Услуги и Цены" || text === "/prices") {
						const priceList = await showPricesUseCase();
						const builder = new MessageBuilder().addTitle("🛠 Наши услуги").newLine(2);
						priceList.forEach((item) => {
							builder
								.addRawText(`*${MessageBuilder.escapeMarkdownV2(item.name)}* \- ${MessageBuilder.escapeMarkdownV2(String(item.price))} руб`)
								.newLine()
								.addText(item.description)
								.newLine(2);
						});
						await client.sendMessage({ chat_id: chatId, text: builder.build(), parse_mode: "MarkdownV2" });
					} else if (text === "Записаться на Прием" || text === "/book") {
						clearConversationState(chatId);
						await showSelectionScreen(client, chatId, "booking");
					} else if (currentState && currentState.step === "ASK_NAME") {
                        setConversationState(chatId, { ...currentState, step: "ASK_PHONE", clientName: text });
                        await client.sendMessage({ chat_id: chatId, text: "📞 Отлично! Теперь введите ваш номер телефона для связи:" });
                    } else if (currentState && currentState.step === "ASK_PHONE") {
                        setConversationState(chatId, { ...currentState, clientPhone: text });
                        const finalState = getConversationState(chatId)!;
                        const summary = new MessageBuilder()
                            .addTitle("✅ Заявка принята!")
                            .newLine(2)
                            .addText("Спасибо! Мы получили вашу заявку и скоро свяжемся с вами для подтверждения.")
                            .newLine(2)
                            .addRawText("*Детали вашей заявки:*")
                            .newLine()
                            .addText(`*Услуги:* ${(finalState.selectedItems || []).map(i => i.name).join(', ')}`)
                            .newLine()
                            .addText(`*Дата:* ${finalState.selectedDate}`)
                            .newLine()
                            .addText(`*Время:* ${finalState.selectedTime}`)
                            .newLine()
                            .addText(`*Имя:* ${finalState.clientName}`)
                            .newLine()
                            .addText(`*Телефон:* ${finalState.clientPhone}`)
                            .build();

                        await client.sendMessage({ chat_id: chatId, text: summary, parse_mode: "MarkdownV2" });
                        clearConversationState(chatId);
                    }
				} else if (update.callback_query) {
					const chatId = update.callback_query.message?.chat.id;
					const callbackData = update.callback_query.data;
					if (!chatId) continue;
					console.log(`[${chatId}] Received callback_data: "${callbackData}"`);

					const from = update.callback_query.from;
					const currentState =
						getConversationState(chatId) || initializeConversationState(chatId);

					if (callbackData === "emergency_help") {
						clearConversationState(chatId);
						const messageIdToEdit = update.callback_query.message?.message_id;
						await showSelectionScreen(
							client,
							chatId,
							"emergency",
							messageIdToEdit,
						);
						await client.answerCallbackQuery({ callback_query_id: update.callback_query.id, });
						continue;
					}

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
									? getEmergencyProblems()
									: await getServices();
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
								await showSelectionScreen(client, chatId, flowType, messageId);
							}
						}
					} else if (callbackData === "selection_next") {
						if (
							currentState.step === "SELECT_ITEMS" &&
							currentState.selectedItems &&
							currentState.selectedItems.length > 0
						) {
							await showReviewScreen(client, chatId, messageId);
						} else {
							await client.answerCallbackQuery({
								callback_query_id: update.callback_query.id,
								text: "Пожалуйста, выберите хотя бы один пункт.",
								show_alert: true,
							});
						}
					} else if (callbackData === "selection_edit") {
						if (currentState.step === "REVIEW_SELECTION" && currentState.flowType) {
							await showSelectionScreen(client, chatId, currentState.flowType, messageId);
						}
					} else if (callbackData === "confirm_selection") {
						if (currentState.step === "REVIEW_SELECTION") {
							await showDateSelectionScreen(client, chatId, messageId);
						}
					} else if (callbackData === "book_now") {
						if (currentState.step === "ASK_DATE" && MASTER_CHAT_ID) {
							const userText = `От: ${MessageBuilder.escapeMarkdownV2(from.first_name)}${from.last_name ? ` ${MessageBuilder.escapeMarkdownV2(from.last_name)}` : ''} (@${from.username}, ID: ${from.id})`;
							
							const masterMessage = new MessageBuilder()
								.addRawText("🚨 *НОВАЯ ЭКСТРЕННАЯ ЗАЯВКА (СЕЙЧАС)* 🚨")
								.newLine(2)
								.addRawText(userText)
								.newLine(2)
								.addRawText("*Проблемы:*")
								.newLine();

							(currentState.selectedItems || []).forEach(p => {
								masterMessage.addListItem(p.name).newLine();
							});

							const masterKeyboard: InlineKeyboardMarkup = {
								inline_keyboard: [[{ text: "💬 Связаться с клиентом", url: `tg://user?id=${from.id}` }]]
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
							await client.answerCallbackQuery({ callback_query_id: update.callback_query.id, text: "Ошибка: Невозможно отправить заявку мастеру.", show_alert: true });
						}
					} else if (callbackData.startsWith("book_date_")) {
                        const date = callbackData.replace("book_date_", "");
                        setConversationState(chatId, { ...currentState, selectedDate: date });
                        await showTimeSelectionScreen(client, chatId, messageId);
                    } else if (callbackData.startsWith("book_time_")) {
                        const time = callbackData.replace("book_time_", "");
                        setConversationState(chatId, { ...currentState, step: "ASK_NAME", selectedTime: time });
                        await client.editMessageText({
                            chat_id: chatId,
                            message_id: messageId,
                            text: "👤 Почти готово\\! Введите ваше имя\\:",
                            parse_mode: "MarkdownV2",
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

					await client.answerCallbackQuery({ callback_query_id: update.callback_query.id, });
				}
			}
		} catch (error) {
			console.error("Критическая ошибка в главном цикле бота:", error);
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}
};
