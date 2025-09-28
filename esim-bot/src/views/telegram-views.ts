import type { TelegramClient } from "packages/telegram-client";
import type { InlineKeyboardMarkup } from "packages/telegram-client/telegram-types";
import { MessageBuilder } from "../infra/message-builder";

// Mock data for eSIM plans - in a real app, this would come from an API
const mockESimPlans = [
	{
		id: "eu_7days",
		country: "Европа",
		description: "7 дней, 10 ГБ",
		price: 25,
		currency: "USD",
		coverage: ["DE", "FR", "IT", "ES", "NL"],
		icon: "🇪",
		popular: true,
		features: [
			"Безлимитный WhatsApp",
			"Мгновенная активация",
			"Поддержка 4G/5G",
		],
	},
	{
		id: "us_5days",
		country: "США",
		description: "5 дней, 5 ГБ",
		price: 20,
		currency: "USD",
		coverage: ["US"],
		icon: "🇺",
		popular: false,
		features: ["Мгновенная активация", "Поддержка 4G", "Локальный IP"],
	},
	{
		id: "asia_10days",
		country: "Азия",
		description: "10 дней, 15 ГБ",
		price: 35,
		currency: "USD",
		coverage: ["TH", "VN", "ID", "MY", "SG"],
		icon: "🌏",
		popular: true,
		features: [
			"Безлимитный мессенджеры",
			"Мгновенная активация",
			"Поддержка 4G/5G",
		],
	},
	{
		id: "world_15days",
		country: "Мир",
		description: "15 дней, 20 ГБ",
		price: 50,
		currency: "USD",
		coverage: ["Global"],
		icon: "🌍",
		popular: false,
		features: [
			"Покрытие 200+ стран",
			"Мгновенная активация",
			"Поддержка 4G/5G",
		],
	},
];

// Mock data for countries
const mockCountries = [
	{
		id: "eu",
		name: "Европа",
		flag: "🇪",
		description: "25+ стран",
		popular: true,
		color: "#3498db",
	},
	{
		id: "us",
		name: "США",
		flag: "🇺",
		description: "США и Канада",
		popular: false,
		color: "#e74c3c",
	},
	{
		id: "asia",
		name: "Азия",
		flag: "🌏",
		description: "20+ стран",
		popular: true,
		color: "#f39c12",
	},
	{
		id: "world",
		name: "Мир",
		flag: "🌍",
		description: "Глобальное покрытие",
		popular: false,
		color: "#9b59b6",
	},
];

// Generic helper function to send or edit messages
async function sendOrEdit(
	client: TelegramClient,
	chatId: number,
	text: string,
	keyboard: InlineKeyboardMarkup,
	messageId?: number,
): Promise<any> {
	const payload = {
		chat_id: chatId,
		text,
		reply_markup: keyboard,
		parse_mode: "MarkdownV2" as const,
	};

	if (messageId) {
		return client.editMessageText({ ...payload, message_id: messageId });
	} else {
		return client.sendMessage(payload);
	}
}

// Main menu view with enhanced UI
export const showMainMenu = async (
	client: TelegramClient,
	chatId: number,
	messageId?: number,
) => {
	const msg = new MessageBuilder()
		.addTitle("🌐 eSIM Travel", "✈")
		.newLine(2)
		.addInfo("Найдите и купите eSIM-карту для вашей поездки за границу.")
		.newLine(2)
		.addSuccess(
			"Наши eSIM обеспечивают надежное подключение к интернету в более чем 200 странах мира!",
		)
		.newLine(2)
		.addSectionTitle("Что вы можете сделать?", "📋")
		.newLine()
		.addListItem("Просмотреть eSIM-карты по регионам", "🌍")
		.newLine()
		.addListItem("Выбрать популярные тарифы", "💳")
		.newLine()
		.addListItem("Управление заказами", "📦")
		.newLine(2)
		.addWarning(
			"Подсказка: Выберите регион, чтобы увидеть подходящие eSIM-планы",
		)
		.build();

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[{ text: "🌍 Каталог eSIM", callback_data: "show_esim_catalog" }],
			[{ text: "📦 Мои заказы", callback_data: "my_orders" }],
			[{ text: "Популярные планы", callback_data: "show_popular_plans" }],
			[{ text: "i Помощь", callback_data: "help" }],
		],
	};

	return sendOrEdit(client, chatId, msg, keyboard, messageId);
};

// eSIM catalog view with enhanced UI
export const showESimCatalog = async (
	client: TelegramClient,
	chatId: number,
	messageId?: number,
) => {
	const text = new MessageBuilder()
		.addTitle("🌍 Выберите регион", "🗺")
		.newLine(2)
		.addInfo("Выберите регион для поездки, чтобы увидеть доступные eSIM-карты:")
		.newLine(2)
		.addSeparator()
		.newLine();

	// Create detailed information for each country
	mockCountries.forEach((country) => {
		text
			.addSectionTitle(`${country.flag} ${country.name}`, "")
			.newLine()
			.addListItem(`Покрытие: ${country.description}`, "📶")
			.newLine()
			.addListItem(
				`Популярность: ${country.popular ? "Высокая" : "Средняя"}`,
				country.popular ? "🔥" : "⭐",
			)
			.newLine(2);
	});

	// Create buttons for countries with better UI
	const countryButtons = mockCountries.map((country) => [
		{
			text: `${country.flag} ${country.name} | ${country.description}`,
			callback_data: `select_country_${country.id}`,
		},
	]);

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			...countryButtons,
			[
				{
					text: "⭐ Популярные направления",
					callback_data: "show_popular_plans",
				},
			],
			[{ text: "⬅ Назад", callback_data: "back_to_main" }],
		],
	};

	return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced popular plans view
export const showPopularPlans = async (
	client: TelegramClient,
	chatId: number,
	messageId?: number,
) => {
	const popularPlans = mockESimPlans.filter((p) => p.popular);

	const text = new MessageBuilder()
		.addTitle("⭐ Популярные eSIM-планы", "🔥")
		.newLine(2)
		.addInfo("Самые востребованные тарифы у наших пользователей:")
		.newLine()
		.addSeparator()
		.newLine();

	popularPlans.forEach((plan, index) => {
		text
			.addSectionTitle(`${plan.icon} ${plan.country}`, "")
			.newLine()
			.addListItem(`${plan.description}`, "📱")
			.newLine()
			.addPrice(plan.price, plan.currency)
			.newLine()
			.addListItem(`📡 Покрытие: ${plan.coverage.join(", ")}`, "🌍")
			.newLine();

		// Add special features
		if (plan.features && plan.features.length > 0) {
			text.addListItem(`✨ Особенности:`, "🔸").newLine();
			plan.features.forEach((feature) => {
				text.addListItem(`${feature}`, "•").newLine();
			});
		}

		text.newLine(2);
	});

	const planButtons = popularPlans.map((plan) => [
		{
			text: `${plan.icon} ${plan.country} - ${plan.price}`,
			callback_data: `select_plan_${plan.id}`,
		},
	]);

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			...planButtons,
			[{ text: "🌍 Все регионы", callback_data: "show_esim_catalog" }],
			[{ text: "⬅ Назад", callback_data: "back_to_main" }],
		],
	};

	return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced country-specific eSIM options view
export const showCountryESimOptions = async (
	client: TelegramClient,
	chatId: number,
	countryId: string,
	messageId?: number,
) => {
	const country = mockCountries.find((c) => c.id === countryId);
	if (!country) {
		return showESimCatalog(client, chatId, messageId);
	}

	const plans = mockESimPlans.filter((p) =>
		p.country.toLowerCase().includes(country.name.toLowerCase()),
	);

	const text = new MessageBuilder()
		.addTitle(`eSIM-карты для ${country.name}`, country.flag)
		.newLine(2)
		.addInfo(`Доступно ${plans.length} тарифных планов:`)
		.newLine(2)
		.addSeparator()
		.newLine();

	plans.forEach((plan, index) => {
		text
			.addSectionTitle(`${plan.icon} ${plan.description}`, "")
			.newLine()
			.addListItem(`Цена: ${plan.price} ${plan.currency}`, "💳")
			.newLine()
			.addListItem(`Срок действия: ${plan.description.split(",")[0]}`, "⏱")
			.newLine()
			.addListItem(`Объем данных: ${plan.description.split(",")[1]}`, "📶")
			.newLine()
			.addListItem(`Покрытие: ${plan.coverage.join(", ")}`, "📡")
			.newLine();

		// Add special features
		if (plan.features && plan.features.length > 0) {
			text.addListItem(`Особенности:`, "✨").newLine();
			plan.features.forEach((feature) => {
				text.addListItem(`${feature}`, "•").newLine();
			});
		}

		text.newLine(2);
	});

	// Create buttons for each plan with visual improvements
	const planButtons = plans.map((plan) => [
		{
			text: `${plan.icon} ${plan.description} - ${plan.price}`,
			callback_data: `select_plan_${plan.id}`,
		},
	]);

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			...planButtons,
			[{ text: "⭐ Популярные планы", callback_data: "show_popular_plans" }],
			[{ text: "🌍 Другой регион", callback_data: "show_esim_catalog" }],
			[{ text: "⬅ Назад", callback_data: "show_esim_catalog" }],
		],
	};

	return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced plan details view
export const showPlanDetails = async (
	client: TelegramClient,
	chatId: number,
	planId: string,
	messageId?: number,
) => {
	const plan = mockESimPlans.find((p) => p.id === planId);
	if (!plan) {
		return showESimCatalog(client, chatId, messageId);
	}

	const text = new MessageBuilder()
		.addTitle(`${plan.country}`, plan.icon)
		.newLine(2)
		.addPrice(plan.price, plan.currency)
		.newLine(2)
		.addSectionTitle("Основные параметры", "📋")
		.newLine()
		.addListItem(`⏱ Длительность: ${plan.description.split(",")[0]}`, "📅")
		.newLine()
		.addListItem(`Объем данных: ${plan.description.split(",")[1]}`, "📊")
		.newLine()
		.addListItem(`Технология: Поддержка 4G/5G`, "📡")
		.newLine(2)
		.addSectionTitle("Покрытие", "🌍")
		.newLine()
		.addText(plan.coverage.join(", "))
		.newLine(2)
		.addSectionTitle("Особенности тарифа", "✨")
		.newLine();

	plan.features.forEach((feature) => {
		text.addListItem(feature, "✅").newLine();
	});

	text
		.newLine(2)
		.addSectionTitle("Информация", "ℹ️")
		.newLine()
		.addSuccess("Готово к использованию сразу после активации")
		.newLine()
		.addInfo("Не требует физической SIM-карты")
		.newLine()
		.addInfo("Работает с iPhone 11+, Samsung S20+ и другими устройствами")
		.newLine(2)
		.addWarning("Проверьте совместимость вашего устройства перед покупкой")
		.newLine(2)
		.addText("✅ Хотите приобрести этот план?")
		.build();

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[
				{
					text: `Купить за ${plan.price} ${plan.currency}`,
					callback_data: "purchase_plan",
				},
			],
			[{ text: "✅ Подробнее об eSIM", callback_data: "show_esim_info" }],
			[
				{
					text: "⬅ Назад",
					callback_data: `select_country_${plan.country.toLowerCase().split(" ")[0]}`,
				},
			],
		],
	};

	return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced checkout view
export const showCheckout = async (
	client: TelegramClient,
	chatId: number,
	messageId?: number,
) => {
	const text = new MessageBuilder()
		.addTitle("Подтверждение покупки", "💳")
		.newLine(2)
		.addSuccess("Ваша eSIM-карта будет доступна после оплаты.")
		.newLine(2)
		.addInfo("Для завершения покупки используйте встроенные платежи Telegram.")
		.newLine(2)
		.addWarning("В демонстрационной версии этот шаг имитирует процесс оплаты.")
		.newLine(2)
		.addSeparator()
		.newLine()
		.addText("После оплаты вы получите:")
		.newLine()
		.addListItem("QR-код для активации eSIM", "✅")
		.newLine()
		.addListItem("Пошаговые инструкции по установке", "✅")
		.newLine()
		.addListItem("Техническую поддержку 24/7", "✅")
		.newLine(2)
		.addInfo(
			"Подсказка: eSIM можно активировать в течение 6 месяцев с момента покупки",
		)
		.build();

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[{ text: "✅ Подтвердить и оплатить", callback_data: "purchase_plan" }],
			[{ text: "i Как использовать eSIM", callback_data: "show_esim_info" }],
			[{ text: "⬅ Назад", callback_data: "show_esim_catalog" }],
		],
	};

	return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// New purchase confirmation view
export const showPurchaseConfirmation = async (
	client: TelegramClient,
	chatId: number,
	messageId?: number,
) => {
	const mockOrder = {
		id: `ord-${Math.floor(10000 + Math.random() * 90000)}`,
		date: new Date().toISOString().split("T")[0],
		plan: "Европа, 7 дней",
		status: "Активна",
		activationCode: "esim" + Math.random().toString(36).substring(2, 10),
	};

	const text = new MessageBuilder()
		.addTitle("Покупка успешно оформлена!", "🎉")
		.newLine(2)
		.addSuccess("Ваша eSIM-карта готова к использованию!")
		.newLine(2)
		.addSectionTitle("Детали заказа", "📋")
		.newLine()
		.addListItem(`ID заказа: ${mockOrder.id}`, "🆔")
		.newLine()
		.addListItem(`Тариф: ${mockOrder.plan}`, "📱")
		.newLine()
		.addListItem(`Дата покупки: ${mockOrder.date}`, "📅")
		.newLine()
		.addListItem(`Статус: ${mockOrder.status}`, "✅")
		.newLine(2)
		.addSectionTitle("Активация eSIM", "⚙")
		.newLine()
		.addInfo("1. Откройте настройки на вашем устройстве")
		.newLine()
		.addInfo("2. Перейдите в раздел eSIM или Подключения")
		.newLine()
		.addInfo("3. Выберите 'Добавить eSIM' и отсканируйте QR-код")
		.newLine()
		.addInfo("4. Следуйте инструкциям на экране")
		.newLine(2)
		.addWarning("Не удаляйте eSIM из настроек до окончания поездки")
		.newLine(2)
		.addInfo(
			"Подсказка: eSIM можно активировать в течение 6 месяцев с момента покупки",
		)
		.build();

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[
				{
					text: "📱 Инструкция по активации",
					callback_data: "esim_settings_help",
				},
			],
			[{ text: "📦 Мои заказы", callback_data: "my_orders" }],
			[{ text: "🌍 Каталог eSIM", callback_data: "show_esim_catalog" }],
			[{ text: "i Поддержка", callback_data: "help" }],
		],
	};

	return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced my orders view
export const showMyOrders = async (
	client: TelegramClient,
	chatId: number,
	messageId?: number,
) => {
	// Mock orders data for PoC
	const mockOrders = [
		{
			id: "ord-12345",
			plan: "Европа, 7 дней",
			status: "Завершен",
			date: "2023-10-15",
			icon: "✅",
		},
		{
			id: "ord-12346",
			plan: "США, 5 дней",
			status: "Завершен",
			date: "2023-11-02",
			icon: "✅",
		},
		{
			id: "ord-12347",
			plan: "Япония, 14 дней",
			status: "Активна",
			date: "2023-11-20",
			icon: "🟢",
		},
		{
			id: "ord-12348",
			plan: "Азия, 10 дней",
			status: "Активна",
			date: "2023-12-05",
			icon: "🟢",
		},
	];

	const text = new MessageBuilder()
		.addTitle("Мои заказы", "📦")
		.newLine(2)
		.addInfo("Ваши предыдущие заказы eSIM-карт:")
		.newLine(2)
		.addSeparator()
		.newLine();

	mockOrders.forEach((order, index) => {
		text
			.addListItem(`${order.plan} | ${order.status}`, order.icon)
			.newLine()
			.addText(`Дата: ${order.date} | ID: ${order.id}`)
			.newLine(2);
	});

	text
		.addInfo("Вы можете повторно заказать любой из ваших предыдущих тарифов")
		.build();

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[{ text: "🔄 Повторить заказ", callback_data: "repeat_order" }],
			[{ text: "🌍 Каталог eSIM", callback_data: "show_esim_catalog" }],
			[{ text: "i Центр поддержки", callback_data: "help" }],
			[{ text: "⬅ Назад", callback_data: "back_to_main" }],
		],
	};

	return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced help view
export const showHelp = async (
	client: TelegramClient,
	chatId: number,
	messageId?: number,
) => {
	const text = new MessageBuilder()
		.addTitle("i Помощь и поддержка", "🤝")
		.newLine(2)
		.addInfo(
			"eSIM Travel - это сервис для покупки eSIM-карт для международных поездок.",
		)
		.newLine(2)
		.addSectionTitle("Как использовать:", "📋")
		.newLine()
		.addNumberedItem("Выберите регион поездки", 1)
		.newLine()
		.addNumberedItem("Подберите подходящий тариф", 2)
		.newLine()
		.addNumberedItem("Оплатите eSIM", 3)
		.newLine()
		.addNumberedItem("Следуйте инструкциям по установке", 4)
		.newLine(2)
		.addSectionTitle("Что такое eSIM?", "❓")
		.newLine()
		.addText(
			"eSIM - это встроенный универсальный модуль идентификации абонента, который позволяет подключаться к сетям связи без физической SIM-карты.",
		)
		.newLine(2)
		.addSuccess("Преимущества eSIM:")
		.newLine()
		.addListItem("Быстрая активация без физической SIM-карты", "✅")
		.newLine()
		.addListItem("Мгновенная активация", "✅")
		.newLine()
		.addListItem("Поддержка более чем 200 стран", "✅")
		.newLine()
		.addListItem("Возможность переключения между операторами", "✅")
		.newLine(2)
		.addSectionTitle("Часто задаваемые вопросы", "❓")
		.newLine()
		.addListItem("Совместимость с устройствами", "📱")
		.newLine()
		.addListItem("Процесс активации", "⚙")
		.newLine()
		.addListItem("Управление eSIM", "🔧")
		.newLine(2)
		.addInfo("Нужна помощь? Напишите нам: @esim_support")
		.build();

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[{ text: "🌍 Просмотреть eSIM", callback_data: "show_esim_catalog" }],
			[{ text: "⭐ Популярные планы", callback_data: "show_popular_plans" }],
			[{ text: "i Центр поддержки", callback_data: "help" }],
			[{ text: "⬅ Назад", callback_data: "back_to_main" }],
		],
	};

	return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// New eSIM info view
export const showESimInfo = async (
	client: TelegramClient,
	chatId: number,
	messageId?: number,
) => {
	const text = new MessageBuilder()
		.addTitle("Подробнее об eSIM", "📱")
		.newLine(2)
		.addInfo(
			"eSIM (встроенный SIM-карта) - это цифровая SIM-карта, которая встроена в ваше устройство.",
		)
		.newLine(2)
		.addSectionTitle("Преимущества:", "✨")
		.newLine()
		.addListItem("Быстрая активация без физической SIM-карты", "✅")
		.newLine()
		.addListItem("Возможность использования нескольких номеров", "✅")
		.newLine()
		.addListItem("Легко управляется через приложение", "✅")
		.newLine()
		.addListItem("Подходит для международных поездок", "✅")
		.newLine(2)
		.addSectionTitle("Совместимость:", "🔧")
		.newLine()
		.addListItem("iPhone 11 и новее", "📱")
		.newLine()
		.addListItem("Samsung Galaxy S20 и новее", "📱")
		.newLine()
		.addListItem("Google Pixel 3 и новее", "📱")
		.newLine()
		.addListItem("Многие другие Android-устройства", "📱")
		.newLine(2)
		.addSectionTitle("Процесс активации:", "⚙")
		.newLine()
		.addNumberedItem("Закажите eSIM через нашего бота", 1)
		.newLine()
		.addNumberedItem("Получите QR-код и инструкции", 2)
		.newLine()
		.addNumberedItem("Отсканируйте QR-код в настройках вашего устройства", 3)
		.newLine()
		.addNumberedItem("Активируйте eSIM для начала использования", 4)
		.newLine(2)
		.addSuccess(
			"Все устройства с поддержкой eSIM могут использовать наши тарифы!",
		)
		.build();

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[{ text: "🌍 Каталог eSIM", callback_data: "show_esim_catalog" }],
			[{ text: "✅ К покупке", callback_data: "show_popular_plans" }],
			[{ text: "⬅ Назад", callback_data: "back_to_main" }],
		],
	};

	return sendOrEdit(client, chatId, text, keyboard, messageId);
};
