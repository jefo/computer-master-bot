import { createPort } from "@maxdev1/sotajs";
import type { Appointment, TimeSlot, Client } from "../domain";

// --- Domain Ports (for data access) ---

export const findAppointmentByIdPort = 
  createPort<(id: string) => Promise<Appointment | null>>();

export const findAppointmentsByClientPort = 
  createPort<(clientId: string) => Promise<Appointment[]>>();

export const findAvailableTimeSlotsPort = 
  createPort<(startDate: Date, endDate: Date) => Promise<TimeSlot[]>>();

export const findTimeSlotByIdPort = 
  createPort<(id: string) => Promise<TimeSlot | null>>();

export const findClientByEmailPort = 
  createPort<(email: string) => Promise<Client | null>>();

export const findClientByIdPort = 
  createPort<(id: string) => Promise<Client | null>>();

export const saveAppointmentPort = 
  createPort<(appointment: Appointment) => Promise<void>>();

export const saveTimeSlotPort = 
  createPort<(timeSlot: TimeSlot) => Promise<void>>();

export const saveClientPort = 
  createPort<(client: Client) => Promise<void>>();

// --- Output Ports (for notifications) ---

export type AppointmentConfirmationDto = {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  timeSlot: { start: Date; end: Date };
  bookingReference: string;
};

export type AppointmentReminderDto = {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  timeSlot: { start: Date; end: Date };
  bookingReference: string;
};

export const appointmentConfirmedOutPort = 
  createPort<(dto: AppointmentConfirmationDto) => Promise<void>>();

export const appointmentReminderOutPort = 
  createPort<(dto: AppointmentReminderDto) => Promise<void>>();

export const appointmentCancelledOutPort = 
  createPort<(dto: { appointmentId: string; clientName: string; clientEmail: string }) => Promise<void>>();