
import type { Update } from '@computer-master/telegram-client';
import { TelegramClient } from '@computer-master/telegram-client';
import { BotContext } from './context';
import type { Handler, Middleware } from './types';
import { FlowController } from './flow';
import { pathStringToRegex } from './utils';

/** @internal */
interface Route {
  pattern: RegExp;
  handler: Handler;
}

/**
 * The main router for the application.
 * It dispatches updates to the appropriate handlers, middleware, and flow controllers.
 */
export class Router {
  private commandRoutes: Route[] = [];
  private callbackQueryRoutes: Route[] = [];
  private textRoutes: Route[] = [];
  private middlewares: Middleware[] = [];
  private flows: Record<string, FlowController> = {};

  /**
   * Registers a handler for a slash command.
   * @param command The command name (without the slash) or a RegExp to match against the message text.
   * @param handler The function to execute when the command matches.
   */
  public onCommand(command: string | RegExp, handler: Handler) {
    const pattern = command instanceof RegExp ? command : new RegExp(`^/${command}(?:@\w+)?(?:\s+(.*))?$`);
    this.commandRoutes.push({ pattern, handler });
  }

  /**
   * Registers a handler for a callback query from an inline keyboard.
   * @param pattern A string (e.g., 'action::id'), or a RegExp to match against the callback_data.
   * @param handler The function to execute when the pattern matches.
   */
  public onCallbackQuery(pattern: string | RegExp, handler: Handler) {
    const re = typeof pattern === 'string' && pattern.includes(':')
      ? pathStringToRegex(pattern)
      : new RegExp(pattern);
    this.callbackQueryRoutes.push({ pattern: re, handler });
  }

  /**
   * Registers a handler for a text message.
   * @param pattern A string (e.g., 'hello :name') or a RegExp to match against the message text.
   * @param handler The function to execute when the pattern matches.
   */
  public onText(pattern: string | RegExp, handler: Handler) {
    const re = typeof pattern === 'string' && pattern.includes(':')
      ? pathStringToRegex(pattern)
      : new RegExp(pattern);
    this.textRoutes.push({ pattern: re, handler });
  }
  
  /**
   * Registers a stateful flow controller.
   * @param flow The `FlowController` instance to add.
   */
  public addFlow(flow: FlowController) {
    this.flows[flow.name] = flow;
  }

  /**
   * Registers a middleware function to be executed for every update.
   * @param middleware The middleware function.
   */
  public use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  /**
   * The main entry point for handling an update from the Telegram API.
   * It creates a context, runs middleware, and then delegates to the internal router.
   * @internal
   */
  public async handle(update: Update, client: TelegramClient) {
    const ctx = new BotContext(client, update, this);

    const composedMiddleware = this.middlewares.reduceRight(
      (next, middleware) => () => middleware(ctx, next),
      async () => {
        await this.route(ctx);
      }
    );

    try {
      await composedMiddleware();
    } catch (e) {
      console.error("Error handling update:", e);
    }
  }

  /**
   * The internal routing logic.
   * It first checks if a flow should handle the update, then checks stateless routes.
   * @internal
   */
  public async route(ctx: BotContext) {
    const { update } = ctx;

    // If the user is in a flow, delegate to the flow controller first.
    if (ctx.session.flowName) {
      const flow = this.flows[ctx.session.flowName];
      if (flow) {
        const handled = await flow.handle(ctx);
        if (handled) return; // If the flow handled it, we're done.
      }
    }

    // Otherwise, try to match stateless routes.
    if (update.message?.text) {
      if (await this.processRoutes(this.commandRoutes, update.message.text, ctx)) return;
      if (await this.processRoutes(this.textRoutes, update.message.text, ctx)) return;
    }

    if (update.callback_query?.data) {
      if (await this.processRoutes(this.callbackQueryRoutes, update.callback_query.data, ctx)) return;
    }
  }

  /** @internal */
  private async processRoutes(routes: Route[], text: string, ctx: BotContext): Promise<boolean> {
    for (const route of routes) {
      const match = text.match(route.pattern);
      if (match) {
        ctx.params = match.groups ?? {};
        await route.handler(ctx);
        return true;
      }
    }
    return false;
  }
}
