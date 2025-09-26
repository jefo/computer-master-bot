import { TelegramClient } from "packages/telegram-client";
import * as Views from "./src/views/sales-bot-views";

// --- Simple In-Memory State ---
interface ConversationState {
    step: string;
    messageId?: number;        // ID of the main form message
    inputMessageId?: number;   // ID of the input instruction message
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

                    
                    
                    // --- Handle editing mode (works in REPORT_FORM step when editingField is set) ---
                    if (state.editingField) {
                        const reportData = state.reportData || {};
                        
                        // Validate that the input is a number
                        const numberValue = parseFloat(text.replace(/[^\d.,-]/g, ''));
                        if (isNaN(numberValue) || numberValue < 0) {
                            await client.sendMessage({
                                chat_id: chatId,
                                text: "❌ Пожалуйста, введите корректное числовое значение (только цифры и десятичный разделитель)."
                            });
                            // Show the form with editing instructions again
                            await Views.showReportForm(client, chatId, state.messageId, reportData, state.editingField);
                            
                            // Resend input instruction
                            let fieldPrompt = "";
                            if (state.editingField === "revenue") fieldPrompt = "общую сумму выручки";
                            else if (state.editingField === "cash") fieldPrompt = "наличные";
                            else if (state.editingField === "card") fieldPrompt = "безналичный расчет";
                            else if (state.editingField === "qr") fieldPrompt = "оплату по QR-коду";
                            else if (state.editingField === "transfer") fieldPrompt = "переводом";
                            else if (state.editingField === "returns") fieldPrompt = "возвраты";
                            
                            // Delete the previous input instruction message if exists
                            if (state.inputMessageId) {
                                try {
                                    await client.deleteMessage({ 
                                        chat_id: chatId, 
                                        message_id: state.inputMessageId 
                                    });
                                } catch (e) {
                                    // Message might not exist or already be deleted, ignore error
                                }
                            }
                            
                            // Send new input instruction message
                            const inputMessage = await client.sendMessage({
                                chat_id: chatId,
                                text: `Введите сумму для поля "${fieldPrompt}":`
                            });
                            
                            // Update state with new input message ID
                            conversationStates.set(chatId, { 
                                ...state, 
                                inputMessageId: inputMessage.message_id
                            });
                            continue; // Skip further processing and wait for new input
                        }
                        
                        // Update the specific field
                        reportData[state.editingField] = numberValue;
                        
                        // Send confirmation message for the entered value
                        let fieldLabel = "";
                        if (state.editingField === "revenue") fieldLabel = "Общая выручка";
                        else if (state.editingField === "cash") fieldLabel = "Наличные";
                        else if (state.editingField === "card") fieldLabel = "Безналичный расчет";
                        else if (state.editingField === "qr") fieldLabel = "Оплата по QR-коду";
                        else if (state.editingField === "transfer") fieldLabel = "Переводом";
                        else if (state.editingField === "returns") fieldLabel = "Возвраты";
                        
                        await client.sendMessage({
                            chat_id: chatId,
                            text: `✅ ${fieldLabel}: ${numberValue.toLocaleString('ru-RU')} руб.`
                        });
                        
                        // Clear the editing field state but keep in REPORT_FORM step
                        conversationStates.set(chatId, { 
                            ...state, 
                            reportData,
                            editingField: undefined
                        });
                        
                        console.log(`[${chatId}] Updated report data:`, reportData);
                        
                        // Show the updated report form (if still in form step)
                        if (state.step === "REPORT_FORM") {
                            await Views.showReportForm(client, chatId, state.messageId, reportData, undefined);
                        }
                        
                        // Find next field to edit (the first one that is not filled)
                        let nextField = null;
                        if (reportData.cash === undefined) nextField = "cash";
                        else if (reportData.card === undefined) nextField = "card";
                        else if (reportData.qr === undefined) nextField = "qr";
                        else if (reportData.transfer === undefined) nextField = "transfer";
                        else if (reportData.returns === undefined) nextField = "returns";
                        
                        // Delete the previous input instruction message if exists
                        if (state.inputMessageId) {
                            try {
                                await client.deleteMessage({ 
                                    chat_id: chatId, 
                                    message_id: state.inputMessageId 
                                });
                            } catch (e) {
                                // Message might not exist or already be deleted, ignore error
                            }
                        }
                        
                        if (nextField) {
                            // Send new input instruction message
                            let fieldPrompt = "";
                            if (nextField === "revenue") fieldPrompt = "общую сумму выручки";
                            else if (nextField === "cash") fieldPrompt = "наличные";
                            else if (nextField === "card") fieldPrompt = "безналичный расчет";
                            else if (nextField === "qr") fieldPrompt = "оплату по QR-коду";
                            else if (nextField === "transfer") fieldPrompt = "переводом";
                            else if (nextField === "returns") fieldPrompt = "возвраты";
                            
                            const inputMessage = await client.sendMessage({
                                chat_id: chatId,
                                text: `Введите сумму для поля "${fieldPrompt}":`
                            });
                            
                            // Update state with new input message ID and set next field to edit
                            conversationStates.set(chatId, { 
                                ...state, 
                                editingField: nextField,
                                inputMessageId: inputMessage.message_id
                            });
                        } else {
                            // All fields are filled, no need for input message
                            conversationStates.set(chatId, { 
                                ...state, 
                                inputMessageId: undefined
                            });
                        }
                        continue;
                    }
                    // Handle REPORT_FORM step
                    else if (state.step === "REPORT_FORM") {
                        // If we're in REPORT_FORM but not in editing mode, text messages should be ignored
                        if (!state.editingField) {
                            console.log(`[${chatId}] Text message ignored in REPORT_FORM state (not editing)`);
                        }
                        continue; // Skip text processing in this state, wait for callback or editing mode
                    }
                    // Handle EMERGENCY_CLOSE step
                    else if (state.step === "EMERGENCY_CLOSE") {
                        // Validate that the input is a number
                        const numberValue = parseFloat(text.replace(/[^\d.,-]/g, ''));
                        if (isNaN(numberValue) || numberValue < 0) {
                            await client.sendMessage({
                                chat_id: chatId,
                                text: "❌ Пожалуйста, введите корректное неотрицательное числовое значение для выручки при экстренном закрытии."
                            });
                            await client.sendMessage({
                                chat_id: chatId,
                                text: "Введите актуальную сумму выручки на момент экстренного закрытия:"
                            });
                            continue; // Skip further processing and wait for new input
                        }
                        
                        // Process emergency close with the provided revenue
                        await Views.showShiftEndMessage(client, chatId, state.messageId!);
                        console.log(`[${chatId}] Emergency closure with revenue: ${numberValue}`);
                        conversationStates.delete(chatId);
                        continue;
                    }
                    // Handle REPORT_SUMMARY step (for backward compatibility)
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
                        // Initialize the report form with an empty report
                        conversationStates.set(chatId, { 
                            ...state, 
                            step: "REPORT_FORM", 
                            reportData: {
                                revenue: undefined, // For future use if needed
                                cash: undefined,
                                card: undefined,
                                qr: undefined,
                                transfer: undefined,
                                returns: undefined
                            },
                            inputMessageId: undefined // Initially no input message
                        });
                        
