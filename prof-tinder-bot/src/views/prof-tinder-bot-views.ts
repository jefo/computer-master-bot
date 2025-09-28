import type { TelegramClient } from "packages/telegram-client";
import type { InlineKeyboardMarkup, Message } from "packages/telegram-client/telegram-types";
import { MessageBuilder } from "../infra/message-builder";
import { MOCK_ORDERS, MOCK_SPECIALISTS, MOCK_CLIENTS } from "../app/mock-data";

// --- Generic Helper ---
async function sendOrEdit(client: TelegramClient, chatId: number, text: string, keyboard: InlineKeyboardMarkup, messageId?: number): Promise<Message> {
    const payload = { chat_id: chatId, text, reply_markup: keyboard, parse_mode: "MarkdownV2" as const };
    if (messageId) {
        try {
            // Important: Edit message requires the new text to be different from the old one.
            const result = await client.editMessageText({ ...payload, message_id: messageId });
            return typeof result === 'boolean' ? { message_id: messageId, chat: { id: chatId }, date: Date.now() } : result;
        } catch (e) {
            console.warn(`Could not edit message: ${e}. Sending a new one.`);
            return await client.sendMessage(payload);
        }
    } else {
        return await client.sendMessage(payload);
    }
}

// --- Main Demo Flow ---

export const showHookScreen = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder()
        .addText("Вы — заказчик, ищущий UI/UX дизайнера для нового проекта.")
        .newLine(2)
        .addText("Бот подберет для вас лучших специалистов в формате 'Tinder'.")
        .newLine(2)
        .addBold("Нажмите 'Начать', чтобы увидеть первого кандидата.")
        .build();

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "🚀 Начать подбор", callback_data: "start_matching" }]
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showDemoConclusion = async (client: TelegramClient, chatId: number, messageId: number) => {
    const text = new MessageBuilder()
        .addText("Вы просмотрели несколько кандидатов.")
        .newLine()
        .addText("Понравившихся можно найти в 'Избранном'.")
        .newLine(2)
        .addBold("Так легко и быстро вы можете найти нужного специалиста.")
        .build();

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [
                { text: "⭐ Показать избранное", callback_data: "client_view_favorites" },
                { text: "🔄 Продолжить подбор", callback_data: "start_matching" },
            ],
            [{ text: "🏠 В главное меню", callback_data: "back_to_main_menu" }],
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}

export const showMainMenu = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder()
        .addTitle("Главное меню")
        .newLine(2)
        .addText("Вы можете продолжить поиск или переключить роль.")
        .build();

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "👤 Я Клиент (ищу исполнителя)", callback_data: "role_client" }],
            [{ text: "🛠️ Я Исполнитель (ищу работу)", callback_data: "role_specialist" }]
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
};


// --- Client Flow ---

export const showClientMenu = async (client: TelegramClient, chatId: number, messageId: number) => {
    const text = new MessageBuilder()
        .addTitle("Меню клиента")
        .newLine(2)
        .addText("Что вы хотите найти?")
        .build();
    
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "🚀 Смотреть исполнителей", callback_data: "client_view_specialists" }],
            [{ text: "⭐ Мое избранное", callback_data: "client_view_favorites" }],
            [{ text: "⚙️ Мой профиль", callback_data: "client_view_profile" }],
            [{ text: "⬅️ Назад в главное меню", callback_data: "back_to_main_menu" }]
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}

export const showSpecialistCard = async (client: TelegramClient, chatId: number, specialistIndex: number, messageId?: number) => {
    const specialist = MOCK_SPECIALISTS[specialistIndex];
    
    // DEMO FINALE
    if (!specialist || specialistIndex > 2) {
        return showDemoConclusion(client, chatId, messageId!)
    }

    const text = new MessageBuilder()
        .addBold(`👤 ${specialist.name} — ${specialist.profession}`)
        .newLine(2)
        .addText(`⭐️ *Опыт:* ${specialist.experience}`)
        .newLine()
        .addText(`💲 *Ставка:* ${specialist.rate}`)
        .newLine()
        .addText(`📍 *Город:* ${specialist.city}`)
        .newLine(2)
        .addRawText(`_${MessageBuilder.escapeMarkdownV2(specialist.about)}_`)
        .newLine(2)
        .addText(`*Навыки:* #${specialist.tags.join(' #')}`)
        .newLine()
        .addText(`*Портфолио:* ${specialist.portfolio}`)
        .build();

    const nextIndex = (specialistIndex + 1);

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [
                { text: "👍 Написать", callback_data: `contact_specialist_${specialist.id}` },
                { text: "👎 Дальше", callback_data: `show_specialist_${nextIndex}` },
                { text: "⭐ В избранное", callback_data: `add_to_favorites_specialist_${specialist.id}` },
            ],
            [{ text: "🏠 В главное меню", callback_data: "back_to_main_menu" }],
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}

export const showClientFavorites = async (client: TelegramClient, chatId: number, favoriteSpecialistIds: string[], messageId: number) => {
    const builder = new MessageBuilder()
        .addTitle("⭐ Мое избранное (Клиент)");

    if (!favoriteSpecialistIds || favoriteSpecialistIds.length === 0) {
        builder.newLine(2).addText("У вас пока нет избранных исполнителей.");
    } else {
        builder.newLine(2).addText("Вот ваши сохраненные исполнители:");
        favoriteSpecialistIds.forEach(id => {
            const specialist = MOCK_SPECIALISTS.find(s => s.id === id);
            if (specialist) {
                builder.newLine().addListItem(`${specialist.name} - ${specialist.profession}`);
            }
        });
    }

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ В меню", callback_data: "back_to_client_menu" }]
        ]
    };

    return sendOrEdit(client, chatId, builder.build(), keyboard, messageId);
}

export const showClientProfile = async (client: TelegramClient, chatId: number, messageId: number) => {
    const clientProfile = MOCK_CLIENTS[0]; // Assuming a single mock client for now
    const text = new MessageBuilder()
        .addTitle("⚙️ Мой профиль (Клиент)")
        .newLine(2)
        .addBold(`Название: ${clientProfile.name}`)
        .newLine()
        .addText(`Компания: ${clientProfile.company}`)
        .newLine()
        .addText(`О себе: ${clientProfile.description}`)
        .newLine()
        .addText(`Контакт: ${clientProfile.contactEmail}`)
        .build();
    
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ В меню", callback_data: "back_to_client_menu" }]
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}

// --- Specialist Flow ---

export const showSpecialistMenu = async (client: TelegramClient, chatId: number, messageId: number) => {
    const text = new MessageBuilder()
        .addTitle("Меню исполнителя")
        .newLine(2)
        .addText("Ваш профиль активен и показывается клиентам.")
        .newLine(2)
        .addText("Что вы хотите сделать?")
        .build();
    
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "🚀 Смотреть заказы", callback_data: "specialist_view_orders" }],
            [{ text: "⭐ Мое избранное", callback_data: "specialist_view_favorites" }],
            [{ text: "⚙️ Мой профиль", callback_data: "specialist_view_profile" }],
            [{ text: "⬅️ Назад в главное меню", callback_data: "back_to_main_menu" }]
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}

export const showOrderCard = async (client: TelegramClient, chatId: number, orderIndex: number, messageId: number) => {
    const order = MOCK_ORDERS[orderIndex];
    if (!order) {
        const text = new MessageBuilder().addText("Заказов больше нет. Хотите начать сначала?").build();
        const keyboard: InlineKeyboardMarkup = { inline_keyboard: [
            [{ text: "🔄 Начать сначала", callback_data: `specialist_view_orders` }],
            [{ text: "⬅️ В меню", callback_data: "back_to_specialist_menu" }]
        ] };
        return sendOrEdit(client, chatId, text, keyboard, messageId);
    }

    const text = new MessageBuilder()
        .addBold(order.title)
        .newLine(2)
        .addText(order.description)
        .newLine(2)
        .addText(`Бюджет: ${order.budget}`)
        .build();

    const nextIndex = (orderIndex + 1) % MOCK_ORDERS.length; // Loop through mock orders

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [
                { text: "👎 Пропустить", callback_data: `show_order_${nextIndex}` },
                { text: "⭐ В избранное", callback_data: `add_to_favorites_order_${order.id}` },
            ],
            [{ text: "👍 Откликнуться", callback_data: `apply_to_order_${order.id}` }],
            [{ text: "⬅️ В меню", callback_data: "back_to_specialist_menu" }],
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}

export const showFavorites = async (client: TelegramClient, chatId: number, favoriteOrderIds: string[], messageId: number) => {
    const builder = new MessageBuilder()
        .addTitle("⭐ Мое избранное");

    if (!favoriteOrderIds || favoriteOrderIds.length === 0) {
        builder.newLine(2).addText("У вас пока нет избранных заказов.");
    } else {
        builder.newLine(2).addText("Вот ваши сохраненные заказы:");
        favoriteOrderIds.forEach(id => {
            const order = MOCK_ORDERS.find(o => o.id === id);
            if (order) {
                builder.newLine().addListItem(order.title);
            }
        });
    }

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ В меню", callback_data: "back_to_specialist_menu" }]
        ]
    };

    return sendOrEdit(client, chatId, builder.build(), keyboard, messageId);
}

export const showProfile = async (client: TelegramClient, chatId: number, messageId: number) => {
    const specialistProfile = MOCK_SPECIALISTS[0]; // Assuming a single mock specialist for now
    const text = new MessageBuilder()
        .addTitle("⚙️ Мой профиль (Исполнитель)")
        .newLine(2)
        .addBold(`Имя: ${specialistProfile.name}`)
        .newLine()
        .addText(`Профессия: ${specialistProfile.profession}`)
        .newLine()
        .addText(`Опыт: ${specialistProfile.experience}`)
        .newLine()
        .addText(`Ставка: ${specialistProfile.rate}`)
        .newLine()
        .addText(`Город: ${specialistProfile.city}`)
        .newLine()
        .addText(`Теги: ${specialistProfile.tags.join(', ')}`)
        .newLine()
        .addText(`Портфолио: ${specialistProfile.portfolio}`)
        .newLine()
        .addText(`О себе: ${specialistProfile.about}`)
        .build();
    
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ В меню", callback_data: "back_to_specialist_menu" }]
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}