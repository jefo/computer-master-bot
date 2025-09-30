import { Router } from "./router";
import { FlowController } from "./flow";
import { mainFlow } from "./flows/main.flow";
import { TelegramClient } from "@computer-master/telegram-client";
import { SessionManager } from "./session";

async function main() {
	const token = process.env.BOT_TOKEN;
	if (!token) {
		console.error("BOT_TOKEN environment variable is not set.");
		process.exit(1);
	}

	const client = new TelegramClient(token);
	const router = new Router();

	// Setup session management. Uses InMemorySessionStore by default.
	const sessionManager = new SessionManager();
	router.use(sessionManager.middleware());

	// Create and register the flow controller
	const mainFlowController = new FlowController(mainFlow, "main");
	router.addFlow(mainFlowController);

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
