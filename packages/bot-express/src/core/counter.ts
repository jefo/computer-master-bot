import { z } from "zod";
import { createCommand, createQuery } from "../core";

// This is a mock database
const userCounters: Record<number, { count: number; name: string }> = {};

function ensureUserCounter(userId: number) {
  if (!userCounters[userId]) {
    userCounters[userId] = { count: 0, name: 'Счетчик' };
  }
}

const CounterOutput = z.object({
  count: z.number(),
  name: z.string(),
});

export const getCounterQuery = createQuery({
  input: z.void(),
  output: CounterOutput,
  execute: async (_, ctx) => {
    const userId = ctx.from?.id;
    if (!userId) throw new Error("User not found");
    ensureUserCounter(userId);
    return userCounters[userId];
  },
});

export const incrementCounterCommand = createCommand({
  input: z.void(),
  output: CounterOutput,
  execute: async (_, ctx) => {
    const userId = ctx.from?.id;
    if (!userId) throw new Error("User not found");
    ensureUserCounter(userId);
    userCounters[userId].count++;
    return userCounters[userId];
  },
});

export const decrementCounterCommand = createCommand({
  input: z.void(),
  output: CounterOutput,
  execute: async (_, ctx) => {
    const userId = ctx.from?.id;
    if (!userId) throw new Error("User not found");
    ensureUserCounter(userId);
    userCounters[userId].count--;
    return userCounters[userId];
  },
});

export const renameCounterCommand = createCommand({
  input: z.object({ newName: z.string() }),
  output: CounterOutput,
  execute: async ({ newName }, ctx) => {
    const userId = ctx.from?.id;
    if (!userId) throw new Error("User not found");
    ensureUserCounter(userId);
    userCounters[userId].name = newName;
    return userCounters[userId];
  },
});

