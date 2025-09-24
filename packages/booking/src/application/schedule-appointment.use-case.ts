import { z } from "zod";
import { createPort, usePort } from "@maxdev1/sotajs";
import { DailySchedule } from "../domain/daily-schedule.aggregate";
import { TimeSlot } from "../domain/time-slot.vo";

import { z } from "zod";
import { createPort, usePort } from "@maxdev1/sotajs";
import { DailySchedule } from "../domain/daily-schedule.aggregate";
import { TimeSlot } from "../domain/time-slot.vo";

// --- Ports ---

// Port to get or create a schedule for a specific day
export const findOrCreateDailySchedulePort = createPort<(date: string) => Promise<DailySchedule>>();
// Port to save the modified schedule
export const saveDailySchedulePort = createPort<(schedule: DailySchedule) => Promise<void>>();

// Output ports
export const appointmentScheduledOutPort = createPort<(output: { appointmentId: string, clientId: string, startTime: Date }) => Promise<void>>();
export const timeSlotNotAvailableOutPort = createPort<(output: { clientId: string, startTime: Date, reason: string }) => Promise<void>>();


// --- Input Schema ---

export const ScheduleAppointmentInputSchema = z.object({
  clientId: z.string().uuid(),
  startTime: z.date(),
  durationInMinutes: z.number().positive(),
});

type ScheduleAppointmentInput = z.infer<typeof ScheduleAppointmentInputSchema>;


// --- Use Case ---

export const scheduleAppointmentUseCase = async (input: ScheduleAppointmentInput): Promise<void> => {
  // 1. Validate input
  const command = ScheduleAppointmentInputSchema.parse(input);

  // 2. Get dependencies
  const findOrCreateSchedule = usePort(findOrCreateDailySchedulePort);
  const saveSchedule = usePort(saveDailySchedulePort);
  const onSuccess = usePort(appointmentScheduledOutPort);
  const onFailure = usePort(timeSlotNotAvailableOutPort);

  try {
    // 3. Create TimeSlot Value Object
    const startTime = command.startTime;
    const endTime = new Date(startTime.getTime() + command.durationInMinutes * 60000);
    const timeSlot = TimeSlot.create({ start: startTime, end: endTime });

    // 4. Determine the schedule ID (e.g., '2025-12-31')
    const scheduleId = startTime.toISOString().split('T')[0];

    // 5. Load the aggregate
    const schedule = await findOrCreateSchedule(scheduleId);

    // 6. Execute domain logic
    const newAppointment = schedule.actions.book({
      clientId: command.clientId,
      timeSlot,
    });

    // 7. Save the modified aggregate
    await saveSchedule(schedule);

    // 8. Call success output port
    await onSuccess({
      appointmentId: newAppointment.state.id,
      clientId: newAppointment.state.clientId,
      startTime: newAppointment.state.timeSlot.start,
    });

  } catch (error: any) {
    // 9. Call failure output port
    await onFailure({
      clientId: command.clientId,
      startTime: command.startTime,
      reason: error.message,
    });
  }
};