import { describe, it, expect, beforeEach } from "bun:test";
import { randomUUID } from "crypto";
import { setPortAdapter } from "@maxdev1/sotajs";
import {
	scheduleAppointmentUseCase,
	findOrCreateDailySchedulePort,
	saveDailySchedulePort,
	appointmentScheduledOutPort,
	timeSlotNotAvailableOutPort,
} from "../src/application/schedule-appointment.use-case";
import { DailySchedule } from "../src/domain/daily-schedule.aggregate";

// In-memory storage for schedules
const dailySchedules = new Map<string, DailySchedule>();

// --- Adapters ---

// In-memory Adapters
const findOrCreateDailyScheduleAdapter = async (
	date: string,
): Promise<DailySchedule> => {
	if (dailySchedules.has(date)) {
		return dailySchedules.get(date)!;
	}
	const newSchedule = DailySchedule.create({ id: date, appointments: [] });
	return newSchedule;
};

const saveDailyScheduleAdapter = async (
	schedule: DailySchedule,
): Promise<void> => {
	dailySchedules.set(schedule.state.id, schedule);
};

describe("ScheduleAppointmentUseCase - Integration", () => {
	let successOutput: any;
	let failureOutput: any;

	beforeEach(() => {
		// Clear in-memory data
		dailySchedules.clear();
		successOutput = null;
		failureOutput = null;

		// Set up DI container for the test
		setPortAdapter(
			findOrCreateDailySchedulePort,
			findOrCreateDailyScheduleAdapter,
		);
		setPortAdapter(saveDailySchedulePort, saveDailyScheduleAdapter);

		// Mock output ports to capture their calls
		setPortAdapter(appointmentScheduledOutPort, async (output) => {
			successOutput = output;
		});
		setPortAdapter(timeSlotNotAvailableOutPort, async (output) => {
			failureOutput = output;
		});
	});

	it("should schedule an appointment successfully when the slot is free", async () => {
		const clientId = randomUUID();
		const startTime = new Date("2025-10-10T10:00:00.000Z");

		const input = {
			clientId,
			startTime,
			durationInMinutes: 30,
		};

		await scheduleAppointmentUseCase(input);

		// Check that the success port was called
		expect(successOutput).not.toBeNull();
		expect(successOutput.clientId).toBe(clientId);
		expect(successOutput.startTime).toEqual(startTime);
		expect(failureOutput).toBeNull();

		// Verify the state was saved correctly
		const scheduleId = startTime.toISOString().split("T")[0];
		const savedSchedule = dailySchedules.get(scheduleId);
		expect(savedSchedule).toBeDefined();
		expect(savedSchedule!.state.appointments.length).toBe(1);
		expect(savedSchedule!.state.appointments[0].clientId).toBe(clientId);
	});

	it("should fail to schedule an appointment for the exact same time slot", async () => {
		const clientId1 = randomUUID();
		const clientId2 = randomUUID();
		const startTime = new Date("2025-10-10T11:00:00.000Z");

		// Book the first appointment
		await scheduleAppointmentUseCase({
			clientId: clientId1,
			startTime,
			durationInMinutes: 60,
		});

		// Reset outputs to check the second call
		successOutput = null;
		failureOutput = null;

		// Attempt to book the same slot again
		await scheduleAppointmentUseCase({
			clientId: clientId2,
			startTime,
			durationInMinutes: 60,
		});

		// Check that the failure port was called
		expect(failureOutput).not.toBeNull();
		expect(failureOutput.reason).toBe("Time slot is not available");
		expect(successOutput).toBeNull();

		// Verify that only the first appointment was saved
		const scheduleId = startTime.toISOString().split("T")[0];
		const savedSchedule = dailySchedules.get(scheduleId);
		expect(savedSchedule!.state.appointments.length).toBe(1);
	});

	it("should fail to schedule an overlapping appointment", async () => {
		const clientId1 = randomUUID();
		const clientId2 = randomUUID();
		const startTime1 = new Date("2025-10-10T14:00:00.000Z"); // 14:00 to 15:00
		const startTime2 = new Date("2025-10-10T14:30:00.000Z"); // 14:30 to 15:30 (overlaps)

		// Book the first appointment
		await scheduleAppointmentUseCase({
			clientId: clientId1,
			startTime: startTime1,
			durationInMinutes: 60,
		});

		// Reset outputs
		successOutput = null;
		failureOutput = null;

		// Attempt to book the overlapping appointment
		await scheduleAppointmentUseCase({
			clientId: clientId2,
			startTime: startTime2,
			durationInMinutes: 60,
		});

		// Check that the failure port was called
		expect(failureOutput).not.toBeNull();
		expect(failureOutput.reason).toBe("Time slot is not available");
		expect(successOutput).toBeNull();

		// Verify that only the first appointment was saved
		const scheduleId = startTime1.toISOString().split("T")[0];
		const savedSchedule = dailySchedules.get(scheduleId);
		expect(savedSchedule!.state.appointments.length).toBe(1);
	});
});
