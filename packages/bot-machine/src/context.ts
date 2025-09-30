import { FormattedText } from "./text";

// ... (imports)

// ... (class definition)

  /** @inheritdoc */
	async reply(text: string | FormattedText, extra?: any): Promise<Message> {
		if (!this.chat) {
			throw new Error("Cannot reply when chat is not defined");
		}

    if (text instanceof FormattedText) {
      return this.client.sendMessage({ chat_id: this.chat.id, text: text.text, parse_mode: text.parseMode, ...extra });
    }
		return this.client.sendMessage({ chat_id: this.chat.id, text, ...extra });
	}

  /** @inheritdoc */
	async editMessageText(text: string | FormattedText, extra?: any): Promise<Message | boolean> {
		const message = this.update.callback_query?.message ?? this.update.message;
		if (!this.chat || !message) {
			throw new Error(
				"Cannot edit message when chat or message is not defined",
			);
		}

    if (text instanceof FormattedText) {
      return this.client.editMessageText({
        chat_id: this.chat.id,
        message_id: message.message_id,
        text: text.text,
        parse_mode: text.parseMode,
        ...extra,
      });
    }

		return this.client.editMessageText({
			chat_id: this.chat.id,
			message_id: message.message_id,
			text,
			...extra,
		});
	}

  /** @inheritdoc */
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

  /** @inheritdoc */
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
    // Workaround for incorrect type in dependency
		return result as unknown as boolean;
	}

  /** @inheritdoc */
	async enterFlow(
		flowName: string,
		initialState: string = "index",
	): Promise<void> {
		this.session.flowName = flowName;
		this.session.flowState = initialState;
		// Re-run the routing logic to immediately render the initial state of the new flow.
		await this.router.route(this);
	}
}
