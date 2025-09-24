// interfaces.ts - Export Telegram API interfaces and types

/**
 * This file exports the core interfaces and types for the Telegram Bot API
 * These are re-exported from telegram-types.ts for backward compatibility
 */

export type {
  ApiResponse,
  User,
  Chat,
  Message,
  Update,
  SendMessageParams,
  GetMeResponse,
  SendMessageResponse,
  GetUpdatesParams,
  GetUpdatesResponse
} from './telegram-types';
