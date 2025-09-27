import type { TelegramClient } from "../../../packages/telegram-client";

// Function to show a temporary message to indicate processing
export const showProcessingMessage = async (
  client: TelegramClient,
  chatId: number,
  message: string = "Обработка запроса..."
): Promise<number> => {
  const response = await client.sendMessage({
    chat_id: chatId,
    text: `⏳ ${message}`
  });
  
  return response.message_id;
};

// Function to update a message with a success indicator
export const updateMessageWithSuccess = async (
  client: TelegramClient,
  chatId: number,
  messageId: number,
  message: string = "Готово!"
): Promise<void> => {
  await client.editMessageText({
    chat_id: chatId,
    message_id: messageId,
    text: `✅ ${message}`
  });
};

// Function to update a message with a loading indicator
export const updateMessageWithLoading = async (
  client: TelegramClient,
  chatId: number,
  messageId: number,
  progress: number // from 0 to 100
): Promise<void> => {
  const progressBar = getProgressBar(progress);
  await client.editMessageText({
    chat_id: chatId,
    message_id: messageId,
    text: `Загрузка: ${progressBar} ${progress}%`
  });
};

// Helper function to create a visual progress bar
const getProgressBar = (progress: number): string => {
  const totalLength = 10;
  const filledLength = Math.round((progress / 100) * totalLength);
  const emptyLength = totalLength - filledLength;
  
  return '█'.repeat(filledLength) + '░'.repeat(emptyLength);
};

// Function to create a temporary message with a spinner animation
export const showAnimatedMessage = async (
  client: TelegramClient,
  chatId: number,
  baseMessage: string = "Обработка",
  duration: number = 3000 // in ms
): Promise<void> => {
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const startTime = Date.now();
  
  let currentFrame = 0;
  const response = await client.sendMessage({
    chat_id: chatId,
    text: `${spinnerFrames[currentFrame]} ${baseMessage}`
  });
  
  const messageId = response.message_id;
  
  const interval = setInterval(async () => {
    if (Date.now() - startTime >= duration) {
      clearInterval(interval);
      return;
    }
    
    currentFrame = (currentFrame + 1) % spinnerFrames.length;
    await client.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: `${spinnerFrames[currentFrame]} ${baseMessage}`
    });
  }, 200);
};