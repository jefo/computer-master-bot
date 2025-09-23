# Booking Context API Documentation

## Overview

The Booking Context provides a complete API for scheduling, managing, and cancelling appointments. This documentation describes all available use cases that can be integrated into bots, websites, or other applications.

## Base URL

All operations are performed through use case functions exported by the `@dlg-ngind/booking` package.

## Authentication

The booking context uses dependency injection for port adapters. Authentication and authorization should be handled at the adapter level.

## Error Handling

All use cases may throw errors that should be handled by the calling application:

- `ZodError` - Input validation errors
- `Error` - Business logic errors (e.g., "Time slot is not available")
- Other errors as specified in individual use cases

## Use Cases

### 1. Schedule Appointment

Creates a new appointment by booking a time slot for a client.

#### Endpoint
```typescript
scheduleAppointmentUseCase(input: ScheduleAppointmentInput): Promise<ScheduleAppointmentResult>
```

#### Input
```typescript
interface ScheduleAppointmentInput {
  timeSlotId: string; // UUID of the time slot to book
  contactInfo: {
    name: string;      // Client's full name
    email: string;     // Client's email address
    phone: string;     // Client's phone number
    company?: string;  // Optional company name
  };
}
```

#### Output
```typescript
interface ScheduleAppointmentResult {
  appointmentId: string;   // UUID of the created appointment
  bookingReference: string; // Human-readable booking reference
}
```

#### Errors
- `Error` - "Time slot with id {id} not found"
- `Error` - "Selected time slot is not available"
- `Error` - Validation errors for contact information

#### Example
```typescript
import { scheduleAppointmentUseCase } from "@dlg-ngind/booking";

const result = await scheduleAppointmentUseCase({
  timeSlotId: "550e8400-e29b-41d4-a716-446655440000",
  contactInfo: {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1234567890",
    company: "Tech Solutions Inc"
  }
});

console.log(`Appointment booked: ${result.bookingReference}`);
```

### 2. Get Available Time Slots

Retrieves a list of available time slots within a specified date range.

#### Endpoint
```typescript
getAvailableTimeSlotsUseCase(input: GetAvailableTimeSlotsInput): Promise<AvailableTimeSlot[]>
```

#### Input
```typescript
interface GetAvailableTimeSlotsInput {
  startDate: Date; // Start of the date range to search
  endDate: Date;   // End of the date range to search
}
```

#### Output
```typescript
interface AvailableTimeSlot {
  id: string;      // UUID of the time slot
  start: Date;     // Start time of the slot
  end: Date;       // End time of the slot
  duration: number; // Duration in minutes
}
```

#### Errors
- `ZodError` - Validation errors for date inputs

#### Example
```typescript
import { getAvailableTimeSlotsUseCase } from "@dlg-ngind/booking";

const availableSlots = await getAvailableTimeSlotsUseCase({
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
});

console.log(`Found ${availableSlots.length} available time slots`);
availableSlots.forEach(slot => {
  console.log(`- ${slot.start.toLocaleString()} (${slot.duration} minutes)`);
});
```

### 3. Cancel Appointment

Cancels an existing appointment and releases the associated time slot.

#### Endpoint
```typescript
cancelAppointmentUseCase(input: CancelAppointmentInput): Promise<void>
```

#### Input
```typescript
interface CancelAppointmentInput {
  appointmentId: string; // UUID of the appointment to cancel
}
```

#### Output
Returns `Promise<void>` on success.

#### Errors
- `Error` - "Appointment with id {id} not found"
- `Error` - "Appointment is already cancelled"

#### Example
```typescript
import { cancelAppointmentUseCase } from "@dlg-ngind/booking";

try {
  await cancelAppointmentUseCase({
    appointmentId: "550e8400-e29b-41d4-a716-446655440000"
  });
  console.log("Appointment cancelled successfully");
} catch (error) {
  console.error("Failed to cancel appointment:", error.message);
}
```

### 4. Reschedule Appointment

Moves an existing appointment to a different time slot.

#### Endpoint
```typescript
rescheduleAppointmentUseCase(input: RescheduleAppointmentInput): Promise<void>
```

#### Input
```typescript
interface RescheduleAppointmentInput {
  appointmentId: string;  // UUID of the appointment to reschedule
  newTimeSlotId: string;  // UUID of the new time slot
}
```

#### Output
Returns `Promise<void>` on success.

#### Errors
- `Error` - "Appointment with id {id} not found"
- `Error` - "Cannot reschedule a cancelled appointment"
- `Error` - "Time slot with id {id} not found"
- `Error` - "Selected time slot is not available"

#### Example
```typescript
import { rescheduleAppointmentUseCase } from "@dlg-ngind/booking";

try {
  await rescheduleAppointmentUseCase({
    appointmentId: "550e8400-e29b-41d4-a716-446655440000",
    newTimeSlotId: "550e8400-e29b-41d4-a716-446655440001"
  });
  console.log("Appointment rescheduled successfully");
} catch (error) {
  console.error("Failed to reschedule appointment:", error.message);
}
```

## Integration Examples

### Bot Integration

To integrate with a bot, you would typically:

1. Use `getAvailableTimeSlotsUseCase` to show available times to the user
2. Collect user information through the bot conversation
3. Use `scheduleAppointmentUseCase` to book the appointment
4. Listen for output ports to send confirmation messages

### Web Integration

To integrate with a web application, you would typically:

1. Call `getAvailableTimeSlotsUseCase` to populate a calendar UI
2. Collect user information through a web form
3. Call `scheduleAppointmentUseCase` when the form is submitted
4. Display the booking reference to the user

## Output Ports

The booking context emits events through output ports that integrations should handle:

### Appointment Confirmed
```typescript
interface AppointmentConfirmationDto {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  timeSlot: { start: Date; end: Date };
  bookingReference: string;
}
```

### Appointment Cancelled
```typescript
interface AppointmentCancelledDto {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
}
```

### Appointment Reminder
```typescript
interface AppointmentReminderDto {
  appointmentId: string;
  clientName: string;
  clientEmail: string;
  timeSlot: { start: Date; end: Date };
  bookingReference: string;
}
```

## Setup and Configuration

### Installation
```bash
npm install @dlg-ngind/booking
```

### Initialization
```typescript
import { composeBookingContext } from "@dlg-ngind/booking";

// Initialize the booking context with default adapters
composeBookingContext();

// For production, you may want to set custom adapters
// setPortAdapter(findAppointmentByIdPort, yourCustomAdapter);
```

### Custom Adapters

The booking context uses ports and adapters for dependency inversion. You can replace the default in-memory adapters with your own implementations:

- `findAppointmentByIdPort` - Find appointment by ID
- `findAppointmentsByClientPort` - Find appointments by client
- `findAvailableTimeSlotsPort` - Find available time slots
- `findTimeSlotByIdPort` - Find time slot by ID
- `findClientByEmailPort` - Find client by email
- `findClientByIdPort` - Find client by ID
- `saveAppointmentPort` - Save appointment
- `saveTimeSlotPort` - Save time slot
- `saveClientPort` - Save client
- `appointmentConfirmedOutPort` - Handle appointment confirmation
- `appointmentReminderOutPort` - Handle appointment reminders
- `appointmentCancelledOutPort` - Handle appointment cancellation

## Data Models

### Appointment Status
```typescript
type AppointmentStatus = 
  | "scheduled"    // Appointment is booked
  | "confirmed"    // Appointment is confirmed
  | "cancelled"    // Appointment is cancelled
  | "rescheduled"; // Appointment has been moved
```

### Time Slot Availability
```typescript
interface TimeSlot {
  id: string;           // UUID
  start: Date;          // Start time
  end: Date;            // End time
  available: boolean;   // Availability status
  consultantId?: string; // Optional consultant assignment
}
```

## Best Practices

1. **Always validate inputs** - Use the provided Zod schemas for validation
2. **Handle errors gracefully** - Catch and handle all possible errors
3. **Use transactions for consistency** - When implementing custom adapters, ensure data consistency
4. **Implement proper logging** - Use the output ports for notifications
5. **Cache frequently accessed data** - Consider caching available time slots
6. **Implement rate limiting** - Prevent abuse of the booking system

## Versioning

This documentation reflects version 1.0.0 of the booking context API.

## Support

For issues, questions, or contributions, please refer to the main project documentation or contact the development team.