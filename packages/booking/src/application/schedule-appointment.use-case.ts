import { z } from "zod";
import { createPort, usePort } from "@maxdev1/sotajs";
import { DailySchedule } from "../domain/daily-schedule.aggregate";
import { TimeSlot } from "../domain/time-slot.vo";

import { z } from "zod";
import { createPort, usePort } from "@maxdev1/sotajs";
import { DailySchedule } from "../domain/daily-schedule.aggregate";
import { TimeSlot } from "../domain/time-slot.vo";

// --- Ports ---

export const findOrCreateDailySchedulePort = createPort<() => Promise<DailySchedule>>();
export const saveDailySchedulePort = createPort<(schedule: DailySchedule) => Promise<void>>();


// --- Input Schema ---

export const ScheduleAppointmentInputSchema = z.object({
  clientId: z.string().uuid(),
  startTime: z.date(),
  durationInMinutes: z.number().positive(),
});

type ScheduleAppointmentInput = z.infer<typeof ScheduleAppointmentInputSchema>;

// --- Output DTO ---

export type ScheduleAppointmentOutput = {
  appointmentId: string;
  clientId: string;
  startTime: Date;
};


// --- Use Case ---

export const scheduleAppointmentUseCase = async (input: ScheduleAppointmentInput): Promise<ScheduleAppointmentOutput> => {
  // 1. Validate input
  const command = ScheduleAppointmentInputSchema.parse(input);

  // 2. Get dependencies
  const findOrCreateSchedule = usePort(findOrCreateDailySchedulePort);
  const saveSchedule = usePort(saveDailySchedulePort);

  // 3. Create TimeSlot Value Object
  const startTime = command.startTime;
  const endTime = new Date(startTime.getTime() + command.durationInMinutes * 60000);
  const timeSlot = TimeSlot.create({ start: startTime, end: endTime });

  // 4. Determine the schedule ID (e.g., '2025-12-31')
  const scheduleId = startTime.toISOString().split('T')[0];

  // 5. Load the aggregate
  const schedule = await findOrCreateSchedule(scheduleId);

  // 6. Execute domain logic
  schedule.actions.book({
    clientId: command.clientId,
    timeSlot,
  });

  // 7. Save the modified aggregate
  await saveSchedule(schedule);

  // 8. Return result DTO (workaround for sotajs bug)
  const newAppointmentState = schedule.state.appointments[schedule.state.appointments.length - 1];
  if (!newAppointmentState) {
    throw new Error("Failed to create appointment."); // Should not happen
  }

  return {
    appointmentId: newAppointmentState.id,
    clientId: newAppointmentState.clientId,
    startTime: newAppointmentState.timeSlot.start,
  };
};