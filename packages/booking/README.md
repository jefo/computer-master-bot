# Booking Module

This module provides all necessary functionality for appointment booking and scheduling. It is built using Domain-Driven Design (DDD) principles with the SotaJS framework, ensuring a clean separation between business logic and infrastructure.

## Architecture

The module follows a CQRS-like pattern where commands (actions that change state) and queries (requests for data) are separated.

- **Domain (`src/domain`)**: Contains the core business logic. The central piece is the `DailySchedule` aggregate, which ensures that all booking operations are atomic and consistent, preventing issues like double-booking.
- **Application (`src/application`)**: Contains the use cases that orchestrate the business logic.
- **Infrastructure (`src/infrastructure`)**: Provides concrete implementations (adapters) for the ports defined in the application layer. For example, this is where database logic would reside.

Use cases do not use output ports; for simplicity, they return a Data Transfer Object (DTO) on success or throw an error on failure.

## Installation

```bash
bun install
```

## Running Tests

```bash
bun test
```

---

## Developer API & Use Cases

This section provides a reference for the available use cases and how to use them.

### `scheduleAppointmentUseCase`

Schedules a new appointment. It is an atomic operation guaranteed by the `DailySchedule` aggregate.

**Input:** `ScheduleAppointmentInput`
```typescript
{
  clientId: string;          // UUID of the client
  startTime: Date;           // Start time of the appointment
  durationInMinutes: number; // Duration of the appointment
}
```

**Output (on success):** `ScheduleAppointmentOutput`
```typescript
{
  appointmentId: string;
  clientId: string;
  startTime: Date;
}
```

**Errors:** Throws an error if the time slot is not available.

**Example:**
```typescript
import { scheduleAppointmentUseCase } from "./src/application";
import { randomUUID } from "crypto";

const clientId = randomUUID();
const appointmentTime = new Date("2025-12-01T14:00:00.000Z");

try {
  const result = await scheduleAppointmentUseCase({
    clientId,
    startTime: appointmentTime,
    durationInMinutes: 60,
  });
  console.log("Appointment scheduled:", result);
  // {
  //   appointmentId: "...",
  //   clientId: "...",
  //   startTime: Date("2025-12-01T14:00:00.000Z")
  // }
} catch (error) {
  console.error("Failed to schedule:", error.message);
}
```

---

### `cancelAppointmentUseCase`

Cancels a previously scheduled appointment.

**Input:** `CancelAppointmentInput`
```typescript
{
  appointmentId: string; // UUID of the appointment to cancel
}
```

**Output (on success):** `CancelAppointmentOutput`
```typescript
{
  appointmentId: string;
  status: "cancelled";
}
```

**Errors:** Throws an error if the appointment is not found.

**Example:**
```typescript
import { cancelAppointmentUseCase } from "./src/application";

const appointmentIdToCancel = "d8f8b8f8-8f8f-8f8f-8f8f-8f8f8f8f8f8f";

try {
  const result = await cancelAppointmentUseCase({
    appointmentId: appointmentIdToCancel,
  });
  console.log("Appointment cancelled:", result);
  // { appointmentId: "...", status: "cancelled" }
} catch (error) {
  console.error("Failed to cancel:", error.message);
}
```

---

### `getAvailableTimeSlotsUseCase`

Retrieves a list of available time slots within a given date range. It calculates availability by finding the "gaps" between already booked appointments within standard working hours (9:00 - 17:00).

**Input:** `GetAvailableTimeSlotsInput`
```typescript
{
  startDate: Date;
  endDate: Date;
}
```

**Output (on success):** `GetAvailableTimeSlotsOutput` (an array of `TimeSlotDTO`)
```typescript
[
  { start: Date, end: Date },
  { start: Date, end: Date },
  // ...
]
```

**Example:**
```typescript
import { getAvailableTimeSlotsUseCase } from "./src/application";

const startDate = new Date("2025-12-01T00:00:00.000Z");
const endDate = new Date("2025-12-01T23:59:59.999Z");

const availableSlots = await getAvailableTimeSlotsUseCase({
  startDate,
  endDate,
});

console.log("Available Slots:", availableSlots);
// [
//   { start: Date("...T09:00:00..."), end: Date("...T10:00:00...") },
//   { start: Date("...T10:00:00..."), end: Date("...T11:00:00...") },
//   ...
// ]
```
