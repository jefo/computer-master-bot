import { TelegramClient } from "packages/telegram-client";
import * as Views from "./src/views/sales-bot-views";

// --- Simple In-Memory State ---
interface ConversationState {
    step: string;
    messageId?: number;
    reportData?: any;
    photosUploaded?: number;
    editingField?: string; // Field being edited (for inline editing)
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

                    // --- Report Data Input (for AWAITING steps) ---
                    if (state.step.startsWith("AWAITING_")) {
                        const reportData = state.reportData || {};
                        
                        // Validate that the input is a number (for normal flow)
                        const numberValue = parseFloat(text.replace(/[^\d.,-]/g, ''));
                        if (isNaN(numberValue) || numberValue < 0) {
                            await client.sendMessage({
                                chat_id: chatId,
                                text: "❌ Пожалуйста, введите корректное числовое значение (только цифры и десятичный разделитель)."
                            });
                            // Re-ask for the same input without advancing the state
                            if (state.step === "AWAITING_REVENUE") await Views.askForRevenue(client, chatId, undefined);
                            else if (state.step === "AWAITING_CASH") await Views.askForCashAmount(client, chatId, undefined);
                            else if (state.step === "AWAITING_CARD") await Views.askForCardAmount(client, chatId, undefined);
                            else if (state.step === "AWAITING_QR") await Views.askForQrAmount(client, chatId, undefined);
                            else if (state.step === "AWAITING_TRANSFER") await Views.askForTransferAmount(client, chatId, undefined);
                            else if (state.step === "AWAITING_RETURNS") await Views.askForReturnsAmount(client, chatId, undefined);
                            else if (state.step === "AWAITING_EMERGENCY_REVENUE") await Views.askForEmergencyClosePrompt(client, chatId, undefined);
                            continue; // Skip further processing and wait for new input
                        }

                        let nextStep = "";

                        if (state.step === "AWAITING_REVENUE") { 
                            reportData.revenue = numberValue; 
                            nextStep = "AWAITING_CASH"; 
                            await Views.askForCashAmount(client, chatId, undefined); 
                        }
                        else if (state.step === "AWAITING_CASH") { 
                            reportData.cash = numberValue; 
                            nextStep = "AWAITING_CARD"; 
                            await Views.askForCardAmount(client, chatId, undefined); 
                        }
                        else if (state.step === "AWAITING_CARD") { 
                            reportData.card = numberValue; 
                            nextStep = "AWAITING_QR"; 
                            await Views.askForQrAmount(client, chatId, undefined); 
                        }
                        else if (state.step === "AWAITING_QR") { 
                            reportData.qr = numberValue; 
                            nextStep = "AWAITING_TRANSFER"; 
                            await Views.askForTransferAmount(client, chatId, undefined); 
                        }
                        else if (state.step === "AWAITING_TRANSFER") { 
                            reportData.transfer = numberValue; 
                            nextStep = "AWAITING_RETURNS"; 
                            await Views.askForReturnsAmount(client, chatId, undefined); 
                        }
                        else if (state.step === "AWAITING_RETURNS") { 
                            reportData.returns = numberValue; 
                            // Show report summary with edit options before proceeding to photos
                            await Views.showReportSummary(client, chatId, undefined, reportData);
                            conversationStates.set(chatId, {
                                ...state,
                                step: "REPORT_SUMMARY", // New step for summary review
                                reportData,
                            });
                             continue;
                        }
                        else if (state.step === "AWAITING_EMERGENCY_REVENUE") {
                             // Validate emergency revenue value and ensure it's a positive number
                             if (numberValue >= 0) {
                                 await Views.showShiftEndMessage(client, chatId, state.messageId!)
                                 console.log(`[${chatId}] Emergency closure with revenue: ${numberValue}`);
                                 conversationStates.delete(chatId);
                             } else {
                                 await client.sendMessage({
                                     chat_id: chatId,
                                     text: "❌ Пожалуйста, введите корректное неотрицательное значение для выручки при экстренном закрытии."
                                 });
                                 await Views.showEmergencyClosePrompt(client, chatId, undefined);
                             }
                             continue;
                        }
                        conversationStates.set(chatId, { ...state, step: nextStep, reportData });
                        continue; // Continue to next update
                    }
                    
                    // --- Handle editing mode (works in any step when editingField is set) ---
                    if (state.editingField) {
                        const reportData = state.reportData || {};
                        
                        // Validate that the input is a number
                        const numberValue = parseFloat(text.replace(/[^\d.,-]/g, ''));
                        if (isNaN(numberValue) || numberValue < 0) {
                            await client.sendMessage({
                                chat_id: chatId,
                                text: "❌ Пожалуйста, введите корректное числовое значение (только цифры и десятичный разделитель)."
                            });
                            // Re-ask for the same input without advancing the state
                            if (state.editingField === "revenue") await Views.askForRevenue(client, chatId, undefined);
                            else if (state.editingField === "cash") await Views.askForCashAmount(client, chatId, undefined);
                            else if (state.editingField === "card") await Views.askForCardAmount(client, chatId, undefined);
                            else if (state.editingField === "qr") await Views.askForQrAmount(client, chatId, undefined);
                            else if (state.editingField === "transfer") await Views.askForTransferAmount(client, chatId, undefined);
                            else if (state.editingField === "returns") await Views.askForReturnsAmount(client, chatId, undefined);
                            continue; // Skip further processing and wait for new input
                        }
                        
                        // Update the specific field
                        reportData[state.editingField] = numberValue;
                        
                        // Clear the editing field state but keep in current step (should be REPORT_SUMMARY)
                        conversationStates.set(chatId, { 
                            ...state, 
                            reportData,
                            editingField: undefined
                        });
                        
                        console.log(`[${chatId}] Updated report data:`, reportData);
                        
                        // Show the updated report summary with edit options (if still in summary step)
                        if (state.step === "REPORT_SUMMARY") {
                            await Views.showReportSummary(client, chatId, undefined, reportData);
                        }
                        continue;
                    }
                    // Handle REPORT_SUMMARY step
                    else if (state.step === "REPORT_SUMMARY") {
                        // If we're in REPORT_SUMMARY but not in editing mode, text messages should be ignored
                        if (!state.editingField) {
                            console.log(`[${chatId}] Text message ignored in REPORT_SUMMARY state (not editing)`);
                        }
                        continue; // Skip text processing in this state, wait for callback or editing mode
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
                    else if (data === "report_summary_confirm") {
                        // After confirming the summary, proceed to photo uploads
                        await Views.askForPhotos(client, chatId, undefined, 0);
                        conversationStates.set(chatId, {
                            ...state,
                            step: "AWAITING_PHOTOS",
                            photosUploaded: 0,
                        });
                    }
                    // Handle inline editing requests
                    else if (data.startsWith("edit_")) {
                        // Extract field to edit (e.g., "edit_revenue", "edit_cash", etc.)
                        const fieldToEdit = data.substring(5); // Remove "edit_" prefix
                        
                        // Set the editing field in state while preserving the current step
                        conversationStates.set(chatId, { 
                            ...state, 
                            editingField: fieldToEdit 
                        });
                        
                        console.log(`[${chatId}] Setting editing field: ${fieldToEdit}, state:`, conversationStates.get(chatId));
                        
                        // Ask for the specific value to edit
                        if (fieldToEdit === "revenue") await Views.askForRevenue(client, chatId, messageId);
                        else if (fieldToEdit === "cash") await Views.askForCashAmount(client, chatId, messageId);
                        else if (fieldToEdit === "card") await Views.askForCardAmount(client, chatId, messageId);
                        else if (fieldToEdit === "qr") await Views.askForQrAmount(client, chatId, messageId);
                        else if (fieldToEdit === "transfer") await Views.askForTransferAmount(client, chatId, messageId);
                        else if (fieldToEdit === "returns") await Views.askForReturnsAmount(client, chatId, messageId);
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
