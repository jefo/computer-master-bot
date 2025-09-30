
import type { AppContext, FlowConfig, ActionHandler } from './types';

export class FlowController {
  public readonly name: string;
  private readonly config: FlowConfig;

  constructor(config: FlowConfig, name: string) {
    this.config = config;
    this.name = name;
  }

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

    // Is this an action triggered by a button?
    const callbackData = ctx.update.callback_query?.data;
    if (callbackData && currentState.onAction) {
      for (const pattern in currentState.onAction) {
        const match = callbackData.match(new RegExp(pattern));
        if (match) {
          const action = currentState.onAction[pattern];
          ctx.params = match.groups ?? {}; // Save regex groups for the command
          await this.executeAction(action, ctx);
          return true; // Action handled
        }
      }
    }

    // If no action was triggered, just render the current state.
    // This happens on initial entry or on a text message.
    await this.renderState(currentStateName, ctx);
    return true;
  }

  private async executeAction(action: ActionHandler, ctx: AppContext) {
    // The payload for the command can be built from ctx, params, etc.
    // For now, we pass a simple payload.
    const payload = { params: ctx.params, session: ctx.session };
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
      // If no next state, the flow might be over
      this.exitFlow(ctx);
    }
  }

  private async renderState(stateName: string, ctx: AppContext) {
    const state = this.config[stateName];
    if (!state) {
      console.error(`Cannot render non-existent state '${stateName}'`);
      this.exitFlow(ctx);
      return;
    }

    // 1. Get data for the component
    const props = state.onEnter ? await state.onEnter(ctx) : {};

    // 2. Render the component
    const messagePayload = await state.component(props);

    // 3. Send to user
    // If we are in a flow (i.e., from a button), we should edit the existing message.
    const isUpdateFromCallback = !!ctx.update.callback_query;
    if (isUpdateFromCallback) {
      await ctx.answerCallbackQuery(); // Acknowledge the button press
      await ctx.editMessageText(messagePayload.text, { reply_markup: messagePayload.reply_markup });
    } else {
      await ctx.reply(messagePayload.text, { reply_markup: messagePayload.reply_markup });
    }
  }

  private exitFlow(ctx: AppContext) {
    delete ctx.session.flowName;
    delete ctx.session.flowState;
  }
}

/**
 * Factory function to create a flow configuration.
 */
export function createFlow(config: FlowConfig): FlowConfig {
  return config;
}
