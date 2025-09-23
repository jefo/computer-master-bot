# Booking Context Quick Start Guide

## Getting Started

This guide will help you quickly integrate the booking context into your application.

## Installation

```bash
npm install @dlg-ngind/booking
```

## Basic Setup

```typescript
import { composeBookingContext } from "@dlg-ngind/booking";

// Initialize the booking context
composeBookingContext();
```

## Simple Integration Example

```typescript
import { 
  getAvailableTimeSlotsUseCase, 
  scheduleAppointmentUseCase 
} from "@dlg-ngind/booking";
import { composeBookingContext } from "@dlg-ngind/booking";

// 1. Initialize the context
composeBookingContext();

// 2. Get available time slots for the next week
async function showAvailableSlots() {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
  
  const availableSlots = await getAvailableTimeSlotsUseCase({ 
    startDate, 
    endDate 
  });
  
  console.log(`Found ${availableSlots.length} available time slots:`);
  availableSlots.forEach((slot, index) => {
    console.log(`${index + 1}. ${slot.start.toLocaleString()} (${slot.duration} minutes)`);
  });
  
  return availableSlots;
}

// 3. Book an appointment
async function bookAppointment(timeSlotId: string, clientInfo: any) {
  try {
    const result = await scheduleAppointmentUseCase({
      timeSlotId,
      contactInfo: clientInfo
    });
    
    console.log(`✅ Appointment booked successfully!`);
    console.log(`Booking Reference: ${result.bookingReference}`);
    
    return result;
  } catch (error) {
    console.error("Failed to book appointment:", error.message);
    throw error;
  }
}

// Usage example
async function example() {
  // Show available slots
  const slots = await showAvailableSlots();
  
  if (slots.length > 0) {
    // Book the first available slot
    await bookAppointment(slots[0].id, {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      company: "Acme Inc"
    });
  }
}

// Run the example
example().catch(console.error);
```

## Key Concepts

### 1. Time Slots
Time slots represent specific periods when appointments can be booked. They have:
- `id`: Unique identifier
- `start`: Start time
- `end`: End time
- `available`: Availability status

### 2. Appointments
Appointments represent booked time slots with client information. They have:
- `id`: Unique identifier
- `clientId`: Associated client
- `timeSlotId`: Booked time slot
- `contactInfo`: Client details
- `status`: Current status (scheduled, confirmed, cancelled, rescheduled)
- `bookingReference`: Human-readable reference

### 3. Clients
Clients represent potential customers. They have:
- `id`: Unique identifier
- `name`: Client name
- `email`: Contact email
- `phone`: Contact phone
- `company`: Optional company name

## Common Operations

### Finding Available Time Slots
```typescript
const availableSlots = await getAvailableTimeSlotsUseCase({ 
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
});
```

### Booking an Appointment
```typescript
const result = await scheduleAppointmentUseCase({
  timeSlotId: "550e8400-e29b-41d4-a716-446655440000",
  contactInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    company: "Acme Inc"
  }
});
```

### Cancelling an Appointment
```typescript
await cancelAppointmentUseCase({
  appointmentId: "550e8400-e29b-41d4-a716-446655440000"
});
```

## Error Handling

All use cases can throw errors that should be handled appropriately:

```typescript
try {
  const result = await scheduleAppointmentUseCase({
    timeSlotId: "invalid-id",
    contactInfo: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890"
    }
  });
} catch (error) {
  if (error instanceof ZodError) {
    console.error("Validation error:", error.message);
  } else if (error.message.includes("not found")) {
    console.error("Time slot not found");
  } else if (error.message.includes("not available")) {
    console.error("Time slot is not available");
  } else {
    console.error("Unexpected error:", error.message);
  }
}
```

## Customization

For production use, you'll likely want to customize the adapters:

```typescript
import { 
  findAppointmentByIdPort,
  saveAppointmentPort,
  // ... other ports
} from "@dlg-ngind/booking";
import { setPortAdapter } from "@maxdev1/sotajs";

// Custom database adapter
const customDatabaseAdapter = {
  findById: async (id: string) => {
    // Your database implementation
  },
  save: async (entity: any) => {
    // Your database implementation
  }
};

// Set custom adapters
setPortAdapter(findAppointmentByIdPort, customDatabaseAdapter.findById);
setPortAdapter(saveAppointmentPort, customDatabaseAdapter.save);
// ... set other adapters as needed
```

## Next Steps

1. Review the full API documentation in `API.md`
2. Check integration examples in `INTEGRATION.md`
3. Explore the source code to understand the domain model
4. Run the e2e demo to see the system in action

## Support

For issues, questions, or contributions, please refer to the main project documentation or contact the development team.