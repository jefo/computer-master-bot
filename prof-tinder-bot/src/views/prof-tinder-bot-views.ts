import type { TelegramClient } from "packages/telegram-client";
import type {
	InlineKeyboardMarkup,
	Message,
} from "packages/telegram-client/telegram-types";
import { MessageBuilder } from "../infra/message-builder";
import { MOCK_SPECIALISTS, Specialist } from "../app/mock-data";

// --- Generic Helper ---
async function sendOrEdit(
	client: TelegramClient,
	chatId: number,
	text: string,
	keyboard: InlineKeyboardMarkup,
	messageId?: number,
): Promise<Message> {
	const payload = {
		chat_id: chatId,
		text,
		reply_markup: keyboard,
		parse_mode: "MarkdownV2" as const,
	};
	if (messageId) {
		try {
			const result = await client.editMessageText({
				...payload,
				message_id: messageId,
			});
			return typeof result === "boolean"
				? { message_id: messageId, chat: { id: chatId }, date: Date.now() }
				: result;
		} catch (e) {
			console.warn(`Could not edit message: ${e}. Sending a new one.`);
			return await client.sendMessage(payload);
		}
	} else {
		return await client.sendMessage(payload);
	}
}

// --- Spec-based Flow ---

export const showRoleSelectionMenu = async (
	client: TelegramClient,
	chatId: number,
	messageId?: number,
) => {
	const text = new MessageBuilder()
		.addText("Привет! Это HIRE — бот для быстрого поиска проверенных креативных специалистов.")
		.build();

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[{ text: "Я клиент", callback_data: "role_client" }],
			[{ text: "Я исполнитель", callback_data: "role_specialist" }],
		],
	};

	return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showProfessionFilterScreen = async (
    client: TelegramClient,
    chatId: number,
    messageId?: number,
) => {
    const text = new MessageBuilder()
        .addBold("Какого специалиста вы ищете?")
        .build();

    const professions = [...new Set(MOCK_SPECIALISTS.map(s => s.profession))];
    const professionButtons = professions.map(p => ([{
        text: p,
        callback_data: `filter_profession_${p}`
    }]));

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⭐ Мое избранное", callback_data: "show_favorites" }],
            ...professionButtons,
        ],
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showFavoritesScreen = async (
    client: TelegramClient,
    chatId: number,
    favoriteSpecialists: Specialist[],
    messageId?: number,
) => {
    const text = new MessageBuilder()
        .addBold("⭐ Ваше избранное")
        .build();

    let buttons: InlineKeyboardButton[][] = [];
    if (favoriteSpecialists.length === 0) {
        buttons.push([{
            text: "Список пуст",
            callback_data: "no_op"
        }]);
    } else {
        buttons = favoriteSpecialists.map(s => ([{
            text: `👤 ${s.name} - ${s.profession}`,
            callback_data: `view_specialist_${s.id}`
        }]));
    }

    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            ...buttons,
            [{ text: "⬅️ Назад к фильтрам", callback_data: "role_client" }],
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}

export const showSpecialistCard = async (
	client: TelegramClient,
	chatId: number,
	specialist: Specialist,
    contextualCallback: { text: string, data: string },
	messageId?: number,
) => {

	const text = new MessageBuilder()
        .addText(`👤 ${specialist.name} — ${specialist.profession}`)
        .newLine()
        .addText(`💼 ${specialist.experience} | 💲 ${specialist.rate}`)
        .newLine()
        .addText(`🏷️ #${specialist.tags.join(" #")}`)
        .newLine()
        .addText(`📎 ${specialist.portfolio}`)
        .newLine(2)
        .addBold("О себе:")
        .newLine()
        .addText(specialist.about)
		.build();

	const keyboard: InlineKeyboardMarkup = {
		inline_keyboard: [
			[
				{ text: "👍 Написать", callback_data: `contact_${specialist.id}` },
                { text: contextualCallback.text, callback_data: contextualCallback.data },
				{ text: "⭐ В избранное", callback_data: `favorite_${specialist.id}` },
			],
		],
	};

	return sendOrEdit(client, chatId, text, keyboard, messageId);
};

export const showNoMoreSpecialists = async (
    client: TelegramClient,
    chatId: number,
    messageId?: number,
) => {
    const text = new MessageBuilder()
        .addText("На данный момент это все специалисты по вашему запросу.")
        .build();
    
    const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
            [{ text: "⭐ Посмотреть избранное", callback_data: "show_favorites" }],
            [{ text: "Искать заново", callback_data: "role_client" }]
        ]
    };

    return sendOrEdit(client, chatId, text, keyboard, messageId);
}