
import type { Update, Message, User, Chat } from '@computer-master/telegram-client';
import type { TelegramClient } from '@computer-master/telegram-client';
import type { Router } from './router';

//================================================================================
// Core Application
//================================================================================

/**
 * The main context object passed to handlers and middleware.
 * It provides an abstraction over the Telegram update, methods to reply, and state management.
 */
export interface AppContext {
  /** The raw update object from the Telegram API. */
  readonly update: Update;
  /** The Telegram client instance for making API calls. */
  readonly client: TelegramClient;
  /** The router instance, used internally for flow control. */
  readonly router: Router;
  /** The user who initiated the update. */
  readonly from: User | undefined;
  /** The chat where the update originated. */
  readonly chat: Chat | undefined;

  /** Session data for the current user, persisted between updates. */
  session: Record<string, any>;

  /** State for the current request, passed between middleware but not persisted. */
  state: Record<string, any>;

  /** Parameters extracted from the route pattern (e.g., from `action::id`). */
  params: Record<string, string>;

  /**
   * Sends a new message to the chat.
   * @param text The message text.
   * @param extra Additional parameters for the Telegram API `sendMessage` method.
   */
  reply(text: string, extra?: any): Promise<Message>;

  /**
   * Edits the text of the message associated with the current update.
   * Typically used in response to a `callback_query`.
   * @param text The new message text.
   * @param extra Additional parameters for the Telegram API `editMessageText` method.
   */
  editMessageText(text: string, extra?: any): Promise<Message | boolean>;

  /**
   * Deletes the message associated with the current update.
   */
  deleteMessage(): Promise<boolean>;

  /**
   * Answers a callback query, typically to dismiss the loading state on a button.
   * @param text Optional text to show in a notification to the user.
   */
  answerCallbackQuery(text?: string): Promise<boolean>;

  /**
   * Enters a stateful flow.
   * @param flowName The name of the flow to enter.
   * @param initialState The initial state within the flow (defaults to 'index').
   */
  enterFlow(flowName: string, initialState?: string): Promise<void>;
}

/**
 * An asynchronous function that processes an update for a stateless route.
 * @param ctx The application context for the current update.
 */
export type Handler = (ctx: AppContext) => Promise<void>;

/**
 * An asynchronous function that can process an update before it reaches the main handler.
 * @param ctx The application context for the current update.
 * @param next A function to call to pass control to the next middleware in the chain.
 */
export type Middleware = (ctx: AppContext, next: () => Promise<void>) => Promise<void>;


//================================================================================
// Flow Controller
//================================================================================

/**
 * Describes the payload for a message to be sent to Telegram.
 * This is the return type for a Component function.
 */
export interface MessagePayload {
  /** The text content of the message. */
  text: string;
  /** The parse mode for the message text (e.g., 'HTML'). */
  parse_mode?: 'HTML' | 'MarkdownV2';
  /** The inline keyboard markup for the message. */
  reply_markup?: {
    inline_keyboard: {
      text: string;
      callback_data: string;
    }[][];
  };
}

/**
 * A UI component function.
 * It receives props and returns a `MessagePayload` that describes the message to be rendered.
 * @param props The data required for the component to render.
 */
export type Component = (props: any) => Promise<MessagePayload>;

/**
 * A function that executes a business logic query to fetch data (DTO).
 * It receives the context for access to session, user info, etc.
 * @param ctx The application context.
 */
export type QueryFunction<TResult = any> = (ctx: AppContext) => Promise<TResult>;

/**
 * A function that executes a business logic command to change data.
 * It receives a payload from the user interaction and the application context.
 * @param payload The data from the user interaction (e.g., text input, callback query params).
 * @param ctx The application context.
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
  /** If true, re-renders the current state with the result of the command, instead of transitioning. */
  refresh?: boolean;
}

/**
 * Defines a single state within a stateful flow.
 */
export interface FlowState {
  /** The UI component to render for this state. */
  component: Component;
  /** An optional query to execute to fetch data when entering this state. The result is passed to the component as props. */
  onEnter?: QueryFunction;
  /** A map of handlers for callback query actions. The key is a string (e.g., 'action::id') or a RegExp. */
  onAction?: Record<string, ActionHandler>;
  /** A map of handlers for text messages. The key is a string (e.g., ':name') or a RegExp. */
  onText?: Record<string, ActionHandler>;
}

/**
 * The complete configuration for a state machine, mapping state names to `FlowState` definitions.
 */
export type FlowConfig = Record<string, FlowState>;

//================================================================================
// Session Management
//================================================================================

/**
 * Defines the contract for a session store, allowing for pluggable persistence.
 */
export interface ISessionStore {
  /**
   * Retrieves a session for a given key.
   * @param key The unique session key (usually the user ID).
   * @returns The session data, or `undefined` if not found.
   */
  get(key: string): Promise<Record<string, any> | undefined>;

  /**
   * Saves a session for a given key.
   * @param key The unique session key.
   * @param value The session data to save.
   */
  set(key: string, value: Record<string, any>): Promise<void>;

  /**
   * Deletes a session for a given key.
   * @param key The unique session key.
   */
  delete(key: string): Promise<void>;
}

