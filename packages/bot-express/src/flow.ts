
import type { AppContext, FlowConfig, ActionHandler } from './types';
import { pathStringToRegex } from './utils';

/**
 * Manages the logic for a stateful, multi-step dialogue (a "flow").
 * It acts as a state machine, transitioning between states based on user actions.
 */
export class FlowController {
  /** The unique name of this flow. */
  public readonly name: string;
  private readonly config: FlowConfig;

  /**
   * Creates a new FlowController.
   * @param config The configuration object defining the states and transitions.
   * @param name The unique name for this flow.
   */
  constructor(config: FlowConfig, name: string) {
    this.config = config;
    this.name = name;
  }

  /**
   * Handles an update if the user is currently in this flow.
   * @param ctx The application context.
   * @returns `true` if the update was handled by the flow, `false` otherwise.
   * @internal
   */
  public async handle(ctx: AppContext): Promise<boolean> {
    if (ctx.session.flowName !== this.name) {
      return false;
    }

    const currentStateName = ctx.session.flowState ?? 'index';
    const currentState = this.config[currentStateName];

    if (!currentState) {
      console.error(`State '${currentStateName}' not found in flow '${this.name}'`);
      this.exitFlow(ctx);
      return false;
    }

    const processPatterns = async (text: string, handlers: Record<string, ActionHandler>): Promise<boolean> => {
      for (const pattern in handlers) {
        const regex = pattern.includes(':') ? pathStringToRegex(pattern) : new RegExp(pattern);
        const match = text.match(regex);
        if (match) {
          const action = handlers[pattern];
          ctx.params = match.groups ?? {};
          await this.executeAction(action, ctx);
          return true;
        }
      }
      return false;
    };

    // Check for a callback query action
    const callbackData = ctx.update.callback_query?.data;
    if (callbackData && currentState.onAction) {
      if (await processPatterns(callbackData, currentState.onAction)) return true;
    }

    // Check for a text message action
    const text = ctx.update.message?.text;
    if (text && currentState.onText) {
      if (await processPatterns(text, currentState.onText)) return true;
    }

    // If no action was triggered, just re-render the current state.
    await this.renderState(currentStateName, ctx);
    return true;
  }

  /** @internal */
  private async executeAction(action: ActionHandler, ctx: AppContext) {
    const payload = { params: ctx.params, session: ctx.session, text: ctx.update.message?.text };
    const result = await action.command(payload, ctx);

    let nextStateName: string | undefined;
    if (action.refresh) {
      nextStateName = ctx.session.flowState;
    } else if (action.nextState) {
      nextStateName = typeof action.nextState === 'function' ? action.nextState(result) : action.nextState;
    }

    if (nextStateName) {
      ctx.session.flowState = nextStateName;
      await this.renderState(nextStateName, ctx);
    } else {
      // If there's no next state, the flow is considered finished.
      this.exitFlow(ctx);
    }
  }

  /** @internal */
  private async renderState(stateName: string, ctx: AppContext) {
    const state = this.config[stateName];
    if (!state) {
      console.error(`Cannot render non-existent state '${stateName}' in flow '${this.name}'`);
      this.exitFlow(ctx);
      return;
    }

    // 1. Get data for the component by running the onEnter query.
    const props = state.onEnter ? await state.onEnter(ctx) : {};

    // 2. Render the component to get the message payload.
    const messagePayload = await state.component(props);

    // 3. Send or edit the message.
    const isUpdateFromCallback = !!ctx.update.callback_query;
    if (isUpdateFromCallback) {
      await ctx.answerCallbackQuery(); // Acknowledge the button press
      await ctx.editMessageText(messagePayload.text, { reply_markup: messagePayload.reply_markup });
    } else {
      await ctx.reply(messagePayload.text, { reply_markup: messagePayload.reply_markup });
    }
  }

  /** @internal */
  private exitFlow(ctx: AppContext) {
    delete ctx.session.flowName;
    delete ctx.session.flowState;
  }
}

/**
 * A factory function for creating a `FlowConfig` object with type inference.
 * @param config The flow configuration object.
 * @returns The same configuration object.
 */
export function createFlow(config: FlowConfig): FlowConfig {
  return config;
}
