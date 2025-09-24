import { z } from "zod";
import { createPort, usePort } from "@maxdev1/sotajs";
import { DailySchedule } from "../domain/daily-schedule.aggregate";
import { Appointment } from "../domain/appointment.entity";

// --- Ports ---

// We need a way to find an appointment to know which schedule to load
export const findAppointmentByIdPort = createPort<(appointmentId: string) => Promise<Appointment | null>>();
export const findOrCreateDailySchedulePort = createPort<(date: string) => Promise<DailySchedule>>();
export const saveDailySchedulePort = createPort<(schedule: DailySchedule) => Promise<void>>();


// --- Input Schema ---

export const CancelAppointmentInputSchema = z.object({
  appointmentId: z.string().uuid(),
});

type CancelAppointmentInput = z.infer<typeof CancelAppointmentInputSchema>;

// --- Output DTO ---

export type CancelAppointmentOutput = {
  appointmentId: string;
  status: 'cancelled';
};


// --- Use Case ---

export const cancelAppointmentUseCase = async (input: CancelAppointmentInput): Promise<CancelAppointmentOutput> => {
  // 1. Validate input
  const command = CancelAppointmentInputSchema.parse(input);

  // 2. Get dependencies
  const findAppointmentById = usePort(findAppointmentByIdPort);
  const findOrCreateSchedule = usePort(findOrCreateDailySchedulePort);
  const saveSchedule = usePort(saveDailySchedulePort);

  // 3. Find the appointment to get its date
  const appointment = await findAppointmentById(command.appointmentId);
  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // 4. Determine the schedule ID from the appointment's date
  const scheduleId = appointment.state.timeSlot.start.toISOString().split('T')[0];

  // 5. Load the aggregate
  const schedule = await findOrCreateSchedule(scheduleId);

  // 6. Execute domain logic
  schedule.actions.cancel({ appointmentId: command.appointmentId });

  // 7. Save the modified aggregate
  await saveSchedule(schedule);

  // 8. Return result DTO
  return {
    appointmentId: command.appointmentId,
    status: 'cancelled',
  };
};