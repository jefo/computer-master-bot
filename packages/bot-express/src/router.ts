
import type { Update } from '@computer-master/telegram-client';
import { TelegramClient } from '@computer-master/telegram-client';
import { BotContext } from './context';
import type { Handler, Middleware } from './types';
import { FlowController } from './flow';

interface Route {
  pattern: RegExp;
  handler: Handler;
}

export class Router {
  private commandRoutes: Route[] = [];
  private callbackQueryRoutes: Route[] = [];
  private textRoutes: Route[] = [];
  private middlewares: Middleware[] = [];
  private flows: Record<string, FlowController> = {};

  public onCommand(command: string | RegExp, handler: Handler) {
    const pattern = command instanceof RegExp ? command : new RegExp(`^/${command}(?:@\w+)?(?:\s+(.*))?$`);
    this.commandRoutes.push({ pattern, handler });
  }

  public onCallbackQuery(pattern: string | RegExp, handler: Handler) {
    const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    this.callbackQueryRoutes.push({ pattern: re, handler });
  }

  public onText(pattern: string | RegExp, handler: Handler) {
    const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    this.textRoutes.push({ pattern: re, handler });
  }
  
  public addFlow(flow: FlowController) {
    this.flows[flow.name] = flow;
  }

  public use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  public async handle(update: Update, client: TelegramClient) {
    const ctx = new BotContext(client, update, this);

    const composedMiddleware = this.middlewares.reduceRight(
      (next, middleware) => () => middleware(ctx, next),
      async () => {
        // After all middleware, run the router logic
        await this.route(ctx);
      }
    );

    try {
      await composedMiddleware();
    } catch (e) {
      console.error("Error handling update:", e);
    }
  }

  public async route(ctx: BotContext) {
    const { update } = ctx;

    // If the user is in a flow, delegate to the flow controller
    if (ctx.session.flowName) {
      const flow = this.flows[ctx.session.flowName];
      if (flow) {
        const handled = await flow.handle(ctx);
        if (handled) return; // If the flow handled it, we're done
      }
    }

    if (update.message?.text) {
      if (await this.processRoutes(this.commandRoutes, update.message.text, ctx)) return;
      if (await this.processRoutes(this.textRoutes, update.message.text, ctx)) return;
    }

    if (update.callback_query?.data) {
      if (await this.processRoutes(this.callbackQueryRoutes, update.callback_query.data, ctx)) return;
    }
  }

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
