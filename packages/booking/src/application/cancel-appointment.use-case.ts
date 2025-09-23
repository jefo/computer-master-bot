import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import { Appointment, TimeSlot } from "../domain";
import {
  findAppointmentByIdPort,
  findTimeSlotByIdPort,
  saveAppointmentPort,
  saveTimeSlotPort,
  appointmentCancelledOutPort
} from "./ports";

// --- Input Schema ---

const CancelAppointmentInputSchema = z.object({
  appointmentId: z.string().uuid(),
});

type CancelAppointmentInput = z.infer<typeof CancelAppointmentInputSchema>;

// --- Use Case ---

export const cancelAppointmentUseCase = async (input: unknown): Promise<void> => {
  // 1. Validate input
  const validInput = CancelAppointmentInputSchema.parse(input);
  
  // 2. Get dependencies
  const findAppointmentById = usePort(findAppointmentByIdPort);
  const findTimeSlotById = usePort(findTimeSlotByIdPort);
  const saveAppointment = usePort(saveAppointmentPort);
  const saveTimeSlot = usePort(saveTimeSlotPort);
  const appointmentCancelled = usePort(appointmentCancelledOutPort);
  
  // 3. Find the appointment
  const appointment = await findAppointmentById(validInput.appointmentId);
  if (!appointment) {
    throw new Error(`Appointment with id ${validInput.appointmentId} not found`);
  }
  
  // 4. Check if appointment can be cancelled
  if (appointment.state.status === "cancelled") {
    throw new Error("Appointment is already cancelled");
  }
  
  // 5. Cancel the appointment
  appointment.actions.cancel();
  await saveAppointment(appointment);
  
  // 6. Release the time slot
  const timeSlot = await findTimeSlotById(appointment.state.timeSlotId);
  if (timeSlot) {
    timeSlot.actions.release();
    await saveTimeSlot(timeSlot);
  }
  
  // 7. Send cancellation notification
  await appointmentCancelled({
    appointmentId: appointment.state.id,
    clientName: appointment.state.contactInfo.name,
    clientEmail: appointment.state.contactInfo.email,
  });
};