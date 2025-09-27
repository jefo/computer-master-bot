// src/infra/message-builder.ts

export class MessageBuilder {
	private parts: string[] = [];

	public static escapeMarkdownV2(text: string | number): string {
		const textStr = String(text);
		const reservedChars = /[_*[\]()~`>#+-=|\"{}.!\\\\]/g;
		return textStr.replace(reservedChars, \"\\\\// src/infra/message-builder.ts

export class MessageBuilder {
	private parts: string[] = [];

	public static escapeMarkdownV2(text: string | number): string {
		const textStr = String(text);
		const reservedChars = /[_*\\[\\]()~`>#+\\-=|\"{}.!\\\\]/g;
		return textStr.replace(reservedChars, \"\\\\// src/infra/message-builder.ts

export class MessageBuilder {
	private parts: string[] = [];

	public static escapeMarkdownV2(text: string | number): string {
		const textStr = String(text);
		const reservedChars = /[_*[\]()~`>#+-=|"{}.!\\]/g;
		return textStr.replace(reservedChars, "\\$&");
	}

	addTitle(title: string): MessageBuilder {
		this.parts.push(`*${MessageBuilder.escapeMarkdownV2(title)}*`);
		return this;
	}

	addBold(text: string): MessageBuilder {
		this.parts.push(`*${MessageBuilder.escapeMarkdownV2(text)}*`);
		return this;
	}

	addParagraph(text: string): MessageBuilder {
		this.parts.push(MessageBuilder.escapeMarkdownV2(text));
		return this;
	}

	addListItem(item: string): MessageBuilder {
		this.parts.push(`\\- ${MessageBuilder.escapeMarkdownV2(item)}`);
		return this;
	}

	addText(text: string): MessageBuilder {
		this.parts.push(MessageBuilder.escapeMarkdownV2(text));
		return this;
	}

	addRawText(text: string): MessageBuilder {
		this.parts.push(text);
		return this;
	}

	newLine(count: number = 1): MessageBuilder {
		this.parts.push("\n".repeat(count));
		return this;
	}

	build(): string {
		return this.parts.join("");
	}
}\");
	}

	addTitle(title: string, icon: string = \"\"): MessageBuilder {
		if (icon) {
			this.parts.push(`${icon} *${MessageBuilder.escapeMarkdownV2(title)}*`);
		} else {
			this.parts.push(`*${MessageBuilder.escapeMarkdownV2(title)}*`);
		}
		return this;
	}

	addSectionTitle(title: string, icon: string = \"\"): MessageBuilder {
		this.parts.push(`\\n*${icon ? icon + \" \" : \"\"}${MessageBuilder.escapeMarkdownV2(title)}*`);
		return this;
	}

	addBold(text: string): MessageBuilder {
		this.parts.push(`*${MessageBuilder.escapeMarkdownV2(text)}*`);
		return this;
	}

	addItalic(text: string): MessageBuilder {
		this.parts.push(`_${MessageBuilder.escapeMarkdownV2(text)}_`);
		return this;
	}

	addParagraph(text: string): MessageBuilder {
		this.parts.push(MessageBuilder.escapeMarkdownV2(text));
		return this;
	}

	addListItem(item: string, icon: string = \"•\"): MessageBuilder {
		this.parts.push(`${icon} ${MessageBuilder.escapeMarkdownV2(item)}`);
		return this;
	}

	addNumberedItem(item: string, number: number): MessageBuilder {
		this.parts.push(`${number}. ${MessageBuilder.escapeMarkdownV2(item)}`);
		return this;
	}

	addText(text: string): MessageBuilder {
		this.parts.push(MessageBuilder.escapeMarkdownV2(text));
		return this;
	}

	addRawText(text: string): MessageBuilder {
		this.parts.push(text);
		return this;
	}

	newLine(count: number = 1): MessageBuilder {
		this.parts.push(\"\\n\".repeat(count));
		return this;
	}

	addSeparator(): MessageBuilder {
		this.parts.push(\"\\n─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─\\n\");
		return this;
	}

	addSuccess(text: string): MessageBuilder {
		this.parts.push(`✅ ${MessageBuilder.escapeMarkdownV2(text)}`);
		return this;
	}

	addWarning(text: string): MessageBuilder {
		this.parts.push(`⚠️ ${MessageBuilder.escapeMarkdownV2(text)}`);
		return this;
	}

	addInfo(text: string): MessageBuilder {
		this.parts.push(`ℹ️ ${MessageBuilder.escapeMarkdownV2(text)}`);
		return this;
	}

	addPrice(price: number, currency: string = \"USD\"): MessageBuilder {
		this.parts.push(`💳 *${price} ${currency}*`);
		return this;
	}

	build(): string {
		return this.parts.join(\"\");
	}
}\");
	}

	addTitle(title: string): MessageBuilder {
		// Добавляем декоративные элементы вокруг заголовка
		this.parts.push(`\\n✨ *${MessageBuilder.escapeMarkdownV2(title)}* ✨\\n`);
		return this;
	}

	addBold(text: string): MessageBuilder {
		this.parts.push(`*${MessageBuilder.escapeMarkdownV2(text)}*`);
		return this;
	}

	addParagraph(text: string): MessageBuilder {
		this.parts.push(MessageBuilder.escapeMarkdownV2(text));
		return this;
	}

	addListItem(item: string): MessageBuilder {
		this.parts.push(`• ${MessageBuilder.escapeMarkdownV2(item)}`);
		return this;
	}

	addStyledListItem(item: string, icon: string = \"•\"): MessageBuilder {
		this.parts.push(`${icon} ${MessageBuilder.escapeMarkdownV2(item)}`);
		return this;
	}

	addText(text: string): MessageBuilder {
		this.parts.push(MessageBuilder.escapeMarkdownV2(text));
		return this;
	}

	addRawText(text: string): MessageBuilder {
		this.parts.push(text);
		return this;
	}

	newLine(count: number = 1): MessageBuilder {
		this.parts.push(\"\\n\".repeat(count));
		return this;
	}

	addSeparator(): MessageBuilder {
		this.parts.push(\"\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\");
		return this;
	}

	addEmphasis(text: string, icon: string = \"🔹\"): MessageBuilder {
		this.parts.push(`${icon} *${MessageBuilder.escapeMarkdownV2(text)}* ${icon}`);
		return this;
	}

	addProgressBar(percentage: number, width: number = 10): MessageBuilder {
		const filled = Math.min(width, Math.floor(percentage / (100 / width)));
		const empty = width - filled;
		const progressBar = `【${'█'.repeat(filled)}${'░'.repeat(empty)}】 ${percentage}%`;
		this.parts.push(progressBar);
		return this;
	}

	build(): string {
		return this.parts.join(\"\");
	}
}
