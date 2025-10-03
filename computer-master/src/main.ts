import {
	Router,
	session,
	AppContext,
	Keyboard,
	FormattedText,
	FlowController,
} from "@bot-machine/telegram-sdk";
import { TelegramClient } from "@bot-machine/telegram-client";
import { showPricesUseCase } from "./app/show-prices.use-case";
import { bookingFlow } from "./booking.flow";

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
	console.error("BOT_TOKEN is not set!");
	process.exit(1);
}

// 1. Initialize Router and Client
const router = new Router();
const client = new TelegramClient(BOT_TOKEN);
const bookingFlowController = new FlowController(
	bookingFlow.config,
	bookingFlow.name,
);

// 2. Register middleware and flows
router.use(session());
router.addFlow(bookingFlowController);

// 3. Define a simple /start command
router.onCommand("start", async (ctx: AppContext) => {
	const text = new FormattedText()
		.addTitle(
			"Здравствуйте! Я личный робот-ассистент Компьютерного Мастера.",
			"🤖",
		)
		.newLine(2)
		.addText("Передам вашу заявку незамедлительно! Чем могу помочь?");

	const keyboard = new Keyboard()
		.add({ text: "🆘 Экстренная помощь", callback_data: "emergency_help" })
		.row()
		.add({ text: "🛠 Услуги и Цены", callback_data: "show_prices" });

	await ctx.reply(text, { reply_markup: keyboard });
});

router.onCallbackQuery("emergency_help", async (ctx: AppContext) => {
	ctx.session.flowType = "emergency";
	await ctx.enterFlow("booking");
});

router.onCallbackQuery("show_prices", async (ctx: AppContext) => {
	const priceList = await showPricesUseCase();
	const text = new FormattedText().addTitle("🛠 Наши услуги").newLine(2);

	priceList.forEach((item) => {
		text
			.addBold(item.name)
			.addText(` - ${item.price} руб`)
			.newLine()
			.addText(item.description)
			.newLine(2);
	});

	const keyboard = new Keyboard().add({
		text: "📅 Записаться на услугу",
		callback_data: "book_service",
	});

	await ctx.reply(text, { reply_markup: keyboard });
	await ctx.answerCallbackQuery();
});

router.onCallbackQuery("book_service", async (ctx: AppContext) => {
	ctx.session.flowType = "booking";
	await ctx.enterFlow("booking");
});

// 4. Set up the bot server
const server = Bun.serve({
	port: process.env.PORT || 3000,
	async fetch(req) {
		if (req.method === "POST") {
			try {
				const update = await req.json();
				await router.handle(update, client);
				return new Response("OK");
			} catch (error) {
				console.error("Error handling update:", error);
				return new Response("Error", { status: 500 });
			}
		}
		return new Response("Not Found", { status: 404 });
	},
});

console.log(`Server listening on port ${server.port}`);

// 5. Set the webhook
const webhookUrl = process.env.WEBHOOK_URL;
if (webhookUrl) {
	await client.setWebhook({ url: webhookUrl });
	console.log(`Webhook set to ${webhookUrl}`);
} else {
	console.warn(
		"WEBHOOK_URL is not set. Bot will not receive updates unless you set it manually.",
	);
}
