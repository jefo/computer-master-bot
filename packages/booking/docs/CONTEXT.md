# Booking Context - Bounded Context Documentation

## Overview

The Booking context is a bounded context within the dlg-ngind platform that provides functionality for scheduling consultations between potential clients and our sales/consultation team. It implements a simple booking system using Domain-Driven Design principles with the SotaJS framework.

## Purpose

This context was created to support the immediate business need for a simple consultation booking system that can be linked from our kwork listing to help potential clients schedule free consultation appointments.

## Domain Model

### Core Entities

1. **Appointment** - Represents a scheduled consultation between a client and a consultant
2. **TimeSlot** - Represents a specific time period that can be booked for an appointment
3. **Client** - Represents a potential client who wants to book a consultation

### Key Value Objects

1. **ContactInfo** - Client's contact details (name, email, phone, company)
2. **DateTimeRange** - Time period with start and end times
3. **AppointmentStatus** - Current state of an appointment (scheduled, confirmed, cancelled, rescheduled)

## Use Cases

### Primary Use Cases

1. **Schedule Appointment** - Books a time slot for a consultation
2. **Get Available Time Slots** - Retrieves available time slots for booking
3. **Cancel Appointment** - Cancels a previously booked appointment
4. **Reschedule Appointment** - Moves an appointment to a different time slot

### Secondary Use Cases

1. **Send Confirmation** - Notifies client of successful booking
2. **Send Reminder** - Sends reminder notification before appointment
3. **Send Cancellation Notice** - Notifies client of appointment cancellation

## Architecture

The Booking context follows the SotaJS DDD architecture with clear separation of concerns:

### Domain Layer
- **Appointment Aggregate** - Main aggregate for appointment management
- **TimeSlot Entity** - Entity representing bookable time periods
- **Client Entity** - Entity representing potential clients

### Application Layer
- **Use Cases** - Orchestrate business workflows
- **Ports** - Define contracts for external dependencies

### Infrastructure Layer
- **Adapters** - Concrete implementations of ports
- **In-Memory Storage** - For development and testing

## Implementation Details

### Technologies Used
- **TypeScript** - Type-safe implementation
- **SotaJS** - DDD framework for business logic
- **Zod** - Schema validation
- **Bun** - JavaScript runtime

### Key Features
- **Time Slot Management** - Creation, booking, and release of time slots
- **Client Management** - Creation and updating of client information
- **Appointment Lifecycle** - Full lifecycle from scheduling to completion
- **Validation** - Comprehensive input validation and business rule enforcement

## Integration Points

### Internal Integrations
- **Event Bus** - For publishing booking events
- **Notification System** - For sending confirmations and reminders

### External Integrations
- **Calendar Systems** - For time slot management (future)
- **Email/SMS Services** - For notifications (future)

## Future Enhancements

1. **Calendar Integration** - Connect with Google Calendar or similar services
2. **Advanced Availability Rules** - Support for multiple consultants with different availability
3. **Multi-language Support** - Support for international clients
4. **Mobile App Integration** - Native mobile app support
5. **Analytics Dashboard** - Booking metrics and reporting

## Testing

The context includes comprehensive tests:
- **Unit Tests** - For domain entities and value objects
- **Integration Tests** - For use case workflows
- **End-to-End Tests** - For complete booking flows

## Usage Example

```typescript
import { composeBookingContext, scheduleAppointmentUseCase } from "@dlg-ngind/booking";

// Initialize the context
composeBookingContext();

// Schedule an appointment
const result = await scheduleAppointmentUseCase({
  timeSlotId: "some-uuid",
  contactInfo: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    company: "Acme Inc"
  }
});

console.log(`Appointment booked with reference: ${result.bookingReference}`);
```