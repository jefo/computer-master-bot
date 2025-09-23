import { z } from "zod";
import { createAggregate } from "@maxdev1/sotajs";

// --- Schemas ---

export const ContactInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone is required"),
  company: z.string().optional(),
});

export const DateTimeRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
});

export const AppointmentStatusSchema = z.enum([
  "scheduled",
  "confirmed",
  "cancelled",
  "rescheduled",
]);

export const AppointmentPropsSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  timeSlotId: z.string().uuid(), // Store the time slot ID
  timeSlot: DateTimeRangeSchema, // Store the time range for reference
  contactInfo: ContactInfoSchema,
  status: AppointmentStatusSchema,
  bookingReference: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
  reminderSent: z.boolean(),
});

// --- Types ---

export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type DateTimeRange = z.infer<typeof DateTimeRangeSchema>;
export type AppointmentStatus = z.infer<typeof AppointmentStatusSchema>;
export type AppointmentProps = z.infer<typeof AppointmentPropsSchema>;

// --- Aggregate ---

export const Appointment = createAggregate({
  name: "Appointment",
  schema: AppointmentPropsSchema,
  invariants: [
    // Ensure end time is after start time
    (state) => {
      if (state.timeSlot.end <= state.timeSlot.start) {
        throw new Error("End time must be after start time");
      }
    },
    // Ensure booking reference is not empty
    (state) => {
      if (!state.bookingReference || state.bookingReference.trim() === "") {
        throw new Error("Booking reference is required");
      }
    },
  ],
  actions: {
    cancel: (state) => {
      state.status = "cancelled";
      state.updatedAt = new Date();
    },
    
    reschedule: (state, newTimeSlot: DateTimeRange) => {
      // Can only reschedule if not cancelled
      if (state.status === "cancelled") {
        throw new Error("Cannot reschedule a cancelled appointment");
      }
      
      state.timeSlot = newTimeSlot;
      state.status = "rescheduled";
      state.updatedAt = new Date();
      state.reminderSent = false; // Reset reminder for new time
    },
    
    confirm: (state) => {
      if (state.status === "cancelled") {
        throw new Error("Cannot confirm a cancelled appointment");
      }
      
      state.status = "confirmed";
      state.updatedAt = new Date();
    },
    
    sendReminder: (state) => {
      state.reminderSent = true;
      state.updatedAt = new Date();
    },
  },
});

export type Appointment = ReturnType<typeof Appointment.create>;