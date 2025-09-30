// src/infra/message-builder.ts

export class MessageBuilder {
	private parts: string[] = [];

	public static escapeMarkdownV2(text: string | number): string {
		const textStr = String(text);
		// Note: Do not escape colon (:) to prevent time formatting issues like "14:00" becoming "\\1\\4\\:\\0\\0"
		const reservedChars = /[_*\\[\\]()~`>#+\\-=|{}.!\\\\]/g;
		return textStr.replace(reservedChars, "\\\\\\$&");
	}

	/**
	 * Adds a title with optional icon using bold formatting
	 * @param title The main title text
	 * @param icon Optional icon to prefix the title
	 */
	addTitle(title: string, icon: string = ""): MessageBuilder {
		if (icon) {
			this.parts.push(`${icon} *${MessageBuilder.escapeMarkdownV2(title)}*`);
		} else {
			this.parts.push(`*${MessageBuilder.escapeMarkdownV2(title)}*`);
		}
		return this;
	}

	/**
	 * Adds a section title using bold formatting
	 * @param title The section title text
	 * @param icon Optional icon to prefix the section title
	 */
	addSectionTitle(title: string, icon: string = ""): MessageBuilder {
		this.parts.push(
			`*${icon ? icon + " " : ""}${MessageBuilder.escapeMarkdownV2(title)}*`,
		);
		return this;
	}

	/**
	 * Adds bold formatted text
	 * @param text The text to format as bold
	 */
	addBold(text: string): MessageBuilder {
		this.parts.push(`*${MessageBuilder.escapeMarkdownV2(text)}*`);
		return this;
	}

	/**
	 * Adds italic formatted text
	 * @param text The text to format as italic
	 */
	addItalic(text: string): MessageBuilder {
		this.parts.push(`_${MessageBuilder.escapeMarkdownV2(text)}_`);
		return this;
	}

	/**
	 * Adds a paragraph of regular text
	 * @param text The paragraph text
	 */
	addParagraph(text: string): MessageBuilder {
		this.parts.push(MessageBuilder.escapeMarkdownV2(text));
		return this;
	}

	/**
	 * Adds a list item with bullet point
	 * @param item The list item text
	 * @param icon The icon/symbol to use as bullet point (defaults to '•')
	 */
	addListItem(item: string, icon: string = "•"): MessageBuilder {
		this.parts.push(`${icon} ${MessageBuilder.escapeMarkdownV2(item)}`);
		return this;
	}

	/**
	 * Adds a numbered list item
	 * @param item The list item text
	 * @param number The number for this list item
	 */
	addNumberedItem(item: string, number: number): MessageBuilder {
		this.parts.push(`${number}\\\\. ${MessageBuilder.escapeMarkdownV2(item)}`);
		return this;
	}

	/**
	 * Adds raw text without any formatting or escaping
	 * @param text The raw text to add
	 */
	addRawText(text: string): MessageBuilder {
		this.parts.push(text);
		return this;
	}

	/**
	 * Adds plain text with MarkdownV2 escaping
	 * @param text The text to add
	 */
	addText(text: string): MessageBuilder {
		this.parts.push(MessageBuilder.escapeMarkdownV2(text));
		return this;
	}

	/**
	 * Adds one or more new line characters
	 * @param count Number of new lines to add (default: 1)
	 */
	newLine(count: number = 1): MessageBuilder {
		this.parts.push("\\n".repeat(count));
		return this;
	}

	/**
	 * Adds a visual separator (empty line)
	 */
	addSeparator(): MessageBuilder {
		this.parts.push("\\n");
		return this;
	}

	/**
	 * Adds a success message with checkmark icon
	 * @param text The success message text
	 */
	addSuccess(text: string): MessageBuilder {
		this.parts.push(`✅ ${MessageBuilder.escapeMarkdownV2(text)}`);
		return this;
	}

	/**
	 * Adds a warning message with warning icon
	 * @param text The warning message text
	 */
	addWarning(text: string): MessageBuilder {
		this.parts.push(`⚠️ ${MessageBuilder.escapeMarkdownV2(text)}`);
		return this;
	}

	/**
	 * Adds an info message with info icon
	 * @param text The info message text
	 */
	addInfo(text: string): MessageBuilder {
		this.parts.push(`ℹ️ ${MessageBuilder.escapeMarkdownV2(text)}`);
		return this;
	}

	/**
	 * Adds a price with formatting
	 * @param price The price amount
	 * @param currency The currency code (default: "RUB")
	 */
	addPrice(price: number, currency: string = "RUB"): MessageBuilder {
		this.parts.push(`💳 *${price} ${currency}*`);
		return this;
	}

	/**
	 * Adds a detail item in key-value format
	 * @param key The detail key/label
	 * @param value The detail value
	 */
	addDetail(key: string, value: string): MessageBuilder {
		this.parts.push(`*${MessageBuilder.escapeMarkdownV2(key)}:* ${value}`);
		return this;
	}

	/**
	 * Adds a service booking detail
	 * @param services List of service names
	 */
	addServicesList(services: string[]): MessageBuilder {
		if (services.length > 0) {
			this.addSectionTitle("Услуги", "🛠");
			services.forEach(service => {
				this.addListItem(service);
			});
		}
		return this;
	}

	/**
	 * Adds booking date and time details
	 * @param date The booking date
	 * @param time The booking time
	 */
	addBookingDateTime(date: string, time: string): MessageBuilder {
		if (date || time) {
			this.addSectionTitle("Дата и время", "📅");
			if (date) {
				this.addListItem(`Дата: ${date}`);
			}
			if (time) {
				this.addListItem(`Время: ${time}`);
			}
		}
		return this;
	}

	/**
	 * Adds contact information
	 * @param name The contact name
	 * @param phone The contact phone number
	 */
	addContactInfo(name: string, phone: string): MessageBuilder {
		if (name || phone) {
			this.addSectionTitle("Контактная информация", "👤");
			if (name) {
				this.addListItem(`Имя: ${name}`);
			}
			if (phone) {
				this.addListItem(`Телефон: ${phone}`);
			}
		}
		return this;
	}

	/**
	 * Builds the final message string
	 */
	build(): string {
		return this.parts.join("");
	}
}