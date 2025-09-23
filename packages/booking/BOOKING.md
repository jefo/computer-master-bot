# Booking Context

## Overview

This bounded context provides functionality for scheduling consultations between potential clients and our sales/consultation team. It implements a simple booking system using Domain-Driven Design principles with the SotaJS framework.

## Key Features

- Appointment scheduling with time slot management
- Client contact information collection
- Booking confirmation and notifications
- Rescheduling and cancellation capabilities

## Entry Point

This document serves as the entry point for the Booking context. For more detailed information, see:

- [README](./README.md) - Project overview and getting started guide
- [API Documentation](./docs/API.md) - Complete API reference for all use cases
- [Quick Start Guide](./docs/QUICK_START.md) - Getting started quickly with the booking context
- [Integration Examples](./docs/INTEGRATION.md) - Practical examples for bot and web integration
- [Context Documentation](./docs/CONTEXT.md) - Detailed domain model and architecture
- [E2E Demo](./e2e-booking-demo.ts) - Complete end-to-end demonstration

## Architecture

Follows the SotaJS DDD architecture with clear separation of concerns:

- **Domain**: Core business logic and entities
- **Application**: Use cases and business workflows
- **Infrastructure**: Adapters and external integrations

## Key Use Cases

1. **Schedule Appointment** - Books a time slot for a consultation
2. **Get Available Time Slots** - Retrieves available time slots for booking
3. **Cancel Appointment** - Cancels a previously booked appointment
4. **Reschedule Appointment** - Moves an appointment to a different time slot

## Integration

The booking context is designed to be easily integrated into:
- Chatbots using messaging platforms
- Web applications with REST APIs
- Mobile applications
- Other business systems

All integration points are handled through well-defined use cases and ports/adapters pattern.