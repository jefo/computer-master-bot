// Simple in-memory storage for conversation state
// In production, this would use a persistent database
interface ConversationState {
  step: string;
  selectedCountry?: string;
  selectedPlan?: string;
  orderId?: string;
  userId?: number;
  timestamp?: number;
}

const conversationStates = new Map<number, ConversationState>();

export const getConversationState = (chatId: number): ConversationState | undefined => {
  return conversationStates.get(chatId);
};

export const setConversationState = (chatId: number, state: ConversationState): void => {
  conversationStates.set(chatId, state);
};

export const clearConversationState = (chatId: number): void => {
  conversationStates.delete(chatId);
};

export const initializeConversationState = (chatId: number): ConversationState => {
  const initialState: ConversationState = {
    step: "MAIN_MENU",
    userId: chatId,
    timestamp: Date.now(),
  };
  conversationStates.set(chatId, initialState);
  return initialState;
};