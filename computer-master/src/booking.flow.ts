import {
	createFlow,
	createQuery,
	createCommand,
	MessagePayload,
	AppContext,
	Keyboard,
	FormattedText,
} from "@bot-machine/telegram-sdk";
import { z } from "zod";
import { showPricesUseCase } from "./app/show-prices.use-case";

// --- Data Shapes ---
const Service = z.object({
	id: z.string(),
	name: z.string(),
});
type Service = z.infer<typeof Service>;

const EmergencyProblem = z.object({
	id: z.string(),
	name: z.string(),
});
type EmergencyProblem = z.infer<typeof EmergencyProblem>;

// --- Data Sources (as Queries) ---
const getEmergencyProblemsQuery = createQuery({
	input: z.void(),
	output: z.array(EmergencyProblem),
	async execute() {
		return [
			{ id: "no_power", name: "🖥 Компьютер не включается" },
			{ id: "bsod", name: "💀 Синий экран смерти" },
			{ id: "virus_slow", name: "🐌 Вирусы / Медленная работа" },
			{ id: "no_internet", name: "🌐 Нет интернета" },
			{ id: "other", name: "❓ Другая проблема" },
		];
	},
});

const getServicesQuery = createQuery({
	input: z.void(),
	output: z.array(Service),
	async execute() {
		const prices = await showPricesUseCase();
		return prices.map((p) => ({ id: p.id, name: p.name }));
	},
});

// --- Components ---

async function SelectItemsComponent(props: {
	title: string;
	items: Service[];
	selectedIds: Set<string>;
}): Promise<MessagePayload> {
	const { title, items, selectedIds } = props;

	const keyboard = new Keyboard();
	items.forEach((item) => {
		keyboard
			.add({
				text: `${selectedIds.has(item.id) ? "✅ " : ""}${item.name}`,
				callback_data: `select_item:${item.id}`,
			})
			.row();
	});

	keyboard.add(
		{ text: "Далее", callback_data: "selection_next" },
		{ text: "Отмена", callback_data: "cancel_flow" },
	);

	return {
		text: new FormattedText().addText(title).text,
		reply_markup: keyboard.inline(),
	};
}

async function ReviewComponent(props: {
	humanizedText: string;
}): Promise<MessagePayload> {
	const { humanizedText } = props;
	const text = new FormattedText()
		.addText(humanizedText)
		.newLine(2)
		.addText("Все верно?");

	const keyboard = new Keyboard()
		.add({ text: "✅ Верно", callback_data: "confirm_selection" })
		.add({ text: "✏ Изменить", callback_data: "selection_edit" });

	return {
		text: text.text,
		reply_markup: keyboard.inline(),
	};
}

async function AskDateComponent(props: {
	flowType: "emergency" | "booking";
}): Promise<MessagePayload> {
	const { flowType } = props;
	const text = new FormattedText().addTitle(
		"На какую дату вы хотели бы записаться?",
		"🗓",
	);

	const keyboard = new Keyboard();
	if (flowType === "emergency") {
		keyboard.add({ text: "🚨 Сейчас", callback_data: "book_now" }).row();
	}
	keyboard
		.add(
			{ text: "Сегодня", callback_data: "book_date_today" },
			{ text: "Завтра", callback_data: "book_date_tomorrow" },
			{ text: "Выбрать день", callback_data: "book_date_picker" },
		)
		.row();
	keyboard.add({ text: "Отмена", callback_data: "cancel_flow" });

	return {
		text: text.text,
		reply_markup: keyboard.inline(),
	};
}

async function AskTimeComponent(): Promise<MessagePayload> {
	const text = new FormattedText().addTitle("Выберите удобное время:", "🕓");

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

	const keyboard = new Keyboard();
	for (let i = 0; i < timeSlots.length; i += 4) {
		keyboard.add(
			...timeSlots
				.slice(i, i + 4)
				.map((time) => ({ text: time, callback_data: `book_time_${time}` })),
		);
		if (i + 4 < timeSlots.length) {
			keyboard.row();
		}
	}
	keyboard.row().add({ text: "Отмена", callback_data: "cancel_flow" });

	return {
		text: text.text,
		reply_markup: keyboard.inline(),
	};
}

async function AskPhoneComponent(): Promise<MessagePayload> {
	const text = new FormattedText().addText(
		"Для подтверждения бронирования, пожалуйста, поделитесь вашим номером телефона.",
	);
	return {
		text: text.text,
	};
}

// --- Commands ---

const toggleItemSelectionCommand = createCommand({
	input: z.object({ id: z.string() }),
	output: z.void(),
	async execute({ id }, ctx) {
		const flowType = ctx.session.flowType as "emergency" | "booking";
		const allItems =
			flowType === "emergency"
				? await getEmergencyProblemsQuery.execute(undefined, ctx)
				: await getServicesQuery.execute(undefined, ctx);

		const selectedItem = allItems.find((i) => i.id === id);
		if (!selectedItem) return;

		const currentItems = (ctx.session.selectedItems || []) as Service[];
		const itemIndex = currentItems.findIndex((i) => i.id === id);

		if (itemIndex > -1) {
			ctx.session.selectedItems = currentItems.filter((i) => i.id !== id);
		} else {
			ctx.session.selectedItems = [...currentItems, selectedItem];
		}
	},
});

const confirmAndExitCommand = createCommand({
	input: z.void(),
	output: z.void(),
	async execute(input, ctx) {
		await ctx.editMessageText("❌ Действие отменено. Вы можете начать заново.");
	},
});

const noOpCommand = createCommand({
	input: z.void(),
	output: z.void(),
	async execute() {},
});

const bookNowCommand = createCommand({
	input: z.void(),
	output: z.void(),
	async execute(input, ctx) {
		const MASTER_CHAT_ID = process.env.MASTER_CHAT_ID;
		if (!MASTER_CHAT_ID) {
			await ctx.answerCallbackQuery(
				"Ошибка: Невозможно отправить заявку мастеру.",
				{ show_alert: true },
			);
			return;
		}

		const from = ctx.update.callback_query?.from;
		if (!from) {
			await ctx.answerCallbackQuery(
				"Ошибка: Не удалось получить данные пользователя.",
				{ show_alert: true },
			);
			return;
		}

		const masterMessage = new FormattedText()
			.addWarning("НОВАЯ ЭКСТРЕННАЯ ЗАЯВКА (СЕЙЧАС)")
			.newLine(2)
			.addDetail(
				"От",
				`${FormattedText.escapeMarkdownV2(from.first_name)}${from.last_name ? ` ${FormattedText.escapeMarkdownV2(from.last_name)}` : ""} (@${from.username}, ID: ${from.id})`,
			)
			.newLine(2)
			.addSectionTitle("Проблемы", "🛠")
			.newLine();

		(ctx.session.selectedItems || []).forEach((p: Service) => {
			masterMessage.addListItem(p.name);
		});

		const masterKeyboard = new Keyboard().add({
			text: "💬 Связаться с клиентом",
			url: `tg://user?id=${from.id}`,
		});

		await ctx.client.sendMessage({
			chat_id: MASTER_CHAT_ID,
			text: masterMessage.text,
			parse_mode: "MarkdownV2",
			reply_markup: masterKeyboard.inline(),
		});

		await ctx.editMessageText(
			"✅ Спасибо! Ваша заявка принята. Мастер свяжется с вами в ближайшее время.",
		);
	},
});

const selectDateCommand = createCommand({
	input: z.object({ date: z.string() }),
	output: z.void(),
	async execute(input, ctx) {
		// For now, just store the raw date string. In a real app, you'd parse and validate.
		ctx.session.selectedDate = input.date;
	},
});

const selectTimeCommand = createCommand({
	input: z.object({ time: z.string() }),
	output: z.void(),
	async execute(input, ctx) {
		ctx.session.selectedTime = input.time;
	},
});

const processContactCommand = createCommand({
	input: z.object({
		phone_number: z.string(),
		first_name: z.string(),
		last_name: z.string().optional(),
		username: z.string().optional(),
		id: z.number(),
	}),
	output: z.void(),
	async execute(input, ctx) {
		const { phone_number, first_name, last_name } = input;

		const summary = new FormattedText()
			.addSuccess("Заявка принята!")
			.newLine(2)
			.addText(
				"Спасибо! Мы получили вашу заявку и скоро свяжемся с вами для подтверждения.",
			)
			.newLine(2)
			.addSectionTitle("Детали заявки")
			.newLine()
			.addListItem(
				`Услуги: ${(ctx.session.selectedItems || []).map((item: Service) => item.name).join(", ")}`,
			)
			.addListItem(`Дата: ${ctx.session.selectedDate || "Не указана"}`)
			.addListItem(`Время: ${ctx.session.selectedTime || "Не указано"}`)
			.addListItem(`Имя: ${first_name} ${last_name || ""}`)
			.addListItem(`Телефон: ${phone_number}`)
			.build();

		await ctx.reply(summary, { reply_markup: { remove_keyboard: true } });
	},
});

// --- Flow Definition ---

export const bookingFlow = createFlow("booking", {
	SELECT_ITEMS: {
		onEnter: async (input: void, ctx: AppContext) => {
			const flowType = ctx.session.flowType;
			const items =
				flowType === "emergency"
					? await getEmergencyProblemsQuery.execute(undefined, ctx)
					: await getServicesQuery.execute(undefined, ctx);
			const title =
				flowType === "emergency"
					? "🚨 Укажите вашу проблему (можно выбрать несколько):"
					: "🗓 Выберите интересующую вас услугу (можно выбрать несколько):";

			return {
				title,
				items,
				selectedIds: new Set(
					ctx.session.selectedItems?.map((i: any) => i.id) || [],
				),
			};
		},
		component: SelectItemsComponent,
		onAction: {
			"select_item::id": { command: toggleItemSelectionCommand, refresh: true },
			selection_next: {
				command: noOpCommand,
				nextState: (result, ctx) => {
					if (
						!ctx.session.selectedItems ||
						ctx.session.selectedItems.length === 0
					) {
						ctx.answerCallbackQuery(
							"Пожалуйста, выберите хотя бы один пункт.",
							{ show_alert: true },
						);
						return "SELECT_ITEMS"; // Stay on the same state
					}
					return ctx.session.flowType === "emergency"
						? "ASK_DATE"
						: "REVIEW_SELECTION";
				},
			},
			cancel_flow: { command: confirmAndExitCommand }, // Exits flow by default
		},
	},
	REVIEW_SELECTION: {
		onEnter: async (input: void, ctx: AppContext) => {
			const items = ctx.session.selectedItems || [];
			if (items.length === 0) return { humanizedText: "" };

			const names = items.map((item: any) => item.name.toLowerCase());
			let humanizedText;
			if (items.length === 1) {
				humanizedText = `Значит, у вас ${names[0]}`;
			} else {
				const last = names.pop();
				humanizedText = `Значит, у вас ${names.join(", ")} и ${last}`;
			}
			return { humanizedText };
		},
		component: ReviewComponent,
		onAction: {
			confirm_selection: { command: noOpCommand, nextState: "ASK_DATE" },
			selection_edit: { command: noOpCommand, nextState: "SELECT_ITEMS" },
		},
	},
	ASK_DATE: {
		onEnter: async (input: void, ctx: AppContext) => {
			return { flowType: ctx.session.flowType };
		},
		component: AskDateComponent,
		onAction: {
			book_date_today: {
				command: selectDateCommand.withInput(() => ({ date: "Сегодня" })),
				nextState: "ASK_TIME",
			},
			book_date_tomorrow: {
				command: selectDateCommand.withInput(() => ({ date: "Завтра" })),
				nextState: "ASK_TIME",
			},
			book_now: { command: bookNowCommand }, // Exits flow by default
			cancel_flow: { command: confirmAndExitCommand }, // Exits flow by default
		},
	},
	ASK_TIME: {
		onEnter: async (input: void, ctx: AppContext) => {
			return {};
		},
		component: AskTimeComponent,
		onAction: {
			"book_time_:time": { command: selectTimeCommand, nextState: "ASK_PHONE" },
			cancel_flow: { command: confirmAndExitCommand }, // Exits flow by default
		},
	},
	ASK_PHONE: {
		onEnter: async (input: void, ctx: AppContext) => {
			// Send the message with the contact sharing button
			await ctx.reply("Нажмите на кнопку ниже, чтобы поделиться контактом 👇", {
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
			return {};
		},
		component: AskPhoneComponent,
		onAction: {
			// This action is triggered when the user sends a contact message
			contact: { command: processContactCommand }, // Exits flow by default
			cancel_flow: { command: confirmAndExitCommand }, // Exits flow by default
		},
	},
});