                        // Show the empty form
                        const formMessage = await Views.showReportForm(client, chatId, messageId, {
                            revenue: undefined,
                            cash: undefined,
                            card: undefined,
                            qr: undefined,
                            transfer: undefined,
                            returns: undefined
                        });
                        
                        // Update the state with the form message ID
                        conversationStates.set(chatId, { 
                            ...state, 
                            step: "REPORT_FORM", 
                            messageId: formMessage.message_id,
                            reportData: {
                                revenue: undefined,
                                cash: undefined,
                                card: undefined,
                                qr: undefined,
                                transfer: undefined,
                                returns: undefined
                            },
                            inputMessageId: undefined
                        });
                        
                        // Send first input instruction - for the card field
                        const inputMessage = await client.sendMessage({
                            chat_id: chatId,
                            text: 'Введите сумму для поля "безналичный расчет":'
                        });
                        
                        // Update state with the input message ID and set to edit card
                        const updatedState = conversationStates.get(chatId);
                        if (updatedState) {
                            conversationStates.set(chatId, {
                                ...updatedState,
                                inputMessageId: inputMessage.message_id,
                                editingField: "card"
                            });
                        }
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
                    else if (data === "report_form_confirm") {
                        // After confirming the form, proceed to photo uploads
                        await Views.askForPhotos(client, chatId, undefined, 0);
                        conversationStates.set(chatId, {
                            ...state,
                            step: "AWAITING_PHOTOS",
                            photosUploaded: 0,
                        });
                    }
                    // Handle inline editing requests for REPORT_FORM
                    else if (data.startsWith("edit_")) {
                        // Extract field to edit (e.g., "edit_revenue", "edit_cash", etc.)
                        const fieldToEdit = data.substring(5); // Remove "edit_" prefix
                        
                        // Set the editing field in state
                        conversationStates.set(chatId, { 
                            ...state, 
                            editingField: fieldToEdit 
                        });
                        
                        console.log(`[${chatId}] Setting editing field: ${fieldToEdit}, state:`, conversationStates.get(chatId));
                        
                        // Update the form message (if it exists)
                        await Views.showReportForm(client, chatId, state.messageId, state.reportData, fieldToEdit);
                        
                        // Send or update the input instruction message
                        let fieldPrompt = "";
                        if (fieldToEdit === "revenue") fieldPrompt = "общую сумму выручки";
                        else if (fieldToEdit === "cash") fieldPrompt = "наличные";
                        else if (fieldToEdit === "card") fieldPrompt = "безналичный расчет";
                        else if (fieldToEdit === "qr") fieldPrompt = "оплату по QR-коду";
                        else if (fieldToEdit === "transfer") fieldPrompt = "переводом";
                        else if (fieldToEdit === "returns") fieldPrompt = "возвраты";
                        
                        // Delete the previous input instruction message if exists
                        if (state.inputMessageId) {
                            try {
                                await client.deleteMessage({ 
                                    chat_id: chatId, 
                                    message_id: state.inputMessageId 
                                });
                            } catch (e) {
                                // Message might not exist or already be deleted, ignore error
                            }
                        }
                        
                        // Send new input instruction message
                        const inputMessage = await client.sendMessage({
                            chat_id: chatId,
                            text: `Введите сумму для поля "${fieldPrompt}":`
                        });
                        
                        // Update state with new input message ID
                        conversationStates.set(chatId, { 
                            ...state, 
                            editingField: fieldToEdit,
                            inputMessageId: inputMessage.message_id
                        });
                    }
                    else if (data === "seller_emergency_close") {
                        // For emergency close, we'll use a simplified flow
                        conversationStates.set(chatId, { ...state, step: "EMERGENCY_CLOSE" });
                        await client.sendMessage({
                            chat_id: chatId,
                            text: "Введите актуальную сумму выручки на момент экстренного закрытия:"
                        });
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
