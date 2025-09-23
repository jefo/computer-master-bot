# Booking Context Integration Examples

This document provides practical examples of how to integrate the booking context with bots and web applications.

## Bot Integration Example

Here's how you might integrate the booking context with a chatbot:

```typescript
import { 
  getAvailableTimeSlotsUseCase, 
  scheduleAppointmentUseCase,
  cancelAppointmentUseCase
} from \"@dlg-ngind/booking\";
import { composeBookingContext } from \"@dlg-ngind/booking\";

// Initialize the booking context
composeBookingContext();

// Bot conversation flow example
class BookingBot {
  private currentUserId: string | null = null;
  private currentUserInfo: any = null;
  private selectedTimeSlotId: string | null = null;

  async handleUserMessage(message: string, userId: string): Promise<string> {
    // Store current user
    this.currentUserId = userId;

    // Simple state machine for bot flow
    if (message.toLowerCase().includes(\"book\") || message.toLowerCase().includes(\"appointment\")) {
      return await this.startBookingFlow();
    } else if (message.toLowerCase().includes(\"cancel\")) {
      return await this.handleCancellation(message);
    } else {
      return \"I can help you book or cancel appointments. Say 'book appointment' to get started.\";
    }
  }

  private async startBookingFlow(): Promise<string> {
    // Step 1: Show available time slots
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Next 7 days
    
    try {
      const availableSlots = await getAvailableTimeSlotsUseCase({ startDate, endDate });
      
      if (availableSlots.length === 0) {
        return \"Sorry, there are no available time slots in the next 7 days. Please check back later.\";
      }

      let response = \"Here are the available time slots:
\";
      availableSlots.slice(0, 5).forEach((slot, index) => {
        response += `${index + 1}. ${slot.start.toLocaleString()} (${slot.duration} minutes)
`;
      });
      response += \"
Please provide your name, email, and phone number, and mention which slot you'd like to book (e.g., 'Slot 1: John Doe, john@example.com, +1234567890')\";

      return response;
    } catch (error) {
      return \"Sorry, I'm having trouble retrieving available time slots. Please try again later.\";
    }
  }

  async handleBookingDetails(details: string): Promise<string> {
    // Parse user details (simplified)
    const parts = details.split(\", \");
    if (parts.length < 3) {
      return \"Please provide your name, email, and phone number separated by commas.\";
    }

    const name = parts[0].trim();
    const email = parts[1].trim();
    const phone = parts[2].trim();

    // For a real implementation, you'd want to:
    // 1. Extract the selected slot number from the message
    // 2. Map that to an actual time slot ID
    // 3. Validate the email and phone format
    // 4. Store the user info for later use

    this.currentUserInfo = { name, email, phone };

    return \"Great! I have your details. Which time slot would you like to book? Please say the slot number (1-5).\";
  }

  async bookSelectedSlot(slotNumber: number): Promise<string> {
    if (!this.currentUserInfo) {
      return \"Please provide your details first.\";
    }

    // Get available slots again to ensure we have the latest data
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const availableSlots = await getAvailableTimeSlotsUseCase({ startDate, endDate });

    if (slotNumber < 1 || slotNumber > availableSlots.length) {
      return `Please select a valid slot number (1-${Math.min(5, availableSlots.length)}).`;
    }

    const selectedSlot = availableSlots[slotNumber - 1];

    try {
      const result = await scheduleAppointmentUseCase({
        timeSlotId: selectedSlot.id,
        contactInfo: this.currentUserInfo
      });

      // Reset user state
      this.currentUserInfo = null;
      this.selectedTimeSlotId = null;

      return `✅ Your appointment has been booked successfully!
Booking Reference: ${result.bookingReference}
Time: ${selectedSlot.start.toLocaleString()}

You will receive a confirmation email shortly.`;
    } catch (error) {
      if (error.message.includes(\"not available\")) {
        return \"Sorry, that time slot is no longer available. Please choose a different slot.\";
      }
      return \"Sorry, there was an error booking your appointment. Please try again.\";
    }
  }

  private async handleCancellation(message: string): Promise<string> {
    // Extract booking reference from message (simplified)
    const match = message.match(/([A-Z0-9]{2}-\d{8}-[A-Z0-9]{6})/);
    
    if (!match) {
      return \"Please provide your booking reference to cancel (e.g., 'cancel BK-20230101-ABC123').\";
    }

    const bookingReference = match[1];
    
    // In a real implementation, you would:
    // 1. Look up the appointment by booking reference
    // 2. Verify the user has permission to cancel
    // 3. Call cancelAppointmentUseCase with the appointment ID

    return \"To cancel your appointment, please contact support with your booking reference.\";
  }
}

// Example usage
const bot = new BookingBot();

// Simulate bot conversation
async function simulateConversation() {
  console.log(await bot.handleUserMessage(\"I'd like to book an appointment\", \"user123\"));
  // User would then provide details
  console.log(await bot.handleBookingDetails(\"John Doe, john@example.com, +1234567890\"));
  // User would then select a slot
  console.log(await bot.bookSelectedSlot(1));
}
```

## Web Application Integration Example

Here's how you might integrate the booking context with a web application:

```typescript
import { 
  getAvailableTimeSlotsUseCase, 
  scheduleAppointmentUseCase
} from \"@dlg-ngind/booking\";
import { composeBookingContext } from \"@dlg-ngind/booking\";

// Initialize the booking context
composeBookingContext();

// Web API controller example
class BookingController {
  // GET /api/availability?start=2023-01-01&end=2023-01-07
  async getAvailability(req: Request, res: Response) {
    try {
      const { start, end } = req.query;
      
      if (!start || !end) {
        return res.status(400).json({ error: \"Start and end dates are required\" });
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      const availableSlots = await getAvailableTimeSlotsUseCase({ 
        startDate, 
        endDate 
      });

      res.json({
        availableSlots: availableSlots.map(slot => ({
          id: slot.id,
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
          duration: slot.duration
        }))
      });
    } catch (error) {
      res.status(500).json({ error: \"Failed to retrieve availability\" });
    }
  }

  // POST /api/appointments
  async bookAppointment(req: Request, res: Response) {
    try {
      const { timeSlotId, contactInfo } = req.body;

      // Validate input
      if (!timeSlotId || !contactInfo) {
        return res.status(400).json({ error: \"Time slot ID and contact info are required\" });
      }

      const result = await scheduleAppointmentUseCase({
        timeSlotId,
        contactInfo
      });

      res.status(201).json({
        appointmentId: result.appointmentId,
        bookingReference: result.bookingReference,
        message: \"Appointment booked successfully\"
      });
    } catch (error) {
      if (error.message.includes(\"not found\")) {
        return res.status(404).json({ error: \"Time slot not found\" });
      }
      
      if (error.message.includes(\"not available\")) {
        return res.status(409).json({ error: \"Time slot is not available\" });
      }
      
      res.status(500).json({ error: \"Failed to book appointment\" });
    }
  }

  // DELETE /api/appointments/:id
  async cancelAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await cancelAppointmentUseCase({
        appointmentId: id
      });

      res.json({ message: \"Appointment cancelled successfully\" });
    } catch (error) {
      if (error.message.includes(\"not found\")) {
        return res.status(404).json({ error: \"Appointment not found\" });
      }
      
      if (error.message.includes(\"already cancelled\")) {
        return res.status(409).json({ error: \"Appointment is already cancelled\" });
      }
      
      res.status(500).json({ error: \"Failed to cancel appointment\" });
    }
  }
}

// Frontend React component example
import React, { useState, useEffect } from 'react';

const BookingForm = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [bookingResult, setBookingResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch('/api/availability?start=2023-01-01&end=2023-01-07');
      const data = await response.json();
      setAvailableSlots(data.availableSlots);
    } catch (error) {
      console.error('Failed to fetch availability', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeSlotId: selectedSlot,
          contactInfo: formData
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setBookingResult({
          success: true,
          message: `Appointment booked successfully! Your reference: ${result.bookingReference}`
        });
      } else {
        setBookingResult({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      setBookingResult({
        success: false,
        message: 'Failed to book appointment. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"booking-form\">
      <h2>Book an Appointment</h2>
      
      {bookingResult && (
        <div className={`alert ${bookingResult.success ? 'alert-success' : 'alert-error'}`}>
          {bookingResult.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className=\"form-group\">
          <label>Available Time Slots:</label>
          <select 
            value={selectedSlot} 
            onChange={(e) => setSelectedSlot(e.target.value)}
            required
          >
            <option value=\"\">Select a time slot</option>
            {availableSlots.map(slot => (
              <option key={slot.id} value={slot.id}>
                {new Date(slot.start).toLocaleString()} ({slot.duration} minutes)
              </option>
            ))}
          </select>
        </div>
        
        <div className=\"form-group\">
          <label>Name:</label>
          <input
            type=\"text\"
            name=\"name\"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className=\"form-group\">
          <label>Email:</label>
          <input
            type=\"email\"
            name=\"email\"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className=\"form-group\">
          <label>Phone:</label>
          <input
            type=\"tel\"
            name=\"phone\"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className=\"form-group\">
          <label>Company (optional):</label>
          <input
            type=\"text\"
            name=\"company\"
            value={formData.company}
            onChange={handleInputChange}
          />
        </div>
        
        <button type=\"submit\" disabled={loading}>
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
```

