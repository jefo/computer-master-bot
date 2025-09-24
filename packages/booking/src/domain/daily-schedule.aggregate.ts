import { z } from "zod";
import { createAggregate } from "@maxdev1/sotajs";
import { Appointment, AppointmentPropsSchema } from "./appointment.entity";
import { TimeSlot, type TimeSlotProps } from "./time-slot.vo";
import { randomUUID } from "crypto";

// --- Schemas ---

export const DailySchedulePropsSchema = z.object({
	id: z.string(), // e.g., "2025-12-31"
	appointments: z.array(AppointmentPropsSchema),
});

// --- Types ---

export type DailyScheduleProps = z.infer<typeof DailySchedulePropsSchema>;

// --- Aggregate ---

export const DailySchedule = createAggregate({
	name: "DailySchedule",
	schema: DailySchedulePropsSchema,
	invariants: [
		(state) => {
			const confirmed = state.appointments.filter(
				(a) => a.status === "confirmed",
			);
			for (let i = 0; i < confirmed.length; i++) {
				for (let j = i + 1; j < confirmed.length; j++) {
					const slotA = TimeSlot.create(confirmed[i]!.timeSlot);
					if (
						slotA.props.start < confirmed[j]?.timeSlot.end! &&
						slotA.props.end > confirmed[j]?.timeSlot.start!
					) {
						throw new Error(
							`Invariant failed: Overlapping appointments detected for schedule ${state.id}`,
						);
					}
				}
			}
		},
	],
	actions: {
		book: (
			state,
			{ clientId, timeSlot }: { clientId: string; timeSlot: TimeSlot },
		) => {
			const hasOverlap = state.appointments.some(
				(app) =>
					app.status === "confirmed" &&
					(timeSlot.props.start < app.timeSlot.end! && timeSlot.props.end > app.timeSlot.start!)
			);

			if (hasOverlap) {
				throw new Error("Time slot is not available");
			}

			const newAppointment = Appointment.create({
				id: randomUUID(),
				clientId,
				timeSlot: timeSlot.props,
				status: "confirmed",
				createdAt: new Date(),
			});

			state.appointments.push(newAppointment.state);

			return newAppointment;
		},

		cancel: (state, { appointmentId }: { appointmentId: string }) => {
			const appointment = state.appointments.find(
				(a) => a.id === appointmentId,
			);
			if (!appointment) {
				throw new Error("Appointment not found in this schedule");
			}

			const appointmentInstance = Appointment.create(appointment);
			appointmentInstance.actions.cancel();

			Object.assign(appointment, appointmentInstance.state);
		},
	},
});

export type DailySchedule = ReturnType<typeof DailySchedule.create>;
