import type { AppContext, CommandFunction, QueryFunction } from "../types";

// This is a mock database
const userCounters: Record<number, { count: number; name: string }> = {};

function ensureUserCounter(userId: number) {
  if (!userCounters[userId]) {
    userCounters[userId] = { count: 0, name: 'Счетчик' };
  }
}

/**
 * Query to get the counter for the current user.
 */
export const getCounterQuery: QueryFunction<{ count: number; name: string }> = async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) throw new Error("User not found");
  ensureUserCounter(userId);
  return userCounters[userId];
};

/**
 * Command to increment the counter.
 */
export const incrementCounterCommand: CommandFunction = async (payload, ctx) => {
  const userId = ctx.from?.id;
  if (!userId) throw new Error("User not found");
  ensureUserCounter(userId);
  userCounters[userId].count++;
  return userCounters[userId];
};

/**
 * Command to decrement the counter.
 */
export const decrementCounterCommand: CommandFunction = async (payload, ctx) => {
  const userId = ctx.from?.id;
  if (!userId) throw new Error("User not found");
  ensureUserCounter(userId);
  userCounters[userId].count--;
  return userCounters[userId];
};

/**
 * Command to rename the counter.
 */
export const renameCounterCommand: CommandFunction<{ newName: string }> = async (payload, ctx) => {
  const userId = ctx.from?.id;
  if (!userId) throw new Error("User not found");
  ensureUserCounter(userId);
  userCounters[userId].name = payload.newName;
  return userCounters[userId];
};
