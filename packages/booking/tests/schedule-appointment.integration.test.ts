import { describe, it, expect, beforeEach } from "bun:test";
import { randomUUID } from "crypto";
import { setPortAdapter, resetDI } from "@maxdev1/sotajs";
import {
  scheduleAppointmentUseCase,
  findOrCreateDailySchedulePort,
  saveDailySchedulePort,
} from "../src/application/schedule-appointment.use-case";
import { DailySchedule } from "../src/domain/daily-schedule.aggregate";

// In-memory storage for schedules
const dailySchedules = new Map<string, DailySchedule>();

// --- Adapters ---

const findOrCreateDailyScheduleAdapter = async (date: string): Promise<DailySchedule> => {
  if (dailySchedules.has(date)) {
    return dailySchedules.get(date)!;
  }
  const newSchedule = DailySchedule.create({ id: date, appointments: [] });
  return newSchedule;
};

const saveDailyScheduleAdapter = async (schedule: DailySchedule): Promise<void> => {
  dailySchedules.set(schedule.state.id, schedule);
};

describe("ScheduleAppointmentUseCase - Integration", () => {

  beforeEach(() => {
    resetDI();
    dailySchedules.clear();

    setPortAdapter(findOrCreateDailySchedulePort, findOrCreateDailyScheduleAdapter);
    setPortAdapter(saveDailySchedulePort, saveDailyScheduleAdapter);
  });

  it("should schedule an appointment successfully when the slot is free", async () => {
    const clientId = randomUUID();
    const startTime = new Date("2025-10-10T10:00:00.000Z");

    const input = {
      clientId,
      startTime,
      durationInMinutes: 30,
    };

    const result = await scheduleAppointmentUseCase(input);

    expect(result).toBeDefined();
    expect(result.clientId).toBe(clientId);
    expect(result.startTime).toEqual(startTime);

    const scheduleId = startTime.toISOString().split('T')[0];
    const savedSchedule = dailySchedules.get(scheduleId);
    expect(savedSchedule).toBeDefined();
    expect(savedSchedule!.state.appointments.length).toBe(1);
  });

  it("should fail to schedule an appointment for the exact same time slot", async () => {
    const clientId1 = randomUUID();
    const startTime = new Date("2025-10-10T11:00:00.000Z");

    // Book the first appointment
    await scheduleAppointmentUseCase({
      clientId: clientId1,
      startTime,
      durationInMinutes: 60,
    });

    // Attempt to book the same slot again
    const secondBookingPromise = scheduleAppointmentUseCase({
      clientId: randomUUID(),
      startTime,
      durationInMinutes: 60,
    });

    await expect(secondBookingPromise).rejects.toThrow("Time slot is not available");
  });

  it("should fail to schedule an overlapping appointment", async () => {
    const startTime1 = new Date("2025-10-10T14:00:00.000Z"); // 14:00 to 15:00
    const startTime2 = new Date("2025-10-10T14:30:00.000Z"); // 14:30 to 15:30 (overlaps)

    // Book the first appointment
    await scheduleAppointmentUseCase({
      clientId: randomUUID(),
      startTime: startTime1,
      durationInMinutes: 60,
    });

    // Attempt to book the overlapping appointment
    const overlappingBookingPromise = scheduleAppointmentUseCase({
      clientId: randomUUID(),
      startTime: startTime2,
      durationInMinutes: 60,
    });

    await expect(overlappingBookingPromise).rejects.toThrow("Time slot is not available");
  });
});
