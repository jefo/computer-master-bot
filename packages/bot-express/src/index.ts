import { Router } from "./router";
import { FlowController } from "./flow";
import { mainFlow } from "./flows/main.flow";
import { TelegramClient } from "../packages/telegram-client";

// A simple in-memory session store for demonstration purposes
const sessionStore = new Map<number, Record<string, any>>();

async function main() {
	const token = process.env.BOT_TOKEN;
	if (!token) {
		console.error("BOT_TOKEN environment variable is not set.");
		process.exit(1);
	}

	const client = new TelegramClient(token);
	const router = new Router();

	// Create and register the flow controller
	const mainFlowController = new FlowController(mainFlow, "main");
	router.addFlow(mainFlowController);

	// Middleware for session management
	router.use(async (ctx, next) => {
		const userId = ctx.from?.id;
		if (userId) {
			if (!sessionStore.has(userId)) {
				sessionStore.set(userId, {});
			}
			ctx.session = sessionStore.get(userId)!;
		}
		await next();
	});

	// The /start command now enters the main flow
	router.onCommand("start", async (ctx) => {
		await ctx.enterFlow("main", "counter");
	});

	console.log("Bot is starting...");
	const me = await client.getMe();
	console.log(`Logged in as ${me.first_name} (@${me.username})`);

	let offset = 0;
	while (true) {
		try {
			const updates = await client.getUpdates({
				offset,
				timeout: 30, // Long polling timeout
			});

			for (const update of updates) {
				offset = update.update_id + 1;
				router.handle(update, client);
			}
		} catch (error) {
			console.error("Error fetching updates:", error);
			// Avoid spamming on persistent errors
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}
}

main().catch(console.error);