## Custom Adapter Implementation

Here's an example of how to implement custom adapters for production use:

```typescript
import { 
  findAppointmentByIdPort,
  saveAppointmentPort,
  findTimeSlotByIdPort,
  saveTimeSlotPort
} from \"@dlg-ngind/booking\";
import { setPortAdapter } from \"@maxdev1/sotajs\";

// Custom database adapter for appointments
class DatabaseAppointmentAdapter {
  async findById(id: string) {
    // Implementation using your database of choice
    // For example, with a SQL database:
    /*
    const result = await db.query(
      'SELECT * FROM appointments WHERE id = $1', 
      [id]
    );
    return result ? this.mapToDomain(result) : null;
    */
  }

  async save(appointment: any) {
    // Implementation for saving appointment
    /*
    await db.query(
      `INSERT INTO appointments (id, client_id, time_slot_id, ...) 
       VALUES ($1, $2, $3, ...) 
       ON CONFLICT (id) DO UPDATE SET ...`,
      [appointment.id, appointment.clientId, appointment.timeSlotId, ...]
    );
    */
  }

  private mapToDomain(dbRecord: any) {
    // Convert database record to domain object
    return {
      // Map fields from database to domain model
    };
  }
}

// Custom email adapter for notifications
class EmailNotificationAdapter {
  async sendAppointmentConfirmation(dto: any) {
    // Send email using your email service
    /*
    await emailService.send({
      to: dto.clientEmail,
      subject: 'Appointment Confirmation',
      template: 'appointment-confirmation',
      data: dto
    });
    */
  }

  async sendAppointmentCancellation(dto: any) {
    // Send cancellation email
    /*
    await emailService.send({
      to: dto.clientEmail,
      subject: 'Appointment Cancelled',
      template: 'appointment-cancellation',
      data: dto
    });
    */
  }
}

// Set up custom adapters
const appointmentAdapter = new DatabaseAppointmentAdapter();
const emailAdapter = new EmailNotificationAdapter();

setPortAdapter(findAppointmentByIdPort, appointmentAdapter.findById.bind(appointmentAdapter));
setPortAdapter(saveAppointmentPort, appointmentAdapter.save.bind(appointmentAdapter));
// ... set other adapters as needed
```

These examples demonstrate how the booking context can be integrated into various types of applications while maintaining clean separation of concerns and following the dependency inversion principle.