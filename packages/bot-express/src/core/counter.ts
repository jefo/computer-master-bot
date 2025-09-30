import type { AppContext, CommandFunction, QueryFunction } from "../types";

// This is a mock database
const userCounters: Record<number, number> = {};

/**
 * Query to get the counter for the current user.
 */
export const getCounterQuery: QueryFunction<{ count: number }> = async (
	ctx,
) => {
	const userId = ctx.from?.id;
	if (!userId) throw new Error("User not found");

	if (userCounters[userId] === undefined) {
		userCounters[userId] = 0;
	}

	return { count: userCounters[userId] };
};

/**
 * Command to increment the counter.
 */
export const incrementCounterCommand: CommandFunction = async (
	payload,
	ctx,
) => {
	const userId = ctx.from?.id;
	if (!userId) throw new Error("User not found");
	userCounters[userId] = (userCounters[userId] ?? 0) + 1;
	return { count: userCounters[userId] };
};

/**
 * Command to decrement the counter.
 */
export const decrementCounterCommand: CommandFunction = async (
	payload,
	ctx,
) => {
	const userId = ctx.from?.id;
	if (!userId) throw new Error("User not found");
	userCounters[userId] = (userCounters[userId] ?? 0) - 1;
	return { count: userCounters[userId] };
};
