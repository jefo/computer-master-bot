import { z } from "zod";
import { createEntity } from "@maxdev1/sotajs";

// --- Schema ---

export const ClientPropsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone is required"),
  company: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// --- Types ---

export type ClientProps = z.infer<typeof ClientPropsSchema>;

// --- Entity ---

export const Client = createEntity({
  name: "Client",
  schema: ClientPropsSchema,
  actions: {
    updateContactInfo: (state, contactInfo: { name?: string; email?: string; phone?: string; company?: string }) => {
      if (contactInfo.name) {
        state.name = contactInfo.name;
      }
      if (contactInfo.email) {
        // Validate email format
        if (!z.string().email().safeParse(contactInfo.email).success) {
          throw new Error("Invalid email format");
        }
        state.email = contactInfo.email;
      }
      if (contactInfo.phone) {
        state.phone = contactInfo.phone;
      }
      if (contactInfo.company !== undefined) {
        state.company = contactInfo.company;
      }
      state.updatedAt = new Date();
    },
  },
});

export type Client = ReturnType<typeof Client.create>;