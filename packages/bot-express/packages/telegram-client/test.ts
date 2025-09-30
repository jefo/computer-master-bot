// test.ts - Simple test file to verify the client works

import { TelegramClient } from "./index";

// This is just a basic test to verify the client can be instantiated
// In a real scenario, you would use a valid token and mock the API responses

try {
	const client = new TelegramClient(
		"123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
	);
	console.log("TelegramClient created successfully");

	// Verify methods exist
	console.assert(
		typeof client.getMe === "function",
		"getMe method should exist",
	);
	console.assert(
		typeof client.sendMessage === "function",
		"sendMessage method should exist",
	);
	console.assert(
		typeof client.getUpdates === "function",
		"getUpdates method should exist",
	);

	console.log("All methods verified");
} catch (error) {
	console.error("Error creating TelegramClient:", error);
}
