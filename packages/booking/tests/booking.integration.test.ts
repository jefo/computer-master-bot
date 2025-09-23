import { describe, it, expect, beforeEach } from "bun:test";
import { randomUUID } from "crypto";
import { composeBookingContext } from "../src/composition";
import { scheduleAppointmentUseCase } from "../src/application/schedule-appointment.use-case";
import { getAvailableTimeSlotsUseCase } from "../src/application/get-available-time-slots.use-case";
import { cancelAppointmentUseCase } from "../src/application/cancel-appointment.use-case";
import { TimeSlot } from "../src/domain";
import { timeSlots } from "../src/infrastructure/in-memory.adapters";

describe("Booking Context Integration", () => {
  beforeEach(() => {
    // Reset the composition for each test
    composeBookingContext();
    
    // Clear the in-memory data stores
    timeSlots.clear();
    
    // Create some test time slots
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      const start = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      const timeSlot = TimeSlot.create({
        id: randomUUID(),
        start,
        end,
        available: true,
      });
      
      timeSlots.set(timeSlot.state.id, timeSlot);
    }
  });
  
  it("should schedule an appointment successfully", async () => {
    // Get available time slots
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
    const availableSlots = await getAvailableTimeSlotsUseCase({ startDate, endDate });
    
    expect(availableSlots.length).toBeGreaterThan(0);
    
    // Schedule an appointment for the first available slot
    const result = await scheduleAppointmentUseCase({
      timeSlotId: availableSlots[0].id,
      contactInfo: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        company: "Acme Inc",
      },
    });
    
    expect(result.appointmentId).toBeDefined();
    expect(result.bookingReference).toMatch(/^BK-\d{8}-[A-Z0-9]{6}$/);
  });
  
  it("should cancel an appointment successfully", async () => {
    // First schedule an appointment
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
    const availableSlots = await getAvailableTimeSlotsUseCase({ startDate, endDate });
    
    const scheduleResult = await scheduleAppointmentUseCase({
      timeSlotId: availableSlots[0].id,
      contactInfo: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        company: "Acme Inc",
      },
    });
    
    // Then cancel it
    await expect(cancelAppointmentUseCase({
      appointmentId: scheduleResult.appointmentId,
    })).resolves.toBeUndefined();
  });
  
  it("should not allow booking an already booked time slot", async () => {
    // Get available time slots
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
    const availableSlots = await getAvailableTimeSlotsUseCase({ startDate, endDate });
    
    // Book the first slot
    await scheduleAppointmentUseCase({
      timeSlotId: availableSlots[0].id,
      contactInfo: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        company: "Acme Inc",
      },
    });
    
    // Try to book the same slot again - should fail
    await expect(scheduleAppointmentUseCase({
      timeSlotId: availableSlots[0].id,
      contactInfo: {
        name: "Jane Doe",
        email: "jane.doe@example.com",
        phone: "+0987654321",
        company: "Globex Corp",
      },
    })).rejects.toThrow("Selected time slot is not available");
  });
});