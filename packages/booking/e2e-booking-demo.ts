import { randomUUID } from "crypto";
import { composeBookingContext } from "./src/composition";
import { scheduleAppointmentUseCase } from "./src/application/schedule-appointment.use-case";
import { getAvailableTimeSlotsUseCase } from "./src/application/get-available-time-slots.use-case";
import { cancelAppointmentUseCase } from "./src/application/cancel-appointment.use-case";
import { TimeSlot } from "./src/domain";
import { timeSlots, appointments, clients } from "./src/infrastructure/in-memory.adapters";

// --- Sample time slots for the demo ---

const createSampleTimeSlots = () => {
  const now = new Date();
  
  // Create 5 sample time slots for the next 5 days
  for (let i = 1; i <= 5; i++) {
    const start = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const timeSlot = TimeSlot.create({
      id: randomUUID(),
      start,
      end,
      available: true,
    });
    
    timeSlots.set(timeSlot.state.id, timeSlot);
  }
};

// --- Main E2E Test Function ---

async function runBookingE2ETest() {
  console.log("\n--- 🚀 Starting E2E Booking Context Test ---");

  // 1. Initialize the booking context
  console.log("\n1️⃣  Initializing Booking Context...");
  composeBookingContext();
  console.log("✅ Booking context initialized");

  // 2. Create sample time slots
  console.log("\n2️⃣  Creating sample time slots...");
  createSampleTimeSlots();
  console.log(`✅ Created ${timeSlots.size} sample time slots`);

  // 3. Get available time slots
  console.log("\n3️⃣  Getting available time slots...");
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
  const availableSlots = await getAvailableTimeSlotsUseCase({ startDate, endDate });
  
  console.log(`✅ Found ${availableSlots.length} available time slots`);
  availableSlots.slice(0, 3).forEach((slot, index) => {
    console.log(`   ${index + 1}. ${slot.start.toLocaleString()} (${slot.duration} minutes)`);
  });

  // 4. Schedule an appointment
  console.log("\n4️⃣  Scheduling an appointment...");
  const clientInfo = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1234567890",
    company: "Tech Solutions Inc"
  };
  
  try {
    const scheduleResult = await scheduleAppointmentUseCase({
      timeSlotId: availableSlots[0].id,
      contactInfo: clientInfo,
    });
    
    console.log(`✅ Appointment scheduled successfully!`);
    console.log(`   Appointment ID: ${scheduleResult.appointmentId}`);
    console.log(`   Booking Reference: ${scheduleResult.bookingReference}`);
    console.log(`   Client: ${clientInfo.name} (${clientInfo.email})`);
    console.log(`   Time: ${availableSlots[0].start.toLocaleString()}`);
    
    // 5. Verify the appointment was created
    console.log("\n5️⃣  Verifying appointment creation...");
    const createdAppointment = appointments.get(scheduleResult.appointmentId);
    if (createdAppointment) {
      console.log("✅ Appointment verified in storage");
      console.log(`   Status: ${createdAppointment.state.status}`);
      // Get fresh time slot from storage
      const bookedTimeSlot = timeSlots.get(availableSlots[0].id);
      console.log(`   Time slot now available: ${bookedTimeSlot?.state.available ? 'Yes' : 'No'}`);
      console.log(`   Time slot ID: ${bookedTimeSlot?.state.id}`);
    } else {
      console.log("❌ Failed to verify appointment in storage");
    }
    
    // 6. Try to book the same slot again (should fail)
    console.log("\n6️⃣  Attempting to book the same slot again (should fail)...");
    try {
      await scheduleAppointmentUseCase({
        timeSlotId: availableSlots[0].id,
        contactInfo: {
          name: "Another Person",
          email: "another@example.com",
          phone: "+0987654321",
        },
      });
      console.log("❌ Unexpected success - should have failed");
    } catch (error) {
      console.log("✅ Correctly prevented double booking");
      console.log(`   Error: ${error.message}`);
    }
    
    // 7. Show available slots before cancellation
    console.log("\n7️⃣  Available slots before cancellation:");
    const availableBeforeCancel = Array.from(timeSlots.values()).filter(ts => ts.state.available).length;
    console.log(`   Available time slots: ${availableBeforeCancel}`);
    
    // 8. Cancel the appointment
    console.log("\n8️⃣  Cancelling the appointment...");
    console.log(`   Cancelling appointment ID: ${scheduleResult.appointmentId}`);
    console.log(`   Time slot ID from appointment: ${createdAppointment?.state.timeSlotId}`);
    await cancelAppointmentUseCase({
      appointmentId: scheduleResult.appointmentId,
    });
    
    console.log("✅ Appointment cancelled successfully");
    
    // 9. Verify the appointment was cancelled and time slot released
    console.log("\n9️⃣  Verifying cancellation...");
    const cancelledAppointment = appointments.get(scheduleResult.appointmentId);
    if (cancelledAppointment && cancelledAppointment.state.status === "cancelled") {
      console.log("✅ Appointment status correctly updated to cancelled");
      // Count available slots after cancellation
      const availableAfterCancel = Array.from(timeSlots.values()).filter(ts => ts.state.available).length;
      console.log(`   Available time slots: ${availableAfterCancel} (was ${availableBeforeCancel})`);
      
      // Check the specific time slot
      const releasedTimeSlot = timeSlots.get(availableSlots[0].id);
      console.log(`   Specific time slot available: ${releasedTimeSlot?.state.available ? 'Yes' : 'No'}`);
      console.log(`   Specific time slot ID: ${releasedTimeSlot?.state.id}`);
    } else {
      console.log("❌ Failed to verify cancellation");
    }
    
    // 10. Show final state
    console.log("\n🔟  Final state summary...");
    console.log(`   Total appointments: ${appointments.size}`);
    console.log(`   Total clients: ${clients.size}`);
    console.log(`   Total time slots: ${timeSlots.size}`);
    console.log(`   Available time slots: ${Array.from(timeSlots.values()).filter(ts => ts.state.available).length}`);
    
  } catch (error) {
    console.error("❌ Error during booking test:", error.message);
    return;
  }

  console.log("\n--- ✅ E2E Booking Context Test Finished ---\n");
}

// Run the test
runBookingE2ETest().catch(console.error);