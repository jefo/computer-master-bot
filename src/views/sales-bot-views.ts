import type { TelegramClient } from "packages/telegram-client";
import type { InlineKeyboardMarkup, Message } from "packages/telegram-client/telegram-types";
import { MessageBuilder } from "@src/infra/message-builder";

// --- Mock Data ---
const MOCK_STORES = [
    { id: "store_1", name: "ТЦ 'Галерея'" },
    { id: "store_2", name: "ТРК 'Планета'" },
    { id: "store_3", name: "ул. Красная, 105" },
];

// --- Generic Helper ---
async function sendOrEdit(client: TelegramClient, chatId: number, text: string, keyboard: InlineKeyboardMarkup, messageId?: number): Promise<Message> {
    const payload = { chat_id: chatId, text, reply_markup: keyboard, parse_mode: "MarkdownV2" as const };
    if (messageId) {
        const result = await client.editMessageText({ ...payload, message_id: messageId });
        // editMessageText can return true, so we construct a mock Message for consistency
        return typeof result === 'boolean' ? { message_id: messageId, chat: { id: chatId }, date: Date.now() } : result;
    } else {
        return await client.sendMessage(payload);
    }
}

// --- Role-Specific Menus ---

export const showSellerMenu = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Меню Продавца-Консультанта. Что вы хотите сделать?").build();
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "🚀 Начать смену", callback_data: "seller_start_shift" }],
            [{ text: "📊 Мои показатели", callback_data: "seller_my_stats" }],
            [{ text: "📚 Все для работы", callback_data: "seller_work_materials" }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showSupervisorMenu = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Меню Супервайзера. Выберите раздел для просмотра.").build();
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "📈 Показатели торговых точек", callback_data: "sup_store_stats" }],
            [{ text: "👥 Показатели продавцов", callback_data: "sup_seller_stats" }],
            [{ text: "📚 Все для работы", callback_data: "sup_work_materials" }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showManagerMenu = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Меню Руководителя. Выберите раздел для просмотра.").build();
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "📈 Показатели торговых точек", callback_data: "man_store_stats" }],
            [{ text: "👥 Показатели продавцов", callback_data: "man_seller_stats" }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

// --- Seller Flow Screens ---

export const showStoreSelection = async (client: TelegramClient, chatId: number, messageId: number) => {
    const text = new MessageBuilder().addText("Выберите вашу торговую точку:").build();
    const storeButtons = MOCK_STORES.map(store => ([{ text: store.name, callback_data: `select_store_${store.id}` }]));
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            ...storeButtons,
            [{ text: "⬅️ Назад", callback_data: "back_to_seller_menu" }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showActiveShiftMenu = async (client: TelegramClient, chatId: number, storeName: string, messageId: number) => {
    const text = new MessageBuilder()
        .addText("✅ Смена в ")
        .addBold(storeName)
        .addText(" начата. Хорошей работы!")
        .build();
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "📋 Закончить смену и сдать отчет", callback_data: "seller_end_shift" }],
            [{ text: "🏃 Экстренное закрытие", callback_data: "seller_emergency_close" }],
        ],
    };
    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const askForRevenue = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder()
        .addText("Пожалуйста, введите ")
        .addBold("общую сумму выручки")
        .addText(" за смену (только цифры):")
        .build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForCashAmount = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Введите сумму ").addBold("наличных").addText(":").build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForCardAmount = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Введите сумму ").addBold("безнала").addText(" (оплата картой):").build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForQrAmount = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Введите сумму по ").addBold("QR-коду").addText(":").build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForTransferAmount = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Введите сумму ").addBold("переводом").addText(":").build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForReturnsAmount = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder().addText("Введите сумму ").addBold("возвратов").addText(":").build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

export const askForPhotos = async (client: TelegramClient, chatId: number, messageId: number | undefined, uploadedCount: number) => {
    const photoPrompts = [
        "1/4: Фото подписи на конверте с выручкой",
        "2/4: Фото сводных чеков",
        "3/4: Фото конверта, в котором все лежит",
        "4/4: Фото запечатанного конверта",
    ];

    if (uploadedCount >= photoPrompts.length) {
        return await showReportReview(client, chatId, messageId!, {}); // Pass mock data
    } else {
        const text = new MessageBuilder()
            .addText(`Теперь, пожалуйста, прикрепите фото. (${uploadedCount + 1}/4)`)
            .newLine(2)
            .addBold(photoPrompts[uploadedCount])
            .build();
        return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
    }
};

export const showReportReview = async (client: TelegramClient, chatId: number, messageId: number, reportData: any) => {
    const builder = new MessageBuilder()
        .addTitle("Проверьте ваш отчет")
        .newLine(2)
        .addListItem(`Выручка: ${reportData.revenue || '10000'} руб.`)
        .addListItem(`Наличные: ${reportData.cash || '2000'} руб.`)
        .addListItem(`Безнал: ${reportData.card || '5000'} руб.`)
        .addListItem(`QR-код: ${reportData.qr || '1500'} руб.`)
        .addListItem(`Перевод: ${reportData.transfer || '1500'} руб.`)
        .addListItem(`Возвраты: ${reportData.returns || '0'} руб.`)
        .newLine()
        .addText("Прикреплено 4 фото.")
        .newLine(2)
        .addText("Все верно?");

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "✅ Да, завершить смену", callback_data: "report_confirm" }],
            [{ text: "✏️ Редактировать отчет", callback_data: "report_edit" }],
        ],
    };
    return sendOrEdit(client, chatId, builder.build(), keyboard, messageId);
};

export const showShiftEndMessage = async (client: TelegramClient, chatId: number, messageId: number) => {
    const text = new MessageBuilder().addText("✅ Смена успешно завершена. Спасибо за работу, хорошего отдыха!").build();
    const sentMessage = await sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
    // Show main menu again after a delay
    setTimeout(() => showSellerMenu(client, chatId), 2000);
    return sentMessage;
};

export const showEmergencyClosePrompt = async (client: TelegramClient, chatId: number, messageId: number) => {
    const text = new MessageBuilder()
        .addText("🏃 Экстренное закрытие. Введите ")
        .addBold("актуальный показатель выручки")
        .addText(" на момент ухода:")
        .build();
    return sendOrEdit(client, chatId, text, { inline_keyboard: [] }, messageId);
};

// --- Placeholder Screens ---

export const showInDevelopment = async (client: TelegramClient, queryId: string) => {
    await client.answerCallbackQuery({
        callback_query_id: queryId,
        text: "Этот раздел находится в разработке.",
        show_alert: true,
    });
};