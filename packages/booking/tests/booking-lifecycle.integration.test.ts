import { describe, it, expect, beforeEach } from "bun:test";
import { randomUUID } from "crypto";
import { setPortAdapter, resetDI, createPort } from "@maxdev1/sotajs";
import { DailySchedule, Appointment } from "../src/domain";
import {
  scheduleAppointmentUseCase,
  findOrCreateDailySchedulePort as findOrCreateScheduleForBook,
  saveDailySchedulePort as saveScheduleForBook,
} from "../src/application/schedule-appointment.use-case";
import {
  cancelAppointmentUseCase,
  findAppointmentByIdPort,
  findOrCreateDailySchedulePort as findOrCreateScheduleForCancel,
  saveDailySchedulePort as saveScheduleForCancel,
} from "../src/application/cancel-appointment.use-case";
import {
  getAvailableTimeSlotsUseCase,
  findSchedulesByDateRangePort,
} from "../src/application/get-available-time-slots.use-case";


// --- In-memory Storage and Adapters ---

const dailySchedules = new Map<string, DailySchedule>();

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

const findAppointmentByIdAdapter = async (appointmentId: string): Promise<Appointment | null> => {
    for (const schedule of dailySchedules.values()) {
        const appState = schedule.state.appointments.find(a => a.id === appointmentId);
        if (appState) {
            return Appointment.create(appState);
        }
    }
    return null;
};

const findSchedulesByDateRangeAdapter = async (query: { startDate: Date, endDate: Date }): Promise<DailySchedule[]> => {
    const results: DailySchedule[] = [];
    for (let day = new Date(query.startDate); day <= query.endDate; day.setDate(day.getDate() + 1)) {
        const scheduleId = day.toISOString().split('T')[0];
        if (dailySchedules.has(scheduleId)) {
            results.push(dailySchedules.get(scheduleId)!);
        }
    }
    return results;
};


describe("Booking Lifecycle Integration", () => {

  beforeEach(() => {
    resetDI();
    dailySchedules.clear();

    // Adapters for scheduling
    setPortAdapter(findOrCreateScheduleForBook, findOrCreateDailyScheduleAdapter);
    setPortAdapter(saveScheduleForBook, saveDailyScheduleAdapter);

    // Adapters for cancellation
    setPortAdapter(findAppointmentByIdPort, findAppointmentByIdAdapter);
    setPortAdapter(findOrCreateScheduleForCancel, findOrCreateDailyScheduleAdapter);
    setPortAdapter(saveScheduleForCancel, saveDailyScheduleAdapter);

    // Adapters for querying availability
    setPortAdapter(findSchedulesByDateRangePort, findSchedulesByDateRangeAdapter);
  });

  it("should show a full day of available slots, book one, see it become unavailable, then cancel it and see it become available again", async () => {
    const clientId = randomUUID();
    const testDate = new Date("2025-11-15T00:00:00.000Z");
    const dayStart = new Date("2025-11-15T00:00:00.000Z");
    const dayEnd = new Date("2025-11-15T23:59:59.999Z");

    // 1. Get initial availability - should be a full day (8 slots from 9 to 17)
    const initialSlots = await getAvailableTimeSlotsUseCase({ startDate: dayStart, endDate: dayEnd });
    expect(initialSlots.length).toBe(8);

    // 2. Book an appointment for 10:00
    const bookingTime = new Date("2025-11-15T10:00:00.000Z");
    const bookingResult = await scheduleAppointmentUseCase({
      clientId,
      startTime: bookingTime,
      durationInMinutes: 60,
    });
    expect(bookingResult.appointmentId).toBeDefined();

    // 3. Check availability again - the 10:00 slot should be gone
    const slotsAfterBooking = await getAvailableTimeSlotsUseCase({ startDate: dayStart, endDate: dayEnd });
    expect(slotsAfterBooking.length).toBe(7);
    const has10amSlot = slotsAfterBooking.some(slot => slot.start.getTime() === bookingTime.getTime());
    expect(has10amSlot).toBe(false);

    // 4. Cancel the appointment
    const cancelResult = await cancelAppointmentUseCase({ appointmentId: bookingResult.appointmentId });
    expect(cancelResult.status).toBe('cancelled');

    // 5. Check availability one last time - the 10:00 slot should be back
    const slotsAfterCancellation = await getAvailableTimeSlotsUseCase({ startDate: dayStart, endDate: dayEnd });
    expect(slotsAfterCancellation.length).toBe(8);
    const has10amSlotAgain = slotsAfterCancellation.some(slot => slot.start.getTime() === bookingTime.getTime());
    expect(has10amSlotAgain).toBe(true);
  });

  it("should throw an error when trying to cancel a non-existent appointment", async () => {
    const nonExistentId = randomUUID();
    await expect(cancelAppointmentUseCase({ appointmentId: nonExistentId })).rejects.toThrow("Appointment not found");
  });
});
