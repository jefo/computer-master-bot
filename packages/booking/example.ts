import { composeBookingContext } from "./src/composition";
import { scheduleAppointmentUseCase } from "./src/application/schedule-appointment.use-case";
import { getAvailableTimeSlotsUseCase } from "./src/application/get-available-time-slots.use-case";
import { TimeSlot } from "./src/domain";
import { timeSlots } from "./src/infrastructure/in-memory.adapters";
import { randomUUID } from "crypto";

/**
 * Example script demonstrating how to use the Booking context
 */
async function runBookingExample() {
  console.log("=== Booking Context Example ===\n");
  
  // 1. Initialize the context
  composeBookingContext();
  console.log("✓ Booking context initialized");
  
  // 2. Create some sample time slots
  const now = new Date();
  const timeSlot1 = TimeSlot.create({
    id: randomUUID(),
    start: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
    end: new Date(now.getTime() + 25 * 60 * 60 * 1000),   // 1 hour duration
    available: true,
  });
  
  const timeSlot2 = TimeSlot.create({
    id: randomUUID(),
    start: new Date(now.getTime() + 48 * 60 * 60 * 1000), // Day after tomorrow
    end: new Date(now.getTime() + 49 * 60 * 60 * 1000),   // 1 hour duration
    available: true,
  });
  
  // Store the time slots
  timeSlots.set(timeSlot1.state.id, timeSlot1);
  timeSlots.set(timeSlot2.state.id, timeSlot2);
  console.log("✓ Sample time slots created");
  
  // 3. Get available time slots
  const startDate = new Date();
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
  const availableSlots = await getAvailableTimeSlotsUseCase({ startDate, endDate });
  
  console.log(`\nAvailable time slots (${availableSlots.length}):`);
  availableSlots.forEach(slot => {
    console.log(`  - ${slot.start.toLocaleString()} (${slot.duration} minutes)`);
  });
  
  // 4. Schedule an appointment
  console.log("\n=== Scheduling Appointment ===");
  try {
    const result = await scheduleAppointmentUseCase({
      timeSlotId: availableSlots[0].id,
      contactInfo: {
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        phone: "+1234567890",
        company: "Tech Solutions Inc",
      },
    });
    
    console.log("✓ Appointment scheduled successfully!");
    console.log(`  Appointment ID: ${result.appointmentId}`);
    console.log(`  Booking Reference: ${result.bookingReference}`);
    
    // 5. Try to book the same slot again (should fail)
    console.log("\n=== Attempting to Book Same Slot ===");
    try {
      await scheduleAppointmentUseCase({
        timeSlotId: availableSlots[0].id,
        contactInfo: {
          name: "Another Person",
          email: "another@example.com",
          phone: "+0987654321",
        },
      });
    } catch (error) {
      console.log("✓ Correctly prevented double booking");
      console.log(`  Error: ${error.message}`);
    }
  } catch (error) {
    console.error("✗ Failed to schedule appointment:", error.message);
  }
  
  console.log("\n=== Example Complete ===");
}

// Run the example
runBookingExample().catch(console.error);