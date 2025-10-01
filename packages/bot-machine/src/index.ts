
// The main entry point for the bot application.

import { TelegramClient } from "@computer-master/telegram-client";
import { Router } from "./router";
import { session } from "./session";
import { mainFlow } from "./flows/main.flow";
import { FlowController } from "./flow";
import { createClient } from "redis";
import { RedisSessionStore } from "./session/redis.store";

async function main() {
  // 1. Initialize the Telegram Client
  // Ensure the BOT_TOKEN environment variable is set.
  if (!process.env.BOT_TOKEN) {
    throw new Error("BOT_TOKEN environment variable is not set.");
  }
  const client = new TelegramClient(process.env.BOT_TOKEN);

  // 2. Initialize the Router
  const router = new Router();

  // 3. Register Middleware
  // Use Redis for session storage if REDIS_URL is provided, otherwise default to in-memory.
  if (process.env.REDIS_URL) {
    console.log("Using Redis for session storage.");
    const redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    const redisStore = new RedisSessionStore(redisClient);
    router.use(session({ store: redisStore }));
  } else {
    console.log("Using in-memory session storage.");
    router.use(session());
  }

  // 4. Register Flows
  // A flow is a stateful, multi-step conversation.
  const mainFlowController = new FlowController(mainFlow.config, mainFlow.name);
  router.addFlow(mainFlowController);

  // 5. Register Stateless Commands
  // These are simple, one-off commands.
  router.onCommand("start", async (ctx) => {
    // The `enterFlow` method starts a conversation flow.
    await ctx.enterFlow(mainFlow.name, mainFlow.states.counter);
  });

  router.onCommand("help", async (ctx) => {
    await ctx.reply("This is an example bot.");
  });

  // 6. Start the Bot
  // The `startPolling` method fetches updates from Telegram.
  console.log("Bot starting...");
  client.startPolling(router);
}

main().catch(console.error);
