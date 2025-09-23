import { describe, it, expect } from "bun:test";
import { randomUUID } from "crypto";
import { TimeSlot } from "../src/domain";

describe("TimeSlot Entity", () => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  
  it("should create a valid time slot", () => {
    const timeSlot = TimeSlot.create({
      id: randomUUID(),
      start: now,
      end: futureDate,
      available: true,
    });
    
    expect(timeSlot.state.id).toBeDefined();
    expect(timeSlot.state.start).toBe(now);
    expect(timeSlot.state.end).toBe(futureDate);
    expect(timeSlot.state.available).toBe(true);
  });
  
  it("should book an available time slot", () => {
    const timeSlot = TimeSlot.create({
      id: randomUUID(),
      start: now,
      end: futureDate,
      available: true,
    });
    
    const consultantId = randomUUID();
    timeSlot.actions.book(consultantId);
    
    expect(timeSlot.state.available).toBe(false);
    expect(timeSlot.state.consultantId).toBe(consultantId);
  });
  
  it("should not book an unavailable time slot", () => {
    const timeSlot = TimeSlot.create({
      id: randomUUID(),
      start: now,
      end: futureDate,
      available: false,
    });
    
    expect(() => {
      timeSlot.actions.book();
    }).toThrow("Time slot is not available");
  });
  
  it("should release a booked time slot", () => {
    const timeSlot = TimeSlot.create({
      id: randomUUID(),
      start: now,
      end: futureDate,
      available: false,
      consultantId: randomUUID(),
    });
    
    timeSlot.actions.release();
    
    expect(timeSlot.state.available).toBe(true);
    expect(timeSlot.state.consultantId).toBeUndefined();
  });
});