import { TelegramClient } from "packages/telegram-client";
import * as Views from "./src/views/prof-tinder-bot-views";
import { MOCK_ORDERS, MOCK_SPECIALISTS, MOCK_CLIENTS, Specialist, Client } from "./src/app/mock-data";

// --- Simple In-Memory State ---
interface ConversationState {
    step: string;
    messageId?: number;
    orderIndex?: number; 
    specialistIndex?: number; 
    favoriteOrderIds: string[];
    favoriteSpecialistIds: string[];
    specialistProfile?: Specialist; // To store mock specialist profile
    clientProfile?: Client;       // To store mock client profile
}
const conversationStates = new Map<number, ConversationState>();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error("Telegram Bot Token is required. Please set BOT_TOKEN environment variable.");
    process.exit(1);
}

const client = new TelegramClient(BOT_TOKEN);
let offset = 0;

// --- Callback Handlers ---

async function handleStartMatching(chatId: number, messageId: number, callbackQueryId: string) {
    const state = conversationStates.get(chatId) || { step: "START", favoriteOrderIds: [], favoriteSpecialistIds: [] };
    conversationStates.set(chatId, { ...state, step: 'VIEWING_SPECIALISTS', messageId, clientProfile: MOCK_CLIENTS[0] });
    await Views.showSpecialistCard(client, chatId, 0, messageId);
}

async function handleClientRoleSelection(chatId: number, messageId: number, callbackQueryId: string) {
    const state = conversationStates.get(chatId) || { step: "START", favoriteOrderIds: [], favoriteSpecialistIds: [] };
    conversationStates.set(chatId, { ...state, step: 'CLIENT_MENU', messageId, clientProfile: MOCK_CLIENTS[0] });
    await Views.showClientMenu(client, chatId, messageId);
}

async function handleSpecialistRoleSelection(chatId: number, messageId: number, callbackQueryId: string) {
    const state = conversationStates.get(chatId) || { step: "START", favoriteOrderIds: [], favoriteSpecialistIds: [] };
    conversationStates.set(chatId, { ...state, step: 'SPECIALIST_MENU', messageId, specialistProfile: MOCK_SPECIALISTS[0] });
    await Views.showSpecialistMenu(client, chatId, messageId);
}

async function handleBackToMainMenu(chatId: number, messageId: number, callbackQueryId: string) {
    const state = conversationStates.get(chatId) || { step: "START", favoriteOrderIds: [], favoriteSpecialistIds: [] };
    conversationStates.set(chatId, { ...state, step: 'MAIN_MENU', messageId });
    await Views.showMainMenu(client, chatId, messageId);
}

// --- Specialist Flow Handlers ---

async function handleShowOrder(chatId: number, messageId: number, orderIndex: number, callbackQueryId: string) {
    const state = conversationStates.get(chatId) || { step: "START", favoriteOrderIds: [], favoriteSpecialistIds: [] };
    conversationStates.set(chatId, { ...state, step: 'VIEWING_ORDERS', orderIndex, messageId });
    await Views.showOrderCard(client, chatId, orderIndex, messageId);
}

async function handleAddToFavorites(chatId: number, messageId: number, orderId: string, callbackQueryId: string) {
    const state = conversationStates.get(chatId);
    if (!state) return;

    if (!state.favoriteOrderIds.includes(orderId)) {
        state.favoriteOrderIds.push(orderId);
        conversationStates.set(chatId, state);
        await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: "Добавлено в избранное!" });
    } else {
        await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: "Уже в избранном." });
    }
    // Find the index of the order that was just interacted with
    const currentOrderIndex = MOCK_ORDERS.findIndex(o => o.id === orderId);
    if (currentOrderIndex !== -1) {
        const nextIndex = (currentOrderIndex + 1) % MOCK_ORDERS.length;
        state.orderIndex = nextIndex;
        conversationStates.set(chatId, state);
        // Show the next order card
        await Views.showOrderCard(client, chatId, nextIndex, messageId);
    } else {
        console.warn(`Order with ID ${orderId} not found in MOCK_ORDERS.`);
        await Views.showSpecialistMenu(client, chatId, messageId); // Go back to menu
    }
}

async function handleApplyToOrder(chatId: number, messageId: number, orderId: string, callbackQueryId: string) {
    await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: `Вы откликнулись на заказ ${orderId}! Клиент получит уведомление. (Заглушка)` });
    // In a real app, this would send a notification to the client
}

async function handleViewSpecialistFavorites(chatId: number, messageId: number, callbackQueryId: string) {
    const state = conversationStates.get(chatId);
    if (!state) return;

    await Views.showFavorites(client, chatId, state.favoriteOrderIds, messageId);
}

async function handleViewSpecialistProfile(chatId: number, messageId: number, callbackQueryId: string) {
    const state = conversationStates.get(chatId);
    if (!state) return;

    await Views.showProfile(client, chatId, messageId);
}

// --- Client Flow Handlers ---

async function handleShowSpecialist(chatId: number, messageId: number, specialistIndex: number, callbackQueryId: string) {
    const state = conversationStates.get(chatId) || { step: "START", favoriteOrderIds: [], favoriteSpecialistIds: [] };
    conversationStates.set(chatId, { ...state, step: 'VIEWING_SPECIALISTS', specialistIndex, messageId });
    await Views.showSpecialistCard(client, chatId, specialistIndex, messageId);
}

async function handleAddSpecialistToFavorites(chatId: number, messageId: number, specialistId: string, callbackQueryId: string) {
    const state = conversationStates.get(chatId);
    if (!state) return;

    if (!state.favoriteSpecialistIds.includes(specialistId)) {
        state.favoriteSpecialistIds.push(specialistId);
        conversationStates.set(chatId, state);
        await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: "Исполнитель добавлен в избранное!" });
    } else {
        await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: "Исполнитель уже в избранном." });
    }
    // Find the index of the specialist that was just interacted with
    const currentSpecialistIndex = MOCK_SPECIALISTS.findIndex(s => s.id === specialistId);
    if (currentSpecialistIndex !== -1) {
        const nextIndex = (currentSpecialistIndex + 1);
        // DEMO FINALE
        if (nextIndex > 2) {
            return Views.showDemoConclusion(client, chatId, messageId);
        }
        state.specialistIndex = nextIndex;
        conversationStates.set(chatId, state);
        // Show the next specialist card
        await Views.showSpecialistCard(client, chatId, nextIndex, messageId);
    } else {
        console.warn(`Specialist with ID ${specialistId} not found in MOCK_SPECIALISTS.`);
        await Views.showClientMenu(client, chatId, messageId); // Go back to menu
    }
}

async function handleContactSpecialist(chatId: number, messageId: number, specialistId: string, callbackQueryId: string) {
    await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: `Вы запросили контакт ${specialistId}. (Заглушка)` });
    // In a real app, this would initiate a direct message or provide contact info
}

async function handleViewClientFavorites(chatId: number, messageId: number, callbackQueryId: string) {
    const state = conversationStates.get(chatId);
    if (!state) return;

    await Views.showClientFavorites(client, chatId, state.favoriteSpecialistIds, messageId);
}

async function handleViewClientProfile(chatId: number, messageId: number, callbackQueryId: string) {
    const state = conversationStates.get(chatId);
    if (!state) return;

    await Views.showClientProfile(client, chatId, messageId);
}

// --- Callback Router ---
const callbackRouter = new Map<string, (chatId: number, messageId: number, callbackQueryId: string) => Promise<void>>([
    ['start_matching', handleStartMatching],
    ['back_to_main_menu', handleBackToMainMenu],
    ['role_client', handleClientRoleSelection],
    ['role_specialist', handleSpecialistRoleSelection],
    
    // Specialist Flow
    ['back_to_specialist_menu', (chatId, messageId, callbackQueryId) => handleSpecialistRoleSelection(chatId, messageId, callbackQueryId)], // Alias for back button
    ['specialist_view_orders', (chatId, messageId, callbackQueryId) => handleShowOrder(chatId, messageId, 0, callbackQueryId)],
    ['specialist_view_favorites', (chatId, messageId, callbackQueryId) => handleViewSpecialistFavorites(chatId, messageId, callbackQueryId)],
    ['specialist_view_profile', (chatId, messageId, callbackQueryId) => handleViewSpecialistProfile(chatId, messageId, callbackQueryId)],
    ['apply_to_order_', (chatId, messageId, callbackQueryId) => handleApplyToOrder(chatId, messageId, conversationStates.get(chatId)?.orderIndex ? MOCK_ORDERS[conversationStates.get(chatId)!.orderIndex!].id : '', callbackQueryId)], // Dynamic handler for apply

    // Client Flow
    ['back_to_client_menu', (chatId, messageId, callbackQueryId) => handleClientRoleSelection(chatId, messageId, callbackQueryId)], // Alias for back button
    ['client_view_specialists', (chatId, messageId, callbackQueryId) => handleShowSpecialist(chatId, messageId, 0, callbackQueryId)],
    ['client_view_favorites', (chatId, messageId, callbackQueryId) => handleViewClientFavorites(chatId, messageId, callbackQueryId)],
    ['client_view_profile', (chatId, messageId, callbackQueryId) => handleViewClientProfile(chatId, messageId, callbackQueryId)],
]);

console.log("Prof-Tinder Bot starting with stakeholder demo flow...");

const mainLoop = async () => {
    while (true) {
        try {
            const updates = await client.getUpdates({ offset, timeout: 30 });

            for (const update of updates) {
                offset = update.update_id + 1;
                const message = update.message || update.callback_query?.message;
                const chatId = message?.chat.id;
                if (!chatId) continue;

                if (update.message?.text?.startsWith("/start")) {
                    console.log(`[${chatId}] Received /start command`);
                    conversationStates.delete(chatId);
                    await Views.showHookScreen(client, chatId);
                    continue;
                }

                if (update.callback_query) {
                    const data = update.callback_query.data;
                    const messageId = update.callback_query.message!.message_id;
                    const callbackQueryId = update.callback_query.id; // Get the correct callback_query_id
                    console.log(`[${chatId}] Callback: ${data}`);

                    // Handle dynamic routes for Specialist Flow
                    if (data.startsWith('show_order_')) {
                        const orderIndex = parseInt(data.split('_')[2], 10);
                        await handleShowOrder(chatId, messageId, orderIndex, callbackQueryId);
                        continue;
                    }
                    if (data.startsWith('add_to_favorites_order_')) {
                        const orderId = data.substring('add_to_favorites_order_'.length);
                        await handleAddToFavorites(chatId, messageId, orderId, callbackQueryId);
                        continue;
                    }
                    if (data.startsWith('apply_to_order_')) {
                        const orderId = data.substring('apply_to_order_'.length);
                        await handleApplyToOrder(chatId, messageId, orderId, callbackQueryId);
                        continue;
                    }

                    // Handle dynamic routes for Client Flow
                    if (data.startsWith('show_specialist_')) {
                        const specialistIndex = parseInt(data.split('_')[2], 10);
                        await handleShowSpecialist(chatId, messageId, specialistIndex, callbackQueryId);
                        continue;
                    }
                    if (data.startsWith('add_to_favorites_specialist_')) {
                        const specialistId = data.substring('add_to_favorites_specialist_'.length);
                        await handleAddSpecialistToFavorites(chatId, messageId, specialistId, callbackQueryId);
                        continue;
                    }
                    if (data.startsWith('contact_specialist_')) {
                        const specialistId = data.substring('contact_specialist_'.length);
                        await handleContactSpecialist(chatId, messageId, specialistId, callbackQueryId);
                        continue;
                    }

                    const handler = callbackRouter.get(data);
                    if (handler) {
                        await handler(chatId, messageId, callbackQueryId);
                    } else {
                        console.warn(`[${chatId}] No handler found for callback data: ${data}`);
                        // If no specific handler, still acknowledge to dismiss loading spinner
                        await client.answerCallbackQuery({ callback_query_id: callbackQueryId });
                    }
                }

            }
        } catch (error) {
            console.error("Critical error in main loop:", error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

mainLoop();
