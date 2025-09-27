import type { TelegramClient } from "packages/telegram-client";
import type { InlineKeyboardMarkup, Message } from "packages/telegram-client/telegram-types";
import { MessageBuilder } from "../infra/message-builder";

// --- Generic Helper ---
async function sendOrEdit(client: TelegramClient, chatId: number, text: string, keyboard: InlineKeyboardMarkup, messageId?: number): Promise<Message> {
    const payload = { chat_id: chatId, text, reply_markup: keyboard, parse_mode: "MarkdownV2" as const };
    if (messageId) {
        try {
            const result = await client.editMessageText({ ...payload, message_id: messageId });
            // editMessageText can return true, so we construct a mock Message for consistency
            return typeof result === 'boolean' ? { message_id: messageId, chat: { id: chatId }, date: Date.now() } : result;
        } catch (e) {
            // If message is not modified, Telegram throws an error. We can safely ignore it.
            console.warn(`Could not edit message: ${e}`);
            return { message_id: messageId, chat: { id: chatId }, date: Date.now() };
        }
    } else {
        return await client.sendMessage(payload);
    }
}

import type { TelegramClient } from "packages/telegram-client";
import type { InlineKeyboardMarkup, Message } from "packages/telegram-client/telegram-types";
import { MessageBuilder } from "../infra/message-builder";

// --- Generic Helper ---
async function sendOrEdit(client: TelegramClient, chatId: number, text: string, keyboard: InlineKeyboardMarkup, messageId?: number): Promise<Message> {
    const payload = { chat_id: chatId, text, reply_markup: keyboard, parse_mode: "MarkdownV2" as const };
    if (messageId) {
        try {
            const result = await client.editMessageText({ ...payload, message_id: messageId });
            // editMessageText can return true, so we construct a mock Message for consistency
            return typeof result === 'boolean' ? { message_id: messageId, chat: { id: chatId }, date: Date.now() } : result;
        } catch (e) {
            // If message is not modified, Telegram throws an error. We can safely ignore it.
            console.warn(`Could not edit message: ${e}`);
            return { message_id: messageId, chat: { id: chatId }, date: Date.now() };
        }
    } else {
        return await client.sendMessage(payload);
    }
}


export const showRoleSelectionMenu = async (client: TelegramClient, chatId: number, messageId?: number) => {
    const text = new MessageBuilder()
        .addTitle("Добро пожаловать в HIRE-бот!")
        .newLine(2)
        .addText("Это бот для быстрого поиска проверенных креативных специалистов.")
        .newLine(2)
        .addBold("Выберите вашу роль:")
        .build();

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "👤 Я Клиент (ищу исполнителя)", callback_data: "role_client" }],
            [{ text: "🛠️ Я Исполнитель (ищу работу)", callback_data: "role_specialist" }]
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}; 

// --- Placeholder welcome messages ---

export const showClientWelcome = async (client: TelegramClient, chatId: number, messageId: number) => {
    const text = new MessageBuilder()
        .addText("Вы выбрали роль: ")
        .addBold("Клиент")
        .newLine(2)
        .addText("Здесь вы сможете создавать заказы и находить лучших исполнителей.")
        .addText(" (раздел в разработке)")
        .build();
    
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⬅️ Назад к выбору роли", callback_data: "back_to_role_selection" }]
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}

export const showSpecialistWelcome = async (client: TelegramClient, chatId: number, messageId: number) => {
    const text = new MessageBuilder()
        .addText("Вы выбрали роль: ")
        .addBold("Исполнитель")
        .newLine(2)
        .addText("Чтобы начать, создайте свой профиль. Это займет всего пару минут.")
        .build();
    
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "✍️ Создать профиль", callback_data: "create_profile_start" }],
            [{ text: "⬅️ Назад к выбору роли", callback_data: "back_to_role_selection" }]
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}

// --- Profile Creation Form ---

export const showProfileForm = async (client: TelegramClient, chatId: number, profileData: any, editingField?: string, messageId?: number) => {
    const nameStatus = profileData.name ? '✅' : '☑️';
    const nameIndicator = editingField === 'name' ? '👉' : '';
    const nameValue = profileData.name || 'не заполнено';

    const text = new MessageBuilder()
        .addTitle("Создание профиля исполнителя")
        .newLine(2)
        .addText(`${nameStatus} Имя: ${nameValue} ${nameIndicator}`)
        .newLine()
        // ... other fields will be added here
        .build();

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: `${nameStatus} Имя`, callback_data: "edit_profile_name" }],
            // ... other edit buttons will be added here
            [{ text: "⬅️ Назад", callback_data: "back_to_specialist_welcome" }],
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}

