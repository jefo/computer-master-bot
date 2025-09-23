import { z } from "zod";
import { usePort } from "@maxdev1/sotajs";
import { TimeSlot } from "../domain";
import { findAvailableTimeSlotsPort } from "./ports";

// --- Input Schema ---

const GetAvailableTimeSlotsInputSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

type GetAvailableTimeSlotsInput = z.infer<typeof GetAvailableTimeSlotsInputSchema>;

// --- Output Type ---

export type AvailableTimeSlotDto = {
  id: string;
  start: Date;
  end: Date;
  duration: number; // in minutes
};

// --- Use Case ---

export const getAvailableTimeSlotsUseCase = async (input: unknown): Promise<AvailableTimeSlotDto[]> => {
  // 1. Validate input
  const validInput = GetAvailableTimeSlotsInputSchema.parse(input);
  
  // 2. Get dependencies
  const findAvailableTimeSlots = usePort(findAvailableTimeSlotsPort);
  
  // 3. Find available time slots
  const timeSlots = await findAvailableTimeSlots(validInput.startDate, validInput.endDate);
  
  // 4. Filter only available slots and map to DTOs
  return timeSlots
    .filter(slot => slot.state.available)
    .map(slot => {
      const duration = (slot.state.end.getTime() - slot.state.start.getTime()) / (1000 * 60); // Convert to minutes
      return {
        id: slot.state.id,
        start: slot.state.start,
        end: slot.state.end,
        duration,
      };
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime()); // Sort by start time
};