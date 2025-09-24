# Architectural Vision for a Universal Booking System

This document outlines the strategic evolution of the booking module from a specialized appointment scheduler to a universal booking platform capable of handling various business domains.

## 1. Analysis of the Current System

Our current system is a well-designed but highly specialized solution for a single business scenario: **booking time slots within a day for a single resource** (e.g., one consultant).

- **Strengths:** It is robust and atomic for its specific purpose, built on solid DDD principles.
- **Limitations:** Its core aggregate, `DailySchedule`, is hard-coded to a daily, time-slot-based logic. This makes it difficult to adapt to other booking models.

### Applicability to Different Domains:

- **Technicians/Consultants:** Perfect fit.
- **Restaurant Tables:** Possible, but requires a separate `DailySchedule` aggregate for each table, which is cumbersome.
- **Hotel Rooms / Apartments:** Not suitable. These resources are booked by the day (`DailyPolicy`), not by the hour (`TimeSlotPolicy`). The current logic for finding hourly gaps is not applicable.

## 2. The Path to a Universal System: Core Concepts

To evolve, we must abstract our core concepts from "appointments" to generic **"Resources"** and **"Booking Policies"**.

### Concept 1: The "Bookable Resource"

We will introduce a generic `Resource` entity. A resource is anything that can be booked.

- **Examples:** "Computer Technician #1", "Table #5 by the window", "Suite #301", "Apartment on Main St."
- **Key Attribute:** Each resource will have a **`BookingPolicy`**.

### Concept 2: Booking Policies

A policy is a set of rules defining *how* a resource can be booked. This is the key to making the system universal.

1.  **`TimeSlotPolicy`:**
    -   **For:** Technicians, consultants, tables.
    -   **Rules:** Defines operating hours (e.g., 9:00-18:00), slot duration, rules for overlaps.

2.  **`DailyPolicy`:**
    -   **For:** Hotel rooms, apartments, rental cars.
    -   **Rules:** Defines check-in/check-out times, minimum booking duration (e.g., 1 day).

## 3. Proposed Architectural Evolution

To implement this vision, we need to refactor the domain model:

1.  **Generalize `Appointment` to `Booking`:**
    -   The `Appointment` entity will be renamed to `Booking` to reflect its more general nature.

2.  **Evolve `DailySchedule` to `ResourceSchedule`:**
    -   This is the most significant change. The `DailySchedule` aggregate will be refactored into a `ResourceSchedule` aggregate.
    -   Its ID will change from a `date` to a `resourceId`.
    -   It will be responsible for managing all bookings for a single resource, ensuring no conflicts according to the resource's policy.

3.  **Adapt Use Case Logic:**
    -   The primary use case (`scheduleBookingUseCase`) will be updated to:
        1.  Accept a `resourceId` and the desired period (a time interval or a date range).
        2.  Load the `Resource` and its `BookingPolicy`.
        3.  Load the `ResourceSchedule` aggregate.
        4.  Call the `schedule.book(...)` action, which will use the resource's policy to validate the booking and check for conflicts (either time-slot or daily overlaps).

---

By following this evolutionary path, the booking module can become a powerful and flexible platform capable of supporting a wide range of business models without sacrificing the robustness of its core domain logic.
