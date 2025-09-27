import { TelegramClient } from "packages/telegram-client";
import * as Views from "./src/views/prof-tinder-bot-views";

// --- Simple In-Memory State ---
interface ConversationState {
    step: string;
    messageId?: number;
    role?: 'client' | 'specialist';
    profileData?: any; // To store form data
    editingField?: string; // To track which field is being edited
}
const conversationStates = new Map<number, ConversationState>();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error("BOT_TOKEN is not set!");
    process.exit(1);
}

const client = new TelegramClient(BOT_TOKEN);
let offset = 0;

// --- Callback Handlers ---

async function handleClientRoleSelection(chatId: number, messageId: number) {
    const state = conversationStates.get(chatId) || { step: "START" };
    conversationStates.set(chatId, { ...state, step: 'CLIENT_ONBOARDING', role: 'client', messageId });
    await Views.showClientWelcome(client, chatId, messageId);
}

async function handleSpecialistRoleSelection(chatId: number, messageId: number) {
    const state = conversationStates.get(chatId) || { step: "START" };
    conversationStates.set(chatId, { ...state, step: 'SPECIALIST_WELCOME', role: 'specialist', messageId });
    await Views.showSpecialistWelcome(client, chatId, messageId);
}

async function handleBackToRoleSelection(chatId: number, messageId: number) {
    conversationStates.set(chatId, { step: 'START', messageId });
    await Views.showRoleSelectionMenu(client, chatId, messageId);
}

async function handleCreateProfileStart(chatId: number, messageId: number) {
    const state = { 
        step: 'PROFILE_CREATION', 
        profileData: {}, 
        messageId 
    };    conversationStates.set(chatId, state);
    await Views.showProfileForm(client, chatId, state.profileData, undefined, messageId);
}

async function handleEditProfileName(chatId: number, messageId: number) {
    const state = conversationStates.get(chatId);
    if (!state || state.step !== 'PROFILE_CREATION') return;

    state.editingField = 'name';
    conversationStates.set(chatId, state);

    // Update the form to show the indicator
    await Views.showProfileForm(client, chatId, state.profileData, 'name', messageId);
    // Ask the user for input in a new message
    await client.sendMessage({ chat_id: chatId, text: "Введите ваше имя:" });
}

// --- Callback Router ---
const callbackRouter = new Map<string, (chatId: number, messageId: number) => Promise<void>>([
    ['role_client', handleClientRoleSelection],
    ['role_specialist', handleSpecialistRoleSelection],
    ['back_to_role_selection', handleBackToRoleSelection],
    ['back_to_specialist_welcome', handleSpecialistRoleSelection], // Alias for back button
    ['create_profile_start', handleCreateProfileStart],
    ['edit_profile_name', handleEditProfileName],
]);

console.log("Prof-Tinder Bot starting with router...");

const mainLoop = async () => {
    while (true) {
        try {
            const updates = await client.getUpdates({ offset, timeout: 30 });

            for (const update of updates) {
                offset = update.update_id + 1;
                const message = update.message || update.callback_query?.message;
                const chatId = message?.chat.id;
                if (!chatId) continue;

                // --- Text Message Handler ---
                if (update.message?.text) {
                    const text = update.message.text;
                    const state = conversationStates.get(chatId);

                    if (text.startsWith("/start")) {
                        console.log(`[${chatId}] Received /start command`);
                        conversationStates.delete(chatId);
                        await Views.showRoleSelectionMenu(client, chatId);
                        continue;
                    }

                    // Handle text input during form filling
                    if (state && state.step === 'PROFILE_CREATION' && state.editingField) {
                        const field = state.editingField;
                        state.profileData[field] = text;
                        state.editingField = undefined; // Clear editing field
                        conversationStates.set(chatId, state);

                        // Re-render the form with updated data
                        await Views.showProfileForm(client, chatId, state.profileData, undefined, state.messageId);
                        continue;
                    }
                }

                // --- Callback Query Handler ---
                else if (update.callback_query) {
                    const data = update.callback_query.data;
                    const messageId = update.callback_query.message!.message_id;
                    console.log(`[${chatId}] Callback: ${data}`);

                    // Answer callback query immediately to make the UI responsive.
                    await client.answerCallbackQuery({ callback_query_id: update.callback_query.id });

                    const handler = callbackRouter.get(data);
                    if (handler) {
                        await handler(chatId, messageId);
                    } else {
                        console.warn(`[${chatId}] No handler found for callback data: ${data}`);
                    }
                }

            }
        } catch (error) {
            console.error("Critical error in main loop:", error);
            // Avoid fast crash loop
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

mainLoop();
