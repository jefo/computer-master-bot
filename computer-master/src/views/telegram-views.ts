import { showPricesUseCase } from "@computer-master-src/app/show-prices.use-case";
import {
	getConversationState,
	setConversationState,
} from "@computer-master-src/infra/conversation-state";
import { MessageBuilder } from "@computer-master-src/infra/message-builder";
import { TelegramClient } from "packages/telegram-client";
import type { InlineKeyboardMarkup } from "packages/telegram-client/telegram-types";

// --- Data Sources ---
export const getEmergencyProblems = () => [
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

export const showMainMenu = async (client: TelegramClient, chatId: number) => {
	const welcomeMessage = new MessageBuilder()
		.addTitle("Здравствуйте! Я личный робот-ассистент Компьютерного Мастера.", "🤖")
		.newLine(2)
		.addText("Передам вашу заявку незамедлительно! Чем могу помочь?")
		.build();

	const initialKeyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[{ text: "🆘 Экстренная помощь", callback_data: "emergency_help" }],
			[{ text: "🛠 Услуги и Цены", callback_data: "show_prices" }],
		],
	};

	await client.sendMessage({
		chat_id: chatId,
		text: welcomeMessage,
		parse_mode: "MarkdownV2",
		reply_markup: initialKeyboard,
	});
};

export const showSelectionScreen = async (
	client: TelegramClient,
	chatId: number,
	flowType: FlowType,
	messageId?: number,
) => {
	console.log(
		`showSelectionScreen: chatId=${chatId}, flowType=${flowType}, messageId=${messageId}`,
	);
	const state = getConversationState(chatId) || { step: "IDLE" };

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
		item.name.toLowerCase().replace(/^[Ss]{2}/, (match) => match.toUpperCase()),
	);
	if (items.length === 1) {
		return `Значит, у вас ${names[0]}`;
	}
	const last = names.pop();
	return `Значит, у вас ${names.join(", ")} и ${last}`;
};

export const showReviewScreen = async (
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

export const showDateSelectionScreen = async (
	client: TelegramClient,
	chatId: number,
	messageId: number,
) => {
	const state = getConversationState(chatId);
	if (!state) return;

	setConversationState(chatId, { ...state, step: "ASK_DATE" });

	const builder = new MessageBuilder()
		.addTitle("На какую дату вы хотели бы записаться?", "🗓");

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

export const showTimeSelectionScreen = async (
	client: TelegramClient,
	chatId: number,
	messageId: number,
) => {
	const state = getConversationState(chatId);
	if (!state) return;

	setConversationState(chatId, { ...state, step: "ASK_TIME" });

	const builder = new MessageBuilder().addTitle("Выберите удобное время:", "🕓");

	const timeSlots = [
		"Ближайшее время",
		"10:00",
		"11:00",
		"12:00",
		"13:00",
		"14:00",
		"15:00",
		"16:00",
		"17:00",
		"18:00",
		"19:00",
		"20:00",
	];

	const timeKeyboard: { text: string; callback_data: string }[][] = [];
	for (let i = 0; i < timeSlots.length; i += 4) {
		timeKeyboard.push(
			timeSlots
				.slice(i, i + 4)
				.map((time) => ({ text: time, callback_data: `book_time_${time}` })),
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
