import { TelegramClient } from "packages/telegram-client";
import * as Views from "./src/views/prof-tinder-bot-views";
import { MOCK_SPECIALISTS, Specialist } from "./src/app/mock-data";

// --- State ---
type FlowContext = 'swiping' | 'viewing_favorite';

interface ConversationState {
    messageId?: number;
    context: FlowContext;
    shuffledSpecialistIds: string[];
    currentIndex: number;
    favoriteSpecialistIds: string[];
}
const conversationStates = new Map<number, ConversationState>();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error("Telegram Bot Token is required. Please set BOT_TOKEN environment variable.");
}

const client = new TelegramClient(BOT_TOKEN);
let offset = 0;

// --- Utility Functions ---

function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Core Logic Handlers ---

async function startCommandHandler(chatId: number, messageId?: number) {
    console.log(`[${chatId}] Received /start command`);
    conversationStates.delete(chatId);
    await Views.showRoleSelectionMenu(client, chatId, messageId);
}

async function handleRoleClient(chatId: number, messageId: number) {
    // Initialize state for the client flow if it doesn't exist
    if (!conversationStates.has(chatId)) {
        conversationStates.set(chatId, {
            shuffledSpecialistIds: [],
            currentIndex: 0,
            favoriteSpecialistIds: [],
            context: 'swiping',
        });
    }
    await Views.showProfessionFilterScreen(client, chatId, messageId);
}

async function handleProfessionFilter(chatId: number, messageId: number, profession: string) {
    console.log(`[${chatId}] Filtering for profession: ${profession}`);

    const matchingSpecialists = MOCK_SPECIALISTS.filter(s => s.profession === profession);
    const specialistIds = matchingSpecialists.map(s => s.id);
    
    const state = conversationStates.get(chatId) || { favoriteSpecialistIds: [] };

    conversationStates.set(chatId, {
        ...state,
        shuffledSpecialistIds: shuffle(specialistIds),
        currentIndex: 0,
        messageId: messageId,
        context: 'swiping',
    });

    await showNextSpecialist(chatId, messageId);
}

async function showNextSpecialist(chatId: number, messageId: number) {
    const state = conversationStates.get(chatId);
    if (!state) {
        return startCommandHandler(chatId, messageId);
    }

    const { shuffledSpecialistIds, currentIndex } = state;
    if (currentIndex >= shuffledSpecialistIds.length) {
        return Views.showNoMoreSpecialists(client, chatId, messageId);
    }

    const specialistId = shuffledSpecialistIds[currentIndex];
    const specialist = MOCK_SPECIALISTS.find(s => s.id === specialistId);
    if (!specialist) {
        state.currentIndex++;
        conversationStates.set(chatId, state);
        return showNextSpecialist(chatId, messageId);
    }

    state.context = 'swiping';
    conversationStates.set(chatId, state);

    await Views.showSpecialistCard(client, chatId, specialist, 
        { text: "👎 Пропустить", data: "show_next_specialist" }, 
        messageId
    );
}

async function handleShowNext(chatId: number, messageId: number) {
    const state = conversationStates.get(chatId);
    if (!state) {
        return startCommandHandler(chatId, messageId);
    }
    state.currentIndex++;
    conversationStates.set(chatId, state);
    await showNextSpecialist(chatId, messageId);
}

async function handleAddToFavorites(chatId: number, messageId: number, callbackQueryId: string, specialistId: string) {
    const state = conversationStates.get(chatId);
    if (!state) {
        return startCommandHandler(chatId, messageId);
    }

    let alertText = "";
    if (!state.favoriteSpecialistIds.includes(specialistId)) {
        state.favoriteSpecialistIds.push(specialistId);
        alertText = "Добавлено в избранное!";
    } else {
        alertText = "Уже в избранном.";
    }
    await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: alertText });

    if (state.context === 'swiping') {
        await handleShowNext(chatId, messageId);
    } else {
        // If viewing a favorite, do nothing after adding, stay on the card
    }
}

async function handleContact(chatId: number, messageId: number, callbackQueryId: string, specialistId: string) {
    const alertText = "Отлично! Мы уведомим специалиста о вашем интересе. В полной версии здесь откроется защищенный чат для обсуждения деталей проекта.";
    await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: alertText, show_alert: true });

    const state = conversationStates.get(chatId);
    if (state && state.context === 'swiping') {
        await handleShowNext(chatId, messageId);
    }
}

async function handleShowFavorites(chatId: number, messageId: number) {
    const state = conversationStates.get(chatId);
    const favorites = MOCK_SPECIALISTS.filter(s => state?.favoriteSpecialistIds.includes(s.id));
    await Views.showFavoritesScreen(client, chatId, favorites, messageId);
}

async function handleViewSpecialist(chatId: number, messageId: number, specialistId: string) {
    const specialist = MOCK_SPECIALISTS.find(s => s.id === specialistId);
    if (!specialist) return;

    const state = conversationStates.get(chatId);
    if (state) {
        state.context = 'viewing_favorite';
        conversationStates.set(chatId, state);
    }

    await Views.showSpecialistCard(client, chatId, specialist, 
        { text: "⬅️ Назад к избранному", data: "show_favorites" }, 
        messageId
    );
}

// --- Main Loop ---

async function main() {
    console.log("Bot starting, strictly following spec...");
    while (true) {
        try {
            const updates = await client.getUpdates({ offset, timeout: 30 });

            for (const update of updates) {
                offset = update.update_id + 1;
                const message = update.message || update.callback_query?.message;
                const chatId = message?.chat.id;
                if (!chatId) continue;

                if (update.message?.text?.startsWith("/start")) {
                    await startCommandHandler(chatId, message.message_id);
                    continue;
                }

                if (update.callback_query) {
                    const { data, id: callbackQueryId, message: queryMessage } = update.callback_query;
                    const messageId = queryMessage!.message_id;
                    console.log(`[${chatId}] Callback: ${data}`);

                    const [action, ...args] = data.split('_');

                    if (action === 'role' && args[0] === 'client') {
                        await handleRoleClient(chatId, messageId);
                        await client.answerCallbackQuery({ callback_query_id: callbackQueryId });
                    } else if (action === 'filter' && args[0] === 'profession') {
                        const profession = args.slice(1).join('_');
                        await handleProfessionFilter(chatId, messageId, profession);
                        await client.answerCallbackQuery({ callback_query_id: callbackQueryId });
                    } else if (data === 'show_next_specialist') {
                        await handleShowNext(chatId, messageId);
                        await client.answerCallbackQuery({ callback_query_id: callbackQueryId });
                    } else if (data === 'show_favorites') {
                        await handleShowFavorites(chatId, messageId);
                        await client.answerCallbackQuery({ callback_query_id: callbackQueryId });
                    } else if (action === 'view' && args[0] === 'specialist') {
                        const specialistId = args.slice(1).join('_');
                        await handleViewSpecialist(chatId, messageId, specialistId);
                        await client.answerCallbackQuery({ callback_query_id: callbackQueryId });
                    } else if (action === 'favorite') {
                        const specialistId = args.join('_');
                        await handleAddToFavorites(chatId, messageId, callbackQueryId, specialistId);
                    } else if (action === 'contact') {
                        const specialistId = args.join('_');
                        await handleContact(chatId, messageId, callbackQueryId, specialistId);
                    } else {
                        console.warn(`[${chatId}] Unhandled callback: ${data}`);
                        await client.answerCallbackQuery({ callback_query_id: callbackQueryId }); // Silent acknowledgement
                    }
                }
            }
        } catch (error) {
            console.error("Critical error in main loop:", error);
            await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5s before retry
        }
    }
}

main();
