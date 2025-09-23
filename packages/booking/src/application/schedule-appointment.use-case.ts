import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import { randomUUID } from "crypto";
import { 
  Appointment, 
  TimeSlot, 
  Client,
  ContactInfoSchema
} from "../domain";
import {
  findTimeSlotByIdPort,
  findClientByEmailPort,
  saveAppointmentPort,
  saveTimeSlotPort,
  saveClientPort,
  appointmentConfirmedOutPort
} from "./ports";

// --- Input Schema ---

const ScheduleAppointmentInputSchema = z.object({
  timeSlotId: z.string().uuid(),
  contactInfo: ContactInfoSchema,
});

type ScheduleAppointmentInput = z.infer<typeof ScheduleAppointmentInputSchema>;

// --- Use Case ---

export const scheduleAppointmentUseCase = async (input: unknown): Promise<{ appointmentId: string; bookingReference: string }> => {
  // 1. Validate input
  const validInput = ScheduleAppointmentInputSchema.parse(input);
  
  // 2. Get dependencies
  const findTimeSlotById = usePort(findTimeSlotByIdPort);
  const findClientByEmail = usePort(findClientByEmailPort);
  const saveAppointment = usePort(saveAppointmentPort);
  const saveTimeSlot = usePort(saveTimeSlotPort);
  const saveClient = usePort(saveClientPort);
  const appointmentConfirmed = usePort(appointmentConfirmedOutPort);
  
  // 3. Find the time slot
  const timeSlot = await findTimeSlotById(validInput.timeSlotId);
  if (!timeSlot) {
    throw new Error(`Time slot with id ${validInput.timeSlotId} not found`);
  }
  
  if (!timeSlot.state.available) {
    throw new Error("Selected time slot is not available");
  }
  
  // 4. Check if client already exists
  let client: Client;
  const existingClient = await findClientByEmail(validInput.contactInfo.email);
  
  if (existingClient) {
    client = existingClient;
  } else {
    // Create new client
    client = Client.create({
      id: randomUUID(),
      name: validInput.contactInfo.name,
      email: validInput.contactInfo.email,
      phone: validInput.contactInfo.phone,
      company: validInput.contactInfo.company,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await saveClient(client);
  }
  
  // 5. Book the time slot
  timeSlot.actions.book(client.state.id);
  await saveTimeSlot(timeSlot);
  
  // 6. Create appointment
  const now = new Date();
  const bookingReference = `BK-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${randomUUID().substring(0, 6).toUpperCase()}`;
  
  const appointment = Appointment.create({
    id: randomUUID(),
    clientId: client.state.id,
    timeSlotId: timeSlot.state.id, // Store the time slot ID
    timeSlot: { // Store the time range
      start: timeSlot.state.start,
      end: timeSlot.state.end
    },
    contactInfo: validInput.contactInfo,
    status: "scheduled",
    bookingReference,
    createdAt: now,
    updatedAt: now,
    reminderSent: false,
  });
  
  // 7. Save appointment
  await saveAppointment(appointment);
  
  // 8. Send confirmation
  await appointmentConfirmed({
    appointmentId: appointment.state.id,
    clientName: appointment.state.contactInfo.name,
    clientEmail: appointment.state.contactInfo.email,
    timeSlot: appointment.state.timeSlot,
    bookingReference: appointment.state.bookingReference,
  });
  
  // 9. Return result
  return {
    appointmentId: appointment.state.id,
    bookingReference: appointment.state.bookingReference,
  };
};