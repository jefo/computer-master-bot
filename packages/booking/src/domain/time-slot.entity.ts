import { z } from "zod";
import { createEntity } from "@maxdev1/sotajs";

// --- Schema ---

export const TimeSlotPropsSchema = z.object({
  id: z.string().uuid(),
  start: z.date(),
  end: z.date(),
  available: z.boolean(),
  consultantId: z.string().uuid().optional(),
});

// --- Types ---

export type TimeSlotProps = z.infer<typeof TimeSlotPropsSchema>;

// --- Entity ---

export const TimeSlot = createEntity({
  name: "TimeSlot",
  schema: TimeSlotPropsSchema,
  actions: {
    book: (state, consultantId?: string) => {
      if (!state.available) {
        throw new Error("Time slot is not available");
      }
      
      state.available = false;
      if (consultantId) {
        state.consultantId = consultantId;
      }
    },
    
    release: (state) => {
      state.available = true;
      state.consultantId = undefined;
    },
    
    assignConsultant: (state, consultantId: string) => {
      state.consultantId = consultantId;
    },
  },
});

export type TimeSlot = ReturnType<typeof TimeSlot.create>;