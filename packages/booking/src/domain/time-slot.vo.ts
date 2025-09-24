import { overwrite, z } from "zod";
import { createValueObject } from "@maxdev1/sotajs";

// --- Schema ---

export const TimeSlotVoSchema = z
	.object({
		start: z.date(),
		end: z.date(),
	})
	.refine((data) => data.end > data.start, {
		message: "End time must be after start time",
	});

// --- Types ---

export type TimeSlotProps = z.infer<typeof TimeSlotVoSchema>;

// --- Value Object ---

export const TimeSlot = createValueObject({
	schema: TimeSlotVoSchema,
	actions: {
		overlaps(props: TimeSlotProps, slot: TimeSlotProps): boolean {
			return props.start < slot.end && props.end > slot.start;
		},
	},
});

export type TimeSlot = ReturnType<typeof TimeSlot.create>;
