// src/infra/conversation-state.ts

export type FlowType = "booking" | "emergency";

export interface ConversationState {
	step: "IDLE" | "SELECT_ITEMS" | "REVIEW_SELECTION" | "ASK_DATE";
	flowType?: FlowType;
	selectedItems?: { id: string; name: string }[];
	messageId?: number; // To edit the message with the selection/review card
}


// Map<chatId, state>
const userStates = new Map<number, ConversationState>();

export const getConversationState = (chatId: number): ConversationState | undefined => {
  return userStates.get(chatId);
};

export const setConversationState = (chatId: number, state: ConversationState) => {
  userStates.set(chatId, state);
};

export const clearConversationState = (chatId: number) => {
  userStates.delete(chatId);
};

export const initializeConversationState = (chatId: number): ConversationState => {
  const initialState: ConversationState = { step: 'IDLE' };
  setConversationState(chatId, initialState);
  return initialState;
};
