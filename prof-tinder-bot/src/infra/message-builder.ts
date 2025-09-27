// src/infra/message-builder.ts

export class MessageBuilder {
	private parts: string[] = [];

	public static escapeMarkdownV2(text: string | number): string {
		const textStr = String(text);
		const reservedChars = /[_*[\\\]()~`>#+-=|"{}.!\\]/g;
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
}
