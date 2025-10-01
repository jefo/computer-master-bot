import { z } from "zod";
import { createCommand } from "../core";

/**
 * A generic command that does nothing.
 * Useful for state transitions that don't require business logic.
 */
export const noopCommand = createCommand({
	input: z.any(), // Accepts any input
	output: z.void(), // Returns nothing
	execute: async () => {},
});
