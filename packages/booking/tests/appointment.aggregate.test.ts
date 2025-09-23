import { describe, it, expect, beforeEach } from "bun:test";
import { randomUUID } from "crypto";
import { Appointment, TimeSlot, Client } from "../src/domain";

describe("Appointment Aggregate", () => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  const validTimeSlot = {
    start: now,
    end: futureDate,
  };
  
  const validContactInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
  };
  
  it("should create a valid appointment", () => {
    const appointment = Appointment.create({
      id: randomUUID(),
      clientId: randomUUID(),
      timeSlotId: randomUUID(), // Add the new required field
      timeSlot: validTimeSlot,
      contactInfo: validContactInfo,
      status: "scheduled",
      bookingReference: "BK-20230101-ABC123",
      createdAt: now,
      updatedAt: now,
      reminderSent: false,
    });
    
    expect(appointment.state.id).toBeDefined();
    expect(appointment.state.clientId).toBeDefined();
    expect(appointment.state.status).toBe("scheduled");
    expect(appointment.state.bookingReference).toBe("BK-20230101-ABC123");
  });
  
  it("should cancel an appointment", () => {
    const appointment = Appointment.create({
      id: randomUUID(),
      clientId: randomUUID(),
      timeSlotId: randomUUID(), // Add the new required field
      timeSlot: validTimeSlot,
      contactInfo: validContactInfo,
      status: "scheduled",
      bookingReference: "BK-20230101-ABC123",
      createdAt: now,
      updatedAt: now,
      reminderSent: false,
    });
    
    appointment.actions.cancel();
    
    expect(appointment.state.status).toBe("cancelled");
    expect(appointment.state.updatedAt).toBeInstanceOf(Date);
  });
  
  it("should confirm an appointment", () => {
    const appointment = Appointment.create({
      id: randomUUID(),
      clientId: randomUUID(),
      timeSlotId: randomUUID(), // Add the new required field
      timeSlot: validTimeSlot,
      contactInfo: validContactInfo,
      status: "scheduled",
      bookingReference: "BK-20230101-ABC123",
      createdAt: now,
      updatedAt: now,
      reminderSent: false,
    });
    
    appointment.actions.confirm();
    
    expect(appointment.state.status).toBe("confirmed");
    expect(appointment.state.updatedAt).toBeInstanceOf(Date);
  });
  
  it("should not allow rescheduling a cancelled appointment", () => {
    const appointment = Appointment.create({
      id: randomUUID(),
      clientId: randomUUID(),
      timeSlotId: randomUUID(), // Add the new required field
      timeSlot: validTimeSlot,
      contactInfo: validContactInfo,
      status: "cancelled",
      bookingReference: "BK-20230101-ABC123",
      createdAt: now,
      updatedAt: now,
      reminderSent: false,
    });
    
    expect(() => {
      appointment.actions.reschedule({
        start: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        end: new Date(now.getTime() + 49 * 60 * 60 * 1000),
      });
    }).toThrow("Cannot reschedule a cancelled appointment");
  });
});