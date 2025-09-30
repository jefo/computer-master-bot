import type { AppContext } from "./types";
import type { Router } from "./router";
import type { Chat, Message, TelegramClient, User } from "../packages/telegram-client";
import type { Update } from "../packages/telegram-client";

export class BotContext implements AppContext {
	readonly client: TelegramClient;
	readonly router: Router;
	public update: Update;
	public session: Record<string, any> = {};
	public state: Record<string, any> = {};
	public params: Record<string, string> = {};

	constructor(client: TelegramClient, update: Update, router: Router) {
		this.client = client;
		this.update = update;
		this.router = router;
	}

	get from(): User | undefined {
		return this.update.message?.from ?? this.update.callback_query?.from;
	}

	get chat(): Chat | undefined {
		return (
			this.update.message?.chat ?? this.update.callback_query?.message?.chat
		);
	}

	async reply(text: string, extra?: any): Promise<Message> {
		if (!this.chat) {
			throw new Error("Cannot reply when chat is not defined");
		}
		return this.client.sendMessage({ chat_id: this.chat.id, text, ...extra });
	}

	async editMessageText(text: string, extra?: any): Promise<Message | boolean> {
		const message = this.update.callback_query?.message ?? this.update.message;
		if (!this.chat || !message) {
			throw new Error(
				"Cannot edit message when chat or message is not defined",
			);
		}
		return this.client.editMessageText({
			chat_id: this.chat.id,
			message_id: message.message_id,
			text,
			...extra,
		});
	}

	async deleteMessage(): Promise<boolean> {
		const message = this.update.callback_query?.message ?? this.update.message;
		if (!this.chat || !message) {
			throw new Error(
				"Cannot delete message when chat or message is not defined",
			);
		}
		return this.client.deleteMessage({
			chat_id: this.chat.id,
			message_id: message.message_id,
		});
	}

	async answerCallbackQuery(text?: string): Promise<boolean> {
		if (!this.update.callback_query) {
			throw new Error(
				"Cannot answer callback query when callback_query is not defined",
			);
		}
		const result = await this.client.answerCallbackQuery({
			callback_query_id: this.update.callback_query.id,
			text,
		});
		return result as unknown as boolean;
	}

	async enterFlow(
		flowName: string,
		initialState: string = "index",
	): Promise<void> {
		this.session.flowName = flowName;
		this.session.flowState = initialState;
		// Re-run the routing logic to immediately render the initial state of the new flow
		await this.router.route(this);
	}
}
