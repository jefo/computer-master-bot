import { z } from "zod";
import { createPort, usePort } from "@maxdev1/sotajs";
import { DailySchedule } from "../domain/daily-schedule.aggregate";

// --- Ports ---

// We need a way to get schedules for a date range
export const findSchedulesByDateRangePort = createPort<(query: { startDate: Date, endDate: Date }) => Promise<DailySchedule[]>>();


// --- Input Schema ---

export const GetAvailableTimeSlotsInputSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

type GetAvailableTimeSlotsInput = z.infer<typeof GetAvailableTimeSlotsInputSchema>;

// --- Output DTO ---

export type TimeSlotDTO = {
  start: Date;
  end: Date;
};

export type GetAvailableTimeSlotsOutput = TimeSlotDTO[];


// --- Use Case ---

export const getAvailableTimeSlotsUseCase = async (input: GetAvailableTimeSlotsInput): Promise<GetAvailableTimeSlotsOutput> => {
  // 1. Validate input
  const query = GetAvailableTimeSlotsInputSchema.parse(input);

  // 2. Get dependencies
  const findSchedules = usePort(findSchedulesByDateRangePort);

  // 3. Fetch all schedules in the range
  const schedules = await findSchedules(query);

  const allBookedSlots = schedules
    .flatMap(schedule => schedule.state.appointments)
    .filter(app => app.status === 'confirmed')
    .map(app => app.timeSlot);

  // 4. Logic to find available slots (simplified example)
  const availableSlots: TimeSlotDTO[] = [];
  const workDayStartHour = 9;
  const workDayEndHour = 17;

  for (let day = new Date(query.startDate); day <= query.endDate; day.setDate(day.getDate() + 1)) {
    const currentDate = new Date(day);
    currentDate.setHours(workDayStartHour, 0, 0, 0);

    while (currentDate.getHours() < workDayEndHour) {
      const slotStart = new Date(currentDate);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1-hour slots

      const isOverlapping = allBookedSlots.some(
        bookedSlot => slotStart < bookedSlot.end && slotEnd > bookedSlot.start
      );

      if (!isOverlapping) {
        availableSlots.push({ start: slotStart, end: slotEnd });
      }

      currentDate.setTime(slotEnd.getTime());
    }
  }

  return availableSlots;
};