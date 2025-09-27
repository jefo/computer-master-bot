import type { TelegramClient } from "packages/telegram-client";
import type { InlineKeyboardMarkup } from "packages/telegram-client/telegram-types";
import { MessageBuilder } from "../infra/message-builder";
import { showProcessingMessage, updateMessageWithSuccess } from "../infra/visual-effects";

// Mock data for eSIM plans - in a real app, this would come from an API
const mockESimPlans = [
  {
    id: "eu_7days",
    country: "Европа",
    description: "7 дней, 10 ГБ",
    price: 25,
    currency: "USD",
    coverage: ["DE", "FR", "IT", "ES", "NL"],
    icon: "🇪🇺",
    popular: true,
    features: ["Безлимитный WhatsApp", "Мгновенная активация", "Поддержка 4G/5G"]
  },
  {
    id: "us_5days",
    country: "США",
    description: "5 дней, 5 ГБ",
    price: 20,
    currency: "USD",
    coverage: ["US"],
    icon: "🇺🇸",
    popular: false,
    features: ["Мгновенная активация", "Поддержка 4G", "Локальный IP"]
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
    features: ["Безлимитный мессенджеры", "Мгновенная активация", "Поддержка 4G/5G"]
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
    features: ["Покрытие 200+ стран", "Мгновенная активация", "Поддержка 4G/5G"]
  }
];

// Mock data for countries
const mockCountries = [
  { id: "eu", name: "Европа", flag: "🇪🇺", description: "25+ стран", popular: true, color: "#3498db" },
  { id: "us", name: "США", flag: "🇺🇸", description: "США и Канада", popular: false, color: "#e74c3c" },
  { id: "asia", name: "Азия", flag: "🌏", description: "20+ стран", popular: true, color: "#f39c12" },
  { id: "world", name: "Мир", flag: "🌍", description: "Глобальное покрытие", popular: false, color: "#9b59b6" }
];

// Generic helper function to send or edit messages
async function sendOrEdit(
  client: TelegramClient,
  chatId: number, 
  text: string, 
  keyboard: InlineKeyboardMarkup, 
  messageId?: number
): Promise<any> {
  const payload = { 
    chat_id: chatId, 
    text, 
    reply_markup: keyboard, 
    parse_mode: "MarkdownV2" as const 
  };
  
  if (messageId) {
    return await client.editMessageText({ ...payload, message_id: messageId });
  } else {
    return await client.sendMessage(payload);
  }
}

// Main menu view with enhanced UI
export const showMainMenu = async (client: TelegramClient, chatId: number, messageId?: number) => {
  // Show processing animation
  const processingMsgId = await showProcessingMessage(client, chatId, "Загрузка главного меню...");
  
  // Simulate loading time for visual effect
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const text = new MessageBuilder()
    .addTitle("🌐 eSIM Travel", "✈️")
    .newLine(2)
    .addInfo("Найдите и купите eSIM-карту для вашей поездки за границу.")
    .newLine(2)
    .addText("Наши eSIM обеспечивают надежное подключение к интернету в более чем 200 странах мира!")
    .newLine(2)
    .addSeparator()
    .addText("Что бы вы хотели сделать?")
    .build();
  
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: "🌍 Каталог eSIM", callback_data: "show_esim_catalog" }],
      [{ text: "📦 Мои заказы", callback_data: "my_orders" }],
      [{ text: "💳 Популярные планы", callback_data: "show_popular_plans" }],
      [{ text: "ℹ️ Помощь", callback_data: "help" }]
    ]
  };
  
  // Update with success message
  await updateMessageWithSuccess(client, chatId, processingMsgId, "Главное меню загружено!");
  
  // Wait a moment to show the success indicator
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sendOrEdit(client, chatId, text, keyboard, messageId);
};

// eSIM catalog view with enhanced UI
export const showESimCatalog = async (client: TelegramClient, chatId: number, messageId?: number) => {
  // Show processing animation
  const processingMsgId = await showProcessingMessage(client, chatId, "Поиск доступных регионов...");
  
  // Simulate loading time for visual effect
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const text = new MessageBuilder()
    .addTitle("🌍 Выберите регион", "🗺️")
    .newLine(2)
    .addInfo("Выберите регион для поездки, чтобы увидеть доступные eSIM-карты:")
    .newLine(2)
    .addSeparator()
    .build();
  
  // Create buttons for countries with better UI
  const countryButtons = mockCountries.map(country => [
    { 
      text: `${country.flag} ${country.name} | ${country.description}`, 
      callback_data: `select_country_${country.id}` 
    }
  ]);
  
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      ...countryButtons,
      [{ text: "⭐ Популярные направления", callback_data: "show_popular_plans" }],
      [{ text: "⬅️ Назад", callback_data: "back_to_main" }]
    ]
  };
  
  // Update with success message
  await updateMessageWithSuccess(client, chatId, processingMsgId, "Регионы загружены!");
  
  // Wait a moment to show the success indicator
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced popular plans view
export const showPopularPlans = async (client: TelegramClient, chatId: number, messageId?: number) => {
  // Show processing animation
  const processingMsgId = await showProcessingMessage(client, chatId, "Загрузка популярных тарифов...");
  
  // Simulate loading time for visual effect
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const popularPlans = mockESimPlans.filter(p => p.popular);
  
  const text = new MessageBuilder()
    .addTitle("⭐ Популярные eSIM-планы", "🔥")
    .newLine(2)
    .addInfo("Самые востребованные тарифы у наших пользователей:")
    .newLine()
    .addSeparator()
    .newLine();
  
  popularPlans.forEach((plan, index) => {
    text
      .addNumberedItem(`${plan.icon} ${plan.country} - ${plan.description}`, index + 1)
      .newLine()
      .addPrice(plan.price, plan.currency)
      .newLine(2);
  });
  
  const planButtons = popularPlans.map(plan => [
    {
      text: `${plan.icon} ${plan.country} - ${plan.price} ${plan.currency}`, 
      callback_data: `select_plan_${plan.id}`
    }
  ]);
  
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      ...planButtons,
      [{ text: "🌍 Все регионы", callback_data: "show_esim_catalog" }],
      [{ text: "⬅️ Назад", callback_data: "back_to_main" }]
    ]
  };
  
  // Update with success message
  await updateMessageWithSuccess(client, chatId, processingMsgId, "Популярные тарифы загружены!");
  
  // Wait a moment to show the success indicator
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced country-specific eSIM options view
export const showCountryESimOptions = async (
  client: TelegramClient, 
  chatId: number, 
  countryId: string, 
  messageId?: number
) => {
  // Show processing animation
  const processingMsgId = await showProcessingMessage(client, chatId, "Поиск тарифов для региона...");
  
  // Simulate loading time for visual effect
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const country = mockCountries.find(c => c.id === countryId);
  if (!country) {
    return showESimCatalog(client, chatId, messageId);
  }
  
  const plans = mockESimPlans.filter(p => p.country.toLowerCase().includes(country.name.toLowerCase()));
  
  const text = new MessageBuilder()
    .addTitle(`📱 eSIM-карты для ${country.name}`, country.flag)
    .newLine(2)
    .addInfo(`Доступно ${plans.length} тарифных планов:`)
    .newLine(2)
    .addSeparator()
    .newLine();
  
  plans.forEach((plan, index) => {
    text
      .addNumberedItem(`${plan.description}`, index + 1)
      .newLine()
      .addPrice(plan.price, plan.currency)
      .newLine(2);
  });
  
  // Create buttons for each plan with visual improvements
  const planButtons = plans.map(plan => [
    {
      text: `${plan.icon} ${plan.description} - 💳${plan.price}`, 
      callback_data: `select_plan_${plan.id}`
    }
  ]);
  
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      ...planButtons,
      [{ text: "⭐ Популярные планы", callback_data: "show_popular_plans" }],
      [{ text: "🌍 Другой регион", callback_data: "show_esim_catalog" }],
      [{ text: "⬅️ Назад", callback_data: "show_esim_catalog" }]
    ]
  };
  
  // Update with success message
  await updateMessageWithSuccess(client, chatId, processingMsgId, "Тарифы для региона загружены!");
  
  // Wait a moment to show the success indicator
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced plan details view
export const showPlanDetails = async (
  client: TelegramClient, 
  chatId: number, 
  planId: string, 
  messageId?: number
) => {
  // Show processing animation
  const processingMsgId = await showProcessingMessage(client, chatId, "Загрузка деталей тарифа...");
  
  // Simulate loading time for visual effect
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const plan = mockESimPlans.find(p => p.id === planId);
  if (!plan) {
    return showESimCatalog(client, chatId, messageId);
  }
  
  const text = new MessageBuilder()
    .addTitle(`📋 Подробности: ${plan.country}`, plan.icon)
    .newLine(2)
    .addSectionTitle("Технические характеристики", "⚙️")
    .newLine()
    .addListItem(`⏱️ Длительность: ${plan.description.split(',')[1]}`, "•")
    .newLine()
    .addListItem(`📶 Интернет: ${plan.description.split(',')[0]}`, "•")
    .newLine()
    .addListItem(`💳 Цена: ${plan.price} ${plan.currency}`, "•")
    .newLine(2)
    .addSectionTitle("Покрытие", "📡")
    .newLine()
    .addText(plan.coverage.join(", "))
    .newLine(2)
    .addSectionTitle("Особенности тарифа", "✨")
    .newLine();
    
  plan.features.forEach(feature => {
    text.addListItem(feature, "✅").newLine();
  });
  
  text
    .newLine()
    .addSuccess("✅ Готово к использованию сразу после активации")
    .newLine()
    .addInfo("ℹ️ Не требует физической SIM-карты")
    .newLine(2)
    .addText("Хотите приобрести этот план?")
    .build();
  
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: `💳 Купить за ${plan.price} ${plan.currency}`, callback_data: "purchase_plan" }],
      [{ text: "✅ Подробнее об eSIM", callback_data: "show_esim_info" }],
      [{ text: "⬅️ Назад", callback_data: `select_country_${plan.country.toLowerCase().split(' ')[0]}` }]
    ]
  };
  
  // Update with success message
  await updateMessageWithSuccess(client, chatId, processingMsgId, "Детали тарифа загружены!");
  
  // Wait a moment to show the success indicator
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced checkout view
export const showCheckout = async (client: TelegramClient, chatId: number, messageId?: number) => {
  // Show processing animation
  const processingMsgId = await showProcessingMessage(client, chatId, "Подготовка к оплате...");
  
  // Simulate loading time for visual effect
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const text = new MessageBuilder()
    .addTitle("✅ Подтверждение покупки", "💳")
    .newLine(2)
    .addSuccess("Ваша eSIM-карта будет доступна после оплаты.")
    .newLine(2)
    .addInfo("Для завершения покупки используйте встроенные платежи Telegram.")
    .newLine(2)
    .addWarning("⚠️ В демонстрационной версии этот шаг имитирует процесс оплаты.")
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
    .addInfo("💡 Подсказка: eSIM можно активировать в течение 6 месяцев с момента покупки")
    .build();
  
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: "✅ Подтвердить и оплатить", callback_data: "purchase_plan" }],
      [{ text: "ℹ️ Как использовать eSIM", callback_data: "show_esim_info" }],
      [{ text: "⬅️ Назад", callback_data: "show_esim_catalog" }]
    ]
  };
  
  // Update with success message
  await updateMessageWithSuccess(client, chatId, processingMsgId, "Покупка готова к оформлению!");
  
  // Wait a moment to show the success indicator
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced my orders view
export const showMyOrders = async (client: TelegramClient, chatId: number, messageId?: number) => {
  // Show processing animation
  const processingMsgId = await showProcessingMessage(client, chatId, "Загрузка истории заказов...");
  
  // Simulate loading time for visual effect
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const text = new MessageBuilder()
    .addTitle("📦 Мои заказы", "📋")
    .newLine(2)
    .addInfo("Ваши предыдущие заказы eSIM-карт:")
    .newLine(2)
    .addSeparator()
    .newLine()
    .addListItem("Европа, 7 дней | Завершен", "✅")
    .newLine()
    .addListItem("США, 5 дней | Завершен", "✅")
    .newLine()
    .addListItem("Япония, 14 дней | Активна", "🟢")
    .newLine(2)
    .addInfo("💡 Вы можете повторно заказать любой из ваших предыдущих тарифов")
    .build();
  
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: "🔄 Повторить заказ", callback_data: "repeat_order" }],
      [{ text: "🌍 Каталог eSIM", callback_data: "show_esim_catalog" }],
      [{ text: "ℹ️ Центр поддержки", callback_data: "help" }],
      [{ text: "⬅️ Назад", callback_data: "back_to_main" }]
    ]
  };
  
  // Update with success message
  await updateMessageWithSuccess(client, chatId, processingMsgId, "История заказов загружена!");
  
  // Wait a moment to show the success indicator
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// Enhanced help view
export const showHelp = async (client: TelegramClient, chatId: number, messageId?: number) => {
  // Show processing animation
  const processingMsgId = await showProcessingMessage(client, chatId, "Загрузка справки...");
  
  // Simulate loading time for visual effect
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const text = new MessageBuilder()
    .addTitle("ℹ️ Помощь и поддержка", "🤝")
    .newLine(2)
    .addText("eSIM Travel - это сервис для покупки eSIM-карт для международных поездок.")
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
    .addText("eSIM - это встроенный универсальный модуль идентификации абонента, который позволяет подключаться к сетям связи без физической SIM-карты.")
    .newLine(2)
    .addSuccess("Преимущества eSIM:")
    .newLine()
    .addListItem("✓ Нет необходимости в физической SIM-карте", "•")
    .newLine()
    .addListItem("✓ Мгновенная активация", "•")
    .newLine()
    .addListItem("✓ Поддержка более чем 200 стран", "•")
    .newLine()
    .addListItem("✓ Возможность переключения между операторами", "•")
    .newLine(2)
    .addInfo("Нужна помощь? Напишите нам: @esim_support")
    .build();
  
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: "🌍 Просмотреть eSIM", callback_data: "show_esim_catalog" }],
      [{ text: "⭐ Популярные планы", callback_data: "show_popular_plans" }],
      [{ text: "ℹ️ Центр поддержки", callback_data: "help" }],
      [{ text: "⬅️ Назад", callback_data: "back_to_main" }]
    ]
  };
  
  // Update with success message
  await updateMessageWithSuccess(client, chatId, processingMsgId, "Справка загружена!");
  
  // Wait a moment to show the success indicator
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};

// New eSIM info view
export const showESimInfo = async (client: TelegramClient, chatId: number, messageId?: number) => {
  // Show processing animation
  const processingMsgId = await showProcessingMessage(client, chatId, "Загрузка информации об eSIM...");
  
  // Simulate loading time for visual effect
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const text = new MessageBuilder()
    .addTitle("ℹ️ Подробнее об eSIM", "📱")
    .newLine(2)
    .addText("eSIM (встроенный SIM-карта) - это цифровая SIM-карта, которая встроена в ваше устройство.")
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
    .addInfo("Все устройства с поддержкой eSIM могут использовать наши тарифы!")
    .build();
  
  const keyboard: InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: "🌍 Каталог eSIM", callback_data: "show_esim_catalog" }],
      [{ text: "✅ К покупке", callback_data: "show_popular_plans" }],
      [{ text: "⬅️ Назад", callback_data: "back_to_main" }]
    ]
  };
  
  // Update with success message
  await updateMessageWithSuccess(client, chatId, processingMsgId, "Информация об eSIM загружена!");
  
  // Wait a moment to show the success indicator
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return sendOrEdit(client, chatId, text.build(), keyboard, messageId);
};