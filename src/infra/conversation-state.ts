// src/infra/conversation-state.ts

export interface ConversationState {
  step: 'IDLE' | 'SELECT_SERVICE' | 'ASK_DATE' | 'SELECT_TIMESLOT' | 'ASK_CONTACT_INFO';
  serviceId?: string;
  serviceName?: string;
  selectedDate?: Date;
  selectedTimeSlotId?: string;
  // Добавляйте другие поля по мере необходимости для флоу записи
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
