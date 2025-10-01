import { z } from "zod";
import { createCommand, createQuery } from "../core";

// ======== SCHEMAS ========

// The core data structure for our counter
const CounterSchema = z.object({
	name: z.string(),
	count: z.number(),
});

// ======== QUERIES ========

export const getCounterQuery = createQuery({
	// Queries often have simple or no input
	input: z.void(),
	output: CounterSchema,
	execute: async (_, ctx) => {
		// Default state if not in session
		return {
			name: ctx.session.counterName ?? "Счетчик",
			count: ctx.session.counterValue ?? 0,
		};
	},
});

// ======== COMMANDS ========

export const incrementCounterCommand = createCommand({
	input: z.void(),
	output: CounterSchema,
	execute: async (_, ctx) => {
		const currentCount = ctx.session.counterValue ?? 0;
		ctx.session.counterValue = currentCount + 1;
		return {
			name: ctx.session.counterName ?? "Счетчик",
			count: ctx.session.counterValue,
		};
	},
});

export const decrementCounterCommand = createCommand({
	input: z.void(),
	output: CounterSchema,
	execute: async (_, ctx) => {
		const currentCount = ctx.session.counterValue ?? 0;
		ctx.session.counterValue = currentCount - 1;
		return {
			name: ctx.session.counterName ?? "Счетчик",
			count: ctx.session.counterValue,
		};
	},
});

export const renameCounterCommand = createCommand({
	input: z.object({
		newName: z.string().min(1, "Имя не может быть пустым"),
	}),
	output: CounterSchema,
	execute: async ({ newName }, ctx) => {
		ctx.session.counterName = newName;
		return {
			name: newName,
			count: ctx.session.counterValue ?? 0,
		};
	},
});
