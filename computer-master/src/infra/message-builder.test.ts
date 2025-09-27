import { describe, it, expect } from "bun:test";
import { MessageBuilder } from "./message-builder";

describe("MessageBuilder", () => {
	it("should correctly build a message with a MarkdownV2 list", () => {
		const message = new MessageBuilder()
			.addText("Header")
			.newLine()
			.addListItem("Item One")
			.newLine()
			.addListItem("Item Two")
			.build();

		// Check that the output contains the double-backslash-escaped hyphen.
		// This is the key requirement from the Telegram API.
		expect(message.includes("\\- Item One")).toBe(true);
		expect(message.includes("\\- Item Two")).toBe(true);
	});
});
