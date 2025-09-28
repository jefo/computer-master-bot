import { TelegramClient } from "packages/telegram-client";
import * as Views from "./src/views/prof-tinder-bot-views";
import { MOCK_ORDERS, MOCK_SPECIALISTS, Order, Specialist } from "./src/app/mock-data";

// --- State ---
type FlowContext = 'swiping_specs' | 'swiping_orders' | 'viewing_favorite_spec' | 'viewing_favorite_order';

interface ConversationState {
    messageId?: number;
    context: FlowContext;
    // Client flow state
    shuffledSpecialistIds: string[];
    currentSpecialistIndex: number;
    favoriteSpecialistIds: string[];
    // Specialist flow state
    shuffledOrderIds: string[];
    currentOrderIndex: number;
    favoriteOrderIds: string[];
    appliedOrderIds: string[]; // New!
}
const conversationStates = new Map<number, ConversationState>();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error("Telegram Bot Token is required. Please set BOT_TOKEN environment variable.");
}

const client = new TelegramClient(BOT_TOKEN);
let offset = 0;

// --- Utility ---
function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initState(chatId: number) {
    if (!conversationStates.has(chatId)) {
        conversationStates.set(chatId, {
            context: 'swiping_specs',
            shuffledSpecialistIds: [],
            currentSpecialistIndex: 0,
            favoriteSpecialistIds: [],
            shuffledOrderIds: [],
            currentOrderIndex: 0,
            favoriteOrderIds: [],
            appliedOrderIds: [],
        });
    }
}

// --- Generic Handlers ---
async function startCommandHandler(chatId: number, messageId?: number) {
    console.log(`[${chatId}] Received /start command`);
    conversationStates.delete(chatId);
    await Views.showRoleSelectionMenu(client, chatId, messageId);
}

// --- Client (Employer) Flow Handlers ---

async function handleRoleClient(chatId: number, messageId: number) {
    initState(chatId);
    await Views.showProfessionFilterScreen(client, chatId, messageId);
}

async function handleProfessionFilter(chatId: number, messageId: number, profession: string) {
    const state = conversationStates.get(chatId)!;
    const matching = MOCK_SPECIALISTS.filter(s => s.profession === profession);
    state.shuffledSpecialistIds = shuffle(matching.map(s => s.id));
    state.currentSpecialistIndex = 0;
    state.context = 'swiping_specs';
    await showNextSpecialist(chatId, messageId);
}

async function showNextSpecialist(chatId: number, messageId: number) {
    const state = conversationStates.get(chatId)!;
    if (state.currentSpecialistIndex >= state.shuffledSpecialistIds.length) {
        return Views.showNoMoreSpecialists(client, chatId, messageId);
    }
    const specialistId = state.shuffledSpecialistIds[state.currentSpecialistIndex];
    const specialist = MOCK_SPECIALISTS.find(s => s.id === specialistId)!;
    await Views.showSpecialistCard(client, chatId, specialist, { text: "👎 Пропустить", data: "show_next_spec" }, messageId);
}

async function handleShowSpecFavorites(chatId: number, messageId: number) {
    const state = conversationStates.get(chatId)!;
    const favorites = MOCK_SPECIALISTS.filter(s => state.favoriteSpecialistIds.includes(s.id));
    await Views.showSpecialistFavoritesScreen(client, chatId, favorites, messageId);
}

async function handleViewSpecialist(chatId: number, messageId: number, specialistId: string) {
    const specialist = MOCK_SPECIALISTS.find(s => s.id === specialistId)!;
    const state = conversationStates.get(chatId)!;
    state.context = 'viewing_favorite_spec';
    await Views.showSpecialistCard(client, chatId, specialist, { text: "⬅️ К избранному", data: "show_spec_favorites" }, messageId);
}

// --- Specialist (Worker) Flow Handlers ---

async function handleRoleSpecialist(chatId: number, messageId: number) {
    initState(chatId);
    await Views.showOrderCategoryFilterScreen(client, chatId, messageId);
}

const categorySkillMap: Record<string, string[]> = {
    "Дизайн": ["UI/UX", "Figma", "Mobile Design", "Prototyping", "Logo Design", "Branding", "Illustrator", "Photoshop"],
    "Видео": ["Video Editing", "Premiere Pro", "After Effects", "Sound Design"],
    "Разработка": ["Python", "Node.js", "Telegram API", "NLP"],
    "Тексты": ["Copywriting", "SEO", "Marketing", "IT"],
};

async function handleOrderCategoryFilter(chatId: number, messageId: number, category: string) {
    const state = conversationStates.get(chatId)!;
    const skills = categorySkillMap[category] || [];
    const matching = MOCK_ORDERS.filter(o => o.skills.some(s => skills.includes(s)));
    state.shuffledOrderIds = shuffle(matching.map(o => o.id));
    state.currentOrderIndex = 0;
    state.context = 'swiping_orders';
    await showNextOrder(chatId, messageId);
}

async function showNextOrder(chatId: number, messageId: number) {
    const state = conversationStates.get(chatId)!;
    if (state.currentOrderIndex >= state.shuffledOrderIds.length) {
        return Views.showNoMoreOrders(client, chatId, messageId);
    }
    const orderId = state.shuffledOrderIds[state.currentOrderIndex];
    const order = MOCK_ORDERS.find(o => o.id === orderId)!;
    await Views.showOrderCard(client, chatId, order, { text: "👎 Пропустить", data: "show_next_order" }, state.appliedOrderIds, messageId);
}

async function handleShowOrderFavorites(chatId: number, messageId: number) {
    const state = conversationStates.get(chatId)!;
    const favorites = MOCK_ORDERS.filter(o => state.favoriteOrderIds.includes(o.id));
    await Views.showOrderFavoritesScreen(client, chatId, favorites, messageId);
}

async function handleViewOrder(chatId: number, messageId: number, orderId: string) {
    const order = MOCK_ORDERS.find(o => o.id === orderId)!;
    const state = conversationStates.get(chatId)!;
    state.context = 'viewing_favorite_order';
    await Views.showOrderCard(client, chatId, order, { text: "⬅️ К избранному", data: "show_order_favorites" }, state.appliedOrderIds, messageId);
}

// --- Universal Action Handlers ---

async function handleFavorite(chatId: number, messageId: number, callbackQueryId: string, type: 'spec' | 'order', id: string) {
    const state = conversationStates.get(chatId)!;
    const favoriteList = type === 'spec' ? state.favoriteSpecialistIds : state.favoriteOrderIds;
    const alertText = favoriteList.includes(id) ? "Уже в избранном." : "Добавлено в избранное!";
    if (!favoriteList.includes(id)) favoriteList.push(id);
    await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: alertText });
    if (state.context === 'swiping_specs') { state.currentSpecialistIndex++; await showNextSpecialist(chatId, messageId); }
    if (state.context === 'swiping_orders') { state.currentOrderIndex++; await showNextOrder(chatId, messageId); }
}

async function handleContactOrApply(chatId: number, messageId: number, callbackQueryId: string, type: 'spec' | 'order', id: string) {
    const state = conversationStates.get(chatId)!;
    if (type === 'spec') {
        await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: "Отлично! Мы уведомим специалиста о вашем интересе.", show_alert: true });
        if (state.context === 'swiping_specs') { state.currentSpecialistIndex++; await showNextSpecialist(chatId, messageId); }
    } else { // type === 'order'
        if (state.appliedOrderIds.includes(id)) {
            await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: "Вы уже откликнулись на этот заказ." });
            return;
        }
        state.appliedOrderIds.push(id);
        await client.answerCallbackQuery({ callback_query_id: callbackQueryId, text: "Вы откликнулись на заказ!" });
        
        // Redraw the same card to show the button change
        const orderId = state.context === 'swiping_orders' 
            ? state.shuffledOrderIds[state.currentOrderIndex] 
            : id; // if viewing from favorites, the id is the orderId
        const order = MOCK_ORDERS.find(o => o.id === orderId)!;
        const contextualCallback = state.context === 'swiping_orders'
            ? { text: "👎 Пропустить", data: "show_next_order" }
            : { text: "⬅️ К избранному", data: "show_order_favorites" };
        await Views.showOrderCard(client, chatId, order, contextualCallback, state.appliedOrderIds, messageId);
    }
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
                    
                    // Simple callbacks
                    if (data === 'role_client') { await handleRoleClient(chatId, messageId); }
                    else if (data === 'role_specialist') { await handleRoleSpecialist(chatId, messageId); }
                    else if (data === 'show_next_spec') { conversationStates.get(chatId)!.currentSpecialistIndex++; await showNextSpecialist(chatId, messageId); }
                    else if (data === 'show_next_order') { conversationStates.get(chatId)!.currentOrderIndex++; await showNextOrder(chatId, messageId); }
                    else if (data === 'show_spec_favorites') { await handleShowSpecFavorites(chatId, messageId); }
                    else if (data === 'show_order_favorites') { await handleShowOrderFavorites(chatId, messageId); }
                    
                    // Callbacks with data
                    else if (action === 'filter' && args[0] === 'profession') { await handleProfessionFilter(chatId, messageId, args.slice(1).join('_')); }
                    else if (action === 'filter' && args[0] === 'order') { await handleOrderCategoryFilter(chatId, messageId, args.slice(1).join('_')); }
                    else if (action === 'view' && args[0] === 'specialist') { await handleViewSpecialist(chatId, messageId, args.slice(1).join('_')); }
                    else if (action === 'view' && args[0] === 'order') { await handleViewOrder(chatId, messageId, args.slice(1).join('_')); }
                    else if (action === 'favorite' && args[0] === 'spec') { await handleFavorite(chatId, messageId, callbackQueryId, 'spec', args.slice(1).join('_')); }
                    else if (action === 'favorite' && args[0] === 'order') { await handleFavorite(chatId, messageId, callbackQueryId, 'order', args.slice(1).join('_')); }
                    else if (action === 'contact') { await handleContactOrApply(chatId, messageId, callbackQueryId, 'spec', args.join('_')); }
                    else if (action === 'apply') { await handleContactOrApply(chatId, messageId, callbackQueryId, 'order', args.join('_')); }

                    else { console.warn(`[${chatId}] Unhandled callback: ${data}`); }
                    
                    // Acknowledge all callbacks silently if not handled by action handlers
                    if (!['favorite', 'contact', 'apply'].includes(action)) {
                        await client.answerCallbackQuery({ callback_query_id: callbackQueryId });
                    }
                }
            }
        } catch (error) {
            console.error("Critical error in main loop:", error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

main();
