import { z } from "zod";
import { createEntity } from "@maxdev1/sotajs";
import { TimeSlotVoSchema, type TimeSlot } from "./time-slot.vo";

// --- Schemas ---

export const AppointmentStatusSchema = z.enum(["confirmed", "cancelled"]);

export const AppointmentPropsSchema = z.object({
	id: z.string().uuid(),
	clientId: z.string().uuid(),
	timeSlot: TimeSlotVoSchema, // Use the TimeSlot Value Object
	status: AppointmentStatusSchema,
	createdAt: z.date(),
});

// --- Types ---

export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type AppointmentProps = z.infer<typeof AppointmentPropsSchema>;

// --- Entity ---

export const Appointment = createEntity({
	schema: AppointmentPropsSchema,
	actions: {
		cancel: (state) => {
			if (state.status === "cancelled") {
				throw new Error("Appointment is already cancelled");
			}
			state.status = "cancelled";
		},
	},
});

export type Appointment = ReturnType<typeof Appointment.create>;
