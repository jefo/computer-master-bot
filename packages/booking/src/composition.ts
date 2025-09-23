import { setPortAdapter, resetDI } from "@maxdev1/sotajs";
import {
	// Data ports
	findAppointmentByIdPort,
	findAppointmentsByClientPort,
	findAvailableTimeSlotsPort,
	findTimeSlotByIdPort,
	findClientByEmailPort,
	findClientByIdPort,
	saveAppointmentPort,
	saveTimeSlotPort,
	saveClientPort,
	// Output ports
	appointmentConfirmedOutPort,
	appointmentReminderOutPort,
	appointmentCancelledOutPort,
} from "./application/ports";
import {
	// Adapters
	inMemoryFindAppointmentByIdAdapter,
	inMemoryFindAppointmentsByClientAdapter,
	inMemoryFindAvailableTimeSlotsAdapter,
	inMemoryFindTimeSlotByIdAdapter,
	inMemoryFindClientByEmailAdapter,
	inMemoryFindClientByIdAdapter,
	inMemorySaveAppointmentAdapter,
	inMemorySaveTimeSlotAdapter,
	inMemorySaveClientAdapter,
	consoleAppointmentConfirmedAdapter,
	consoleAppointmentReminderAdapter,
	consoleAppointmentCancelledAdapter,
} from "./infrastructure/in-memory.adapters";

/**
 * Composition root for the Booking context.
 * Binds ports to their concrete adapters.
 */
export const composeBookingContext = () => {
	// Bind data ports to in-memory adapters
	setPortAdapter(findAppointmentByIdPort, inMemoryFindAppointmentByIdAdapter);
	setPortAdapter(
		findAppointmentsByClientPort,
		inMemoryFindAppointmentsByClientAdapter,
	);
	setPortAdapter(
		findAvailableTimeSlotsPort,
		inMemoryFindAvailableTimeSlotsAdapter,
	);
	setPortAdapter(findTimeSlotByIdPort, inMemoryFindTimeSlotByIdAdapter);
	setPortAdapter(findClientByEmailPort, inMemoryFindClientByEmailAdapter);
	setPortAdapter(findClientByIdPort, inMemoryFindClientByIdAdapter);
	setPortAdapter(saveAppointmentPort, inMemorySaveAppointmentAdapter);
	setPortAdapter(saveTimeSlotPort, inMemorySaveTimeSlotAdapter);
	setPortAdapter(saveClientPort, inMemorySaveClientAdapter);

	// Bind output ports to console adapters
	setPortAdapter(
		appointmentConfirmedOutPort,
		consoleAppointmentConfirmedAdapter,
	);
	setPortAdapter(appointmentReminderOutPort, consoleAppointmentReminderAdapter);
	setPortAdapter(
		appointmentCancelledOutPort,
		consoleAppointmentCancelledAdapter,
	);
};
