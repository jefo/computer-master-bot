import { scheduleAppointmentUseCase } from "@booking/application";
import { composeBookingContext } from "@booking/composition";
import { TimeSlot } from "@booking/domain";
import { timeSlots } from "@booking/infrastructure";
import { randomUUID } from "crypto";

// Экспортируем адаптер для бронирования
export const bookingServiceAdapter = async (dto: any): Promise<any> => {
	try {
		// Преобразуем входные данные в формат системы бронирования
		const result = await scheduleAppointmentUseCase({
			timeSlotId: dto.serviceId, // Временно используем serviceId как timeSlotId
			contactInfo: {
				name: dto.clientName,
				email: dto.clientEmail,
				phone: dto.clientPhone,
				company: "", // Компания не используется в нашем случае
			},
		});

		// Возвращаем успешный результат
		return {
			bookingId: result.appointmentId,
			serviceId: dto.serviceId,
			serviceName: dto.serviceName,
			confirmedDate: new Date().toISOString(), // Временно используем текущую дату
			confirmationCode: result.bookingReference,
		};
	} catch (error: any) {
		// Определяем тип ошибки и возвращаем соответствующий результат
		if (error.message.includes("not found")) {
			return {
				serviceId: dto.serviceId,
				error: "Выбранное время недоступно",
				errorCode: "TIME_SLOT_UNAVAILABLE",
			};
		} else if (error.message.includes("available")) {
			return {
				serviceId: dto.serviceId,
				error: "Выбранное время недоступно",
				errorCode: "TIME_SLOT_UNAVAILABLE",
			};
		} else if (error.message.includes("ContactInfo")) {
			return {
				serviceId: dto.serviceId,
				error: "Некорректные контактные данные",
				errorCode: "CLIENT_DATA_INVALID",
			};
		} else {
			return {
				serviceId: dto.serviceId,
				error: error.message || "Неизвестная ошибка при бронировании",
				errorCode: "INTERNAL_ERROR",
			};
		}
	}
};

// Инициализируем контекст бронирования и создаем временные слоты после импорта
setTimeout(() => {
	// Инициализируем контекст бронирования
	composeBookingContext();

	// Создаем несколько тестовых временных слотов
	const createInitialTimeSlots = () => {
		const now = new Date();

		// Создаем временные слоты на ближайшие 7 дней
		for (let i = 1; i <= 7; i++) {
			// Рабочие часы: 10:00 - 18:00
			for (let hour = 10; hour < 18; hour += 2) {
				// Каждые 2 часа
				const start = new Date(now);
				start.setDate(start.getDate() + i);
				start.setHours(hour, 0, 0, 0);

				const end = new Date(start);
				end.setHours(hour + 2, 0, 0, 0); // 2-часовые слоты

				const timeSlot = TimeSlot.create({
					id: randomUUID(),
					start,
					end,
					available: true,
				});

				timeSlots.set(timeSlot.state.id, timeSlot);
			}
		}
	};

	// Создаем начальные временные слоты
	createInitialTimeSlots();
}, 0);
