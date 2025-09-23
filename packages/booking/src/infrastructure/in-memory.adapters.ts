// --- In-Memory Data Stores ---

import type { Appointment, Client, TimeSlot } from "../domain";

export const appointments = new Map<string, Appointment>();
export const timeSlots = new Map<string, TimeSlot>();
export const clients = new Map<string, Client>();

// --- Data Port Adapters ---

export const inMemoryFindAppointmentByIdAdapter = async (
	id: string,
): Promise<Appointment | null> => {
	return appointments.get(id) || null;
};

export const inMemoryFindAppointmentsByClientAdapter = async (
	clientId: string,
): Promise<Appointment[]> => {
	return Array.from(appointments.values()).filter(
		(appointment) => appointment.state.clientId === clientId,
	);
};

export const inMemoryFindAvailableTimeSlotsAdapter = async (
	startDate: Date,
	endDate: Date,
): Promise<TimeSlot[]> => {
	return Array.from(timeSlots.values()).filter((slot) => {
		const slotStart = slot.state.start;
		const slotEnd = slot.state.end;
		return slotStart >= startDate && slotEnd <= endDate;
	});
};

export const inMemoryFindTimeSlotByIdAdapter = async (
	id: string,
): Promise<TimeSlot | null> => {
	return timeSlots.get(id) || null;
};

export const inMemoryFindClientByEmailAdapter = async (
	email: string,
): Promise<Client | null> => {
	for (const client of clients.values()) {
		if (client.state.email === email) {
			return client;
		}
	}
	return null;
};

export const inMemoryFindClientByIdAdapter = async (
	id: string,
): Promise<Client | null> => {
	return clients.get(id) || null;
};

export const inMemorySaveAppointmentAdapter = async (
	appointment: Appointment,
): Promise<void> => {
	appointments.set(appointment.state.id, appointment);
};

export const inMemorySaveTimeSlotAdapter = async (
	timeSlot: TimeSlot,
): Promise<void> => {
	timeSlots.set(timeSlot.state.id, timeSlot);
};

export const inMemorySaveClientAdapter = async (
	client: Client,
): Promise<void> => {
	clients.set(client.state.id, client);
};

// --- Output Port Adapters (Console Logging) ---

export const consoleAppointmentConfirmedAdapter = async (
	dto: any,
): Promise<void> => {
	console.log("--- APPOINTMENT CONFIRMED ---");
	console.log(`Appointment ID: ${dto.appointmentId}`);
	console.log(`Client: ${dto.clientName} (${dto.clientEmail})`);
	console.log(`Time: ${dto.timeSlot.start} - ${dto.timeSlot.end}`);
	console.log(`Booking Reference: ${dto.bookingReference}`);
	console.log("-----------------------------");
};

export const consoleAppointmentReminderAdapter = async (
	dto: any,
): Promise<void> => {
	console.log("--- APPOINTMENT REMINDER ---");
	console.log(`Appointment ID: ${dto.appointmentId}`);
	console.log(`Client: ${dto.clientName} (${dto.clientEmail})`);
	console.log(`Time: ${dto.timeSlot.start} - ${dto.timeSlot.end}`);
	console.log(`Booking Reference: ${dto.bookingReference}`);
	console.log("---------------------------");
};

export const consoleAppointmentCancelledAdapter = async (
	dto: any,
): Promise<void> => {
	console.log("--- APPOINTMENT CANCELLED ---");
	console.log(`Appointment ID: ${dto.appointmentId}`);
	console.log(`Client: ${dto.clientName} (${dto.clientEmail})`);
	console.log("-----------------------------");
};
