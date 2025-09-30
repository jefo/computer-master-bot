
import type { Update, Message } from '@computer-master/telegram-client';
import type { TelegramClient } from '@computer-master/telegram-client';
import type { Router } from './router';

//================================================================================
// Core Application
//================================================================================

/**
 * The main context object passed to handlers.
 * It provides an abstraction over the Telegram update and a convenient API.
 */
export interface AppContext {
  update: Update;
  readonly client: TelegramClient;
  readonly router: Router;
  readonly from: Update['message']['from'] | Update['callback_query']['from'];
  readonly chat: Update['message']['chat'] | Update['callback_query']['message']['chat'];

  // Session data for the current user
  session: Record<string, any>;

  // State for the current request, passed between middleware
  state: Record<string, any>;

  // Regex match parameters from the router
  params: Record<string, string>;

  // Core methods for replying
  reply(text: string, extra?: any): Promise<Message>;
  editMessageText(text: string, extra?: any): Promise<Message | boolean>;
  deleteMessage(): Promise<boolean>;
  answerCallbackQuery(text?: string): Promise<boolean>;

  // Flow control
  enterFlow(flowName: string, initialState?: string): Promise<void>;
}

/**
 * A handler is an async function that processes an update.
 */
export type Handler = (ctx: AppContext) => Promise<void>;

/**
 * Middleware is a function that processes a context object and can pass control to the next middleware.
 */
export type Middleware = (ctx: AppContext, next: () => Promise<void>) => Promise<void>;


//================================================================================
// Flow Controller
//================================================================================

/**
 * Describes the payload for a message to be sent to Telegram.
 * This is what a Component function should return.
 */
export interface MessagePayload {
  text: string;
  parse_mode?: 'HTML' | 'MarkdownV2';
  reply_markup?: {
    inline_keyboard: {
      text: string;
      callback_data: string;
    }[][];
  };
}

/**
 * A Component is a function that takes props and returns a message payload.
 */
export type Component = (props: any) => Promise<MessagePayload>;

/**
 * A function that executes a business logic query and returns data (DTO).
 * It receives the context for access to session, user info, etc.
 */
export type QueryFunction<TResult = any> = (ctx: AppContext) => Promise<TResult>;

/**
 * A function that executes a business logic command.
 * It receives a payload from the user interaction (e.g., form submission) and the context.
 */
export type CommandFunction<TPayload = any, TResult = any> = (payload: TPayload, ctx: AppContext) => Promise<TResult>;

/**
 * Defines an action to be taken in response to a user interaction within a flow state.
 */
export interface ActionHandler {
  /** The business logic command to execute. */
  command: CommandFunction;
  /** The next state to transition to. Can be a static string or a function of the command's result. */
  nextState?: string | ((result: any) => string);
  /** If true, re-renders the current state instead of transitioning. */
  refresh?: boolean;
}

/**
 * Defines a single state within a flow.
 */
export interface FlowState {
  /** The component to render for this state. */
  component: Component;
  /** A query to execute to fetch data when entering this state. */
  onEnter?: QueryFunction;
  /** A map of handlers for user actions (e.g., button clicks). The key is a regex for the callback_data. */
  onAction?: Record<string, ActionHandler>;
}

/**
 * The complete configuration for a state machine (a flow).
 */
export type FlowConfig = Record<string, FlowState>;
