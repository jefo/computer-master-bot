import { TelegramClient } from "packages/telegram-client";
import * as Views from "./src/views/sales-bot-views";

// --- Simple In-Memory State ---
interface ConversationState {
    step: string;
    messageId?: number;
    reportData?: any;
    photosUploaded?: number;
}
const conversationStates = new Map<number, ConversationState>();

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    console.error("BOT_TOKEN is not set!");
    process.exit(1);
}

const client = new TelegramClient(BOT_TOKEN);
let offset = 0;

console.log("Sales Bot Demo started...");

const mainLoop = async () => {
    while (true) {
        try {
            const updates = await client.getUpdates({ offset, timeout: 30 });

            for (const update of updates) {
                offset = update.update_id + 1;
                const message = update.message || update.callback_query?.message;
                const chatId = message?.chat.id;
                if (!chatId) continue;

                const state = conversationStates.get(chatId) || { step: "START" };

                // --- Text Message Handler ---
                if (update.message?.text) {
                    const text = update.message.text;
                    console.log(`[${chatId}] Text: ${text}`);

                    if (text.startsWith("/start")) {
                        conversationStates.delete(chatId);
                        if (text === "/start_seller") await Views.showSellerMenu(client, chatId);
                        else if (text === "/start_supervisor") await Views.showSupervisorMenu(client, chatId);
                        else if (text === "/start_manager") await Views.showManagerMenu(client, chatId);
                        else await client.sendMessage({ chat_id: chatId, text: "Please use a specific start command: /start_seller, /start_supervisor, or /start_manager" });
                        continue;
                    }

                    // --- Report Data Input ---
                    if (state.step.startsWith("AWAITING_")) {
                        const reportData = state.reportData || {};
                        let nextStep = "";

                        if (state.step === "AWAITING_REVENUE") { reportData.revenue = text; nextStep = "AWAITING_CASH"; await Views.askForCashAmount(client, chatId, undefined); }
                        else if (state.step === "AWAITING_CASH") { reportData.cash = text; nextStep = "AWAITING_CARD"; await Views.askForCardAmount(client, chatId, undefined); }
                        else if (state.step === "AWAITING_CARD") { reportData.card = text; nextStep = "AWAITING_QR"; await Views.askForQrAmount(client, chatId, undefined); }
                        else if (state.step === "AWAITING_QR") { reportData.qr = text; nextStep = "AWAITING_TRANSFER"; await Views.askForTransferAmount(client, chatId, undefined); }
                        else if (state.step === "AWAITING_TRANSFER") { reportData.returns = text; nextStep = "AWAITING_RETURNS"; await Views.askForReturnsAmount(client, chatId, undefined); }
                        else if (state.step === "AWAITING_RETURNS") { 
                            reportData.returns = text; 
                            // Send a NEW message asking for photos, don't save messageId as we won't edit it.
                            await Views.askForPhotos(client, chatId, undefined, 0);
                            conversationStates.set(chatId, {
                                ...state,
                                step: "AWAITING_PHOTOS",
                                reportData,
                                photosUploaded: 0,
                            });
                             continue;
                        }
                        else if (state.step === "AWAITING_EMERGENCY_REVENUE") {
                             await Views.showShiftEndMessage(client, chatId, state.messageId!)
                             console.log(`[${chatId}] Emergency closure with revenue: ${text}`);
                             conversationStates.delete(chatId);
                             continue;
                        }
                        conversationStates.set(chatId, { ...state, step: nextStep, reportData });
                        continue; // Continue to next update
                    }
                }

                // --- Photo Handler ---
                else if (update.message?.photo) {
                    if (state.step === "AWAITING_PHOTOS") {
                        const currentUploadedCount = (state.photosUploaded || 0);
                        const newUploadedCount = currentUploadedCount + 1;
                        console.log(`[${chatId}] Received photo ${newUploadedCount}/4`);
                        
                        if (newUploadedCount < 4) {
                            conversationStates.set(chatId, { ...state, photosUploaded: newUploadedCount });
                            // Send a NEW message for the next photo prompt
                            await Views.askForPhotos(client, chatId, undefined, newUploadedCount);
                        } else { // All 4 photos uploaded
                            conversationStates.set(chatId, { ...state, step: "REPORT_REVIEW", photosUploaded: newUploadedCount });
                            // Send a NEW message for the report review
                            await Views.showReportReview(client, chatId, undefined, state.reportData);
                        }
                    }
                }

                // --- Callback Query Handler ---
                else if (update.callback_query) {
                    const data = update.callback_query.data;
                    const messageId = update.callback_query.message!.message_id;
                    console.log(`[${chatId}] Callback: ${data}`);

                    // Update messageId for current conversation
                    conversationStates.set(chatId, { ...state, messageId });

                    if (data === "back_to_seller_menu") await Views.showSellerMenu(client, chatId, messageId);
                    else if (data === "back_to_supervisor_menu") await Views.showSupervisorMenu(client, chatId, messageId);
                    else if (data === "back_to_manager_menu") await Views.showManagerMenu(client, chatId, messageId);
                    else if (data === "seller_start_shift") await Views.showStoreSelection(client, chatId, messageId);
                    else if (data === "seller_my_stats") await Views.showSellerMyStats(client, chatId, messageId);
                    else if (data.startsWith("select_store_")) {
                        const storeName = "Mock Store"; // In real life, we'd look this up
                        conversationStates.set(chatId, { ...state, step: "ON_SHIFT" });
                        await Views.showActiveShiftMenu(client, chatId, storeName, messageId);
                    }
                    else if (data === "seller_end_shift") {
                        conversationStates.set(chatId, { ...state, step: "AWAITING_REVENUE", photosUploaded: 0 });
                        await Views.askForRevenue(client, chatId, undefined); // Send new message
                    }
                    else if (data === "report_confirm") {
                        console.log(`[${chatId}] Report confirmed:`, state.reportData);
                        await Views.showShiftEndMessage(client, chatId, undefined); // Send new message
                        conversationStates.delete(chatId);
                    }
                    else if (data === "report_edit") {
                        // Restart the report flow
                        conversationStates.set(chatId, { ...state, step: "AWAITING_REVENUE", photosUploaded: 0, reportData: {} });
                        await Views.askForRevenue(client, chatId, undefined); // Send new message
                    }
                    else if (data === "seller_emergency_close") {
                        conversationStates.set(chatId, { ...state, step: "AWAITING_EMERGENCY_REVENUE" });
                        await Views.showEmergencyClosePrompt(client, chatId, undefined); // Send new message
                    }
                    else if (data === "sup_store_stats") await Views.showSupervisorStoreStats(client, chatId, messageId);
                    else if (data === "sup_seller_stats") await Views.showSupervisorSellerStats(client, chatId, messageId);
                    else if (data === "man_store_stats") await Views.showManagerStoreStats(client, chatId, messageId);
                    else if (data === "man_seller_stats") await Views.showManagerSellerStats(client, chatId, messageId);
                    else if (data.includes("_materials")) {
                        await Views.showInDevelopment(client, update.callback_query.id);
                    }

                    await client.answerCallbackQuery({ callback_query_id: update.callback_query.id });
                }
            }
        } catch (error) {
            console.error("Critical error in main loop:", error);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Prevent fast crash loop
        }
    }
};

mainLoop();
