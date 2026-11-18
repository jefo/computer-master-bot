import { TelegramClient } from "@bot-machine/telegram-client";
import type {
	InlineKeyboardMarkup,
	Message,
	User,
} from "@bot-machine/telegram-client";
import { showPricesUseCase } from "./app/show-prices.use-case";

type FlowType = "emergency" | "booking";
type Step =
	| "idle"
	| "select"
	| "date"
	| "time"
	| "phone";

type Item = { id: string; name: string };

type State = {
	step: Step;
	flowType: FlowType;
	selected: Item[];
	messageId?: number;
	date?: string;
	time?: string;
};

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
	console.error("BOT_TOKEN is not set");
	process.exit(1);
}

const MASTER_CHAT_ID = process.env.MASTER_CHAT_ID;
const client = new TelegramClient(BOT_TOKEN);
const states = new Map<number, State>();

const emergencyProblems: Item[] = [
	{ id: "no_power", name: "Компьютер не включается" },
	{ id: "bsod", name: "Синий экран смерти" },
	{ id: "slow", name: "Вирусы / медленная работа" },
	{ id: "no_internet", name: "Нет интернета" },
	{ id: "other", name: "Другая проблема" },
];

const escapeHtml = (value: string): string =>
	value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const mainKeyboard: InlineKeyboardMarkup = {
	inline_keyboard: [
		[{ text: "🆘 Экстренная помощь", callback_data: "emergency_help" }],
		[{ text: "🛠 Услуги и цены", callback_data: "show_prices" }],
	],
};

async function send(
	chatId: number,
	text: string,
	keyboard: InlineKeyboardMarkup = mainKeyboard,
): Promise<Message> {
	return client.sendMessage({
		chat_id: chatId,
		text,
		parse_mode: "HTML",
		reply_markup: keyboard,
	});
}

async function edit(
	chatId: number,
	messageId: number,
	text: string,
	keyboard: InlineKeyboardMarkup = mainKeyboard,
): Promise<void> {
	await client.editMessageText({
		chat_id: chatId,
		message_id: messageId,
		text,
		parse_mode: "HTML",
		reply_markup: keyboard,
	});
}

function startState(chatId: number, flowType: FlowType): State {
	const state: State = { step: "select", flowType, selected: [] };
	states.set(chatId, state);
	return state;
}

async function showMainMenu(chatId: number): Promise<void> {
	states.delete(chatId);
	await send(
		chatId,
		"<b>Здравствуйте! Я бот компьютерного мастера.</b>\n\n" +
			"Помогу описать проблему или записаться на услугу. " +
			"Заявка сразу уйдёт мастеру.",
	);
}

async function showPrices(chatId: number): Promise<void> {
	const prices = await showPricesUseCase();
	const lines = prices.map(
		(item) =>
			`<b>${escapeHtml(item.name)}</b> — ${item.price} ₽\n` +
			`<i>${escapeHtml(item.description)}</i>`,
	);

	await send(
		chatId,
		`<b>🛠 Услуги и цены</b>\n\n${lines.join("\n\n")}`,
		{
			inline_keyboard: [
				[{ text: "📅 Записаться", callback_data: "book_service" }],
				[{ text: "⬅️ Назад", callback_data: "back_to_main" }],
			],
		},
	);
}

async function showSelect(
	chatId: number,
	state: State,
	messageId?: number,
): Promise<void> {
	const items =
		state.flowType === "emergency" ? emergencyProblems : await getServiceItems();
	const selectedIds = new Set(state.selected.map((item) => item.id));

	const rows: InlineKeyboardMarkup["inline_keyboard"] = items.map((item) => [
		{
			text: `${selectedIds.has(item.id) ? "✅ " : ""}${item.name}`,
			callback_data: `toggle:${item.id}`,
		},
	]);

	rows.push([
		{ text: "Далее", callback_data: "selection_next" },
		{ text: "Отмена", callback_data: "cancel_flow" },
	]);

	const title =
		state.flowType === "emergency"
			? "Что случилось? Можно выбрать несколько пунктов:"
			: "На какую услугу хотите записаться?";

	const keyboard = { inline_keyboard: rows };

	if (messageId) {
		await edit(chatId, messageId, `<b>${escapeHtml(title)}</b>`, keyboard);
		state.messageId = messageId;
	} else {
		const message = await send(chatId, `<b>${escapeHtml(title)}</b>`, keyboard);
		state.messageId = message.message_id;
	}
}

async function getServiceItems(): Promise<Item[]> {
	const prices = await showPricesUseCase();
	return prices.map((item) => ({ id: item.id, name: item.name }));
}

async function showDate(
	chatId: number,
	state: State,
	messageId?: number,
): Promise<void> {
	state.step = "date";

	const rows: InlineKeyboardMarkup["inline_keyboard"] = [];
	if (state.flowType === "emergency") {
		rows.push([{ text: "🚨 Нужно сейчас", callback_data: "date_now" }]);
	}
	rows.push(
		[
			{ text: "Сегодня", callback_data: "date_today" },
			{ text: "Завтра", callback_data: "date_tomorrow" },
		],
		[{ text: "⬅️ Назад", callback_data: "back_to_select" }],
	);

	const text = "<b>Когда вам удобно?</b>";
	if (messageId) {
		await edit(chatId, messageId, text, { inline_keyboard: rows });
	} else {
		const message = await send(chatId, text, { inline_keyboard: rows });
		state.messageId = message.message_id;
	}
}

async function showTime(
	chatId: number,
	state: State,
	messageId?: number,
): Promise<void> {
	state.step = "time";
	const slots = [
		"10:00",
		"11:00",
		"12:00",
		"13:00",
		"14:00",
		"15:00",
		"16:00",
		"17:00",
	];

	const rows: InlineKeyboardMarkup["inline_keyboard"] = [];
	for (let i = 0; i < slots.length; i += 4) {
		rows.push(
			slots.slice(i, i + 4).map((time) => ({
				text: time,
				callback_data: `time:${time}`,
			})),
		);
	}
	rows.push([{ text: "⬅️ Назад", callback_data: "back_to_date" }]);

	const text = "<b>Выберите удобное время:</b>";
	if (messageId) {
		await edit(chatId, messageId, text, { inline_keyboard: rows });
	} else {
		const message = await send(chatId, text, { inline_keyboard: rows });
		state.messageId = message.message_id;
	}
}

async function askPhone(chatId: number, state: State): Promise<void> {
	state.step = "phone";
	await client.sendMessage({
		chat_id: chatId,
		text:
			"Остался один шаг. Поделитесь номером телефона кнопкой ниже — " +
			"мастер свяжется с вами.",
		reply_markup: {
			keyboard: [
				[{ text: "📱 Отправить телефон", request_contact: true }],
				[{ text: "Отмена" }],
			],
			resize_keyboard: true,
			one_time_keyboard: true,
		},
	});
}

function formatRequest(state: State, user: User, phone?: string): string {
	const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
	const username = user.username ? ` (@${user.username})` : "";
	const items = state.selected.map((item) => `• ${escapeHtml(item.name)}`).join("\n");
	const when =
		state.flowType === "emergency" && state.date === "Сейчас"
			? "Сейчас"
			: [state.date, state.time].filter(Boolean).join(", ") || "не указано";

	return (
		"<b>Новая заявка</b>\n\n" +
		`<b>Клиент:</b> ${escapeHtml(name)}${escapeHtml(username)}, ID ${user.id}\n` +
		(state.flowType === "emergency"
			? "<b>Тип:</b> экстренная помощь\n"
			: "<b>Тип:</b> запись на услугу\n") +
		`<b>Когда:</b> ${escapeHtml(when)}\n` +
		(phone ? `<b>Телефон:</b> ${escapeHtml(phone)}\n` : "") +
		`\n<b>Запрос:</b>\n${items}`
	);
}

async function notifyMaster(
	state: State,
	from: User,
	phone?: string,
): Promise<boolean> {
	if (!MASTER_CHAT_ID) return false;

	await client.sendMessage({
		chat_id: Number(MASTER_CHAT_ID),
		text: formatRequest(state, from, phone),
		parse_mode: "HTML",
		reply_markup: {
			inline_keyboard: [
				[{ text: "💬 Написать клиенту", url: `tg://user?id=${from.id}` }],
			],
		},
	});
	return true;
}

async function finish(
	chatId: number,
	state: State,
	from: User,
	phone?: string,
): Promise<void> {
	const delivered = await notifyMaster(state, from, phone);
	states.delete(chatId);

	await client.sendMessage({
		chat_id: chatId,
		text: delivered
			? "✅ Заявка отправлена. Мастер свяжется с вами."
			: "✅ Заявка сохранена, но MASTER_CHAT_ID не настроен — отправка мастеру недоступна.",
		reply_markup: { remove_keyboard: true },
	});
}

async function handleCallback(
	chatId: number,
	messageId: number,
	callbackId: string,
	data: string,
	from: User,
): Promise<void> {
	if (data === "back_to_main") return showMainMenu(chatId);
	if (data === "cancel_flow") return showMainMenu(chatId);
	if (data === "show_prices") return showPrices(chatId);

	if (data === "emergency_help") {
		await showSelect(chatId, startState(chatId, "emergency"));
		return;
	}
	if (data === "book_service") {
		await showSelect(chatId, startState(chatId, "booking"));
		return;
	}

	const state = states.get(chatId);
	if (!state) {
		await showMainMenu(chatId);
		return;
	}

	if (data.startsWith("toggle:")) {
		const id = data.slice("toggle:".length);
		const items =
			state.flowType === "emergency" ? emergencyProblems : await getServiceItems();
		const item = items.find((entry) => entry.id === id);
		if (!item) return;

		const index = state.selected.findIndex((entry) => entry.id === id);
		if (index >= 0) state.selected.splice(index, 1);
		else state.selected.push(item);

		await showSelect(chatId, state, messageId);
		return;
	}

	if (data === "selection_next") {
		if (!state.selected.length) {
			await client.answerCallbackQuery({
				callback_query_id: callbackId,
				text: "Выберите хотя бы один пункт",
				show_alert: true,
			});
			return;
		}
		await showDate(chatId, state, messageId);
		return;
	}

	if (data === "back_to_select") {
		state.step = "select";
		await showSelect(chatId, state, messageId);
		return;
	}
	if (data === "back_to_date") {
		await showDate(chatId, state, messageId);
		return;
	}

	if (data === "date_now") {
		state.date = "Сейчас";
		await finish(chatId, state, from);
		return;
	}
	if (data === "date_today" || data === "date_tomorrow") {
		state.date = data === "date_today" ? "Сегодня" : "Завтра";
		await showTime(chatId, state, messageId);
		return;
	}

	if (data.startsWith("time:")) {
		state.time = data.slice("time:".length);
		await askPhone(chatId, state);
		return;
	}
}

async function handleMessage(message: Message): Promise<void> {
	const chatId = message.chat.id;
	if (!message.from) return;
	const from = message.from;
	const text = message.text ?? "";

	if (text.startsWith("/start")) {
		await showMainMenu(chatId);
		return;
	}

	const state = states.get(chatId);
	if (!state) {
		await showMainMenu(chatId);
		return;
	}

	if (state.step === "phone" && message.contact) {
		await finish(chatId, state, from, message.contact.phone_number);
		return;
	}

	if (text === "Отмена") {
		await showMainMenu(chatId);
		return;
	}

	if (state.step === "phone") {
		await client.sendMessage({
			chat_id: chatId,
			text: "Нажмите кнопку «Отправить телефон» или /start, чтобы начать заново.",
		});
	}
}

async function main(): Promise<void> {
	console.log("Computer master bot is running");
	let offset = 0;

	while (true) {
		try {
			const updates = await client.getUpdates({ offset, timeout: 30 });

			for (const update of updates) {
				offset = update.update_id + 1;

				if (update.callback_query) {
					const query = update.callback_query;
					const chatId = query.message?.chat.id;
					if (!chatId) continue;

					await handleCallback(
						chatId,
						query.message!.message_id,
						query.id,
						query.data ?? "",
						query.from,
					);
					await client.answerCallbackQuery({
						callback_query_id: query.id,
					});
					continue;
				}

				if (update.message) {
					await handleMessage(update.message);
				}
			}
		} catch (error) {
			console.error("Bot loop error:", error);
			await new Promise((resolve) => setTimeout(resolve, 5_000));
		}
	}
}

main();
