import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import { Appointment, TimeSlot } from "../domain";
import {
  findAppointmentByIdPort,
  findTimeSlotByIdPort,
  saveAppointmentPort,
  saveTimeSlotPort
} from "./ports";

// --- Input Schema ---

const RescheduleAppointmentInputSchema = z.object({
  appointmentId: z.string().uuid(),
  newTimeSlotId: z.string().uuid(),
});

type RescheduleAppointmentInput = z.infer<typeof RescheduleAppointmentInputSchema>;

// --- Use Case ---

export const rescheduleAppointmentUseCase = async (input: unknown): Promise<void> => {
  // 1. Validate input
  const validInput = RescheduleAppointmentInputSchema.parse(input);
  
  // 2. Get dependencies
  const findAppointmentById = usePort(findAppointmentByIdPort);
  const findTimeSlotById = usePort(findTimeSlotByIdPort);
  const saveAppointment = usePort(saveAppointmentPort);
  const saveTimeSlot = usePort(saveTimeSlotPort);
  
  // 3. Find the appointment
  const appointment = await findAppointmentById(validInput.appointmentId);
  if (!appointment) {
    throw new Error(`Appointment with id ${validInput.appointmentId} not found`);
  }
  
  // 4. Check if appointment can be rescheduled
  if (appointment.state.status === "cancelled") {
    throw new Error("Cannot reschedule a cancelled appointment");
  }
  
  // 5. Find the new time slot
  const newTimeSlot = await findTimeSlotById(validInput.newTimeSlotId);
  if (!newTimeSlot) {
    throw new Error(`Time slot with id ${validInput.newTimeSlotId} not found`);
  }
  
  if (!newTimeSlot.state.available) {
    throw new Error("Selected time slot is not available");
  }
  
  // 6. Find the old time slot to release it
  const oldTimeSlot = await findTimeSlotById(appointment.state.timeSlotId);
  
  // 7. Reschedule the appointment
  appointment.actions.reschedule({
    start: newTimeSlot.state.start,
    end: newTimeSlot.state.end
  });
  await saveAppointment(appointment);
  
  // 8. Book the new time slot
  newTimeSlot.actions.book(appointment.state.clientId);
  await saveTimeSlot(newTimeSlot);
  
  // 9. Release the old time slot
  if (oldTimeSlot) {
    oldTimeSlot.actions.release();
    await saveTimeSlot(oldTimeSlot);
  }
};