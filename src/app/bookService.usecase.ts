import { z } from 'zod';
import { usePort, createPort } from '@maxdev1/sotajs';
import { bookServicePort, BookingRequestDto, BookingConfirmationDto, BookingErrorDto } from '@domain/ports/booking.port';

// Входные данные для use case
const BookServiceInputSchema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1),
  serviceName: z.string().min(1),
  preferredDate: z.string().datetime(),
  clientName: z.string().min(1),
  clientPhone: z.string().min(1),
  clientEmail: z.string().email().optional(),
});

type BookServiceInput = z.infer<typeof BookServiceInputSchema>;

// Выходные порты
export const serviceBookedOutPort = createPort<(dto: BookingConfirmationDto) => Promise<void>>();
export const serviceBookingFailedOutPort = createPort<(dto: BookingErrorDto) => Promise<void>>();

// Use case для бронирования услуги
export const bookServiceUseCase = async (input: BookServiceInput): Promise<void> => {
  const command = BookServiceInputSchema.parse(input);
  
  // Получаем зависимости
  const bookService = usePort(bookServicePort);
  const serviceBooked = usePort(serviceBookedOutPort);
  const serviceBookingFailed = usePort(serviceBookingFailedOutPort);
  
  // Подготавливаем данные для внешнего сервиса
  const bookingRequest: BookingRequestDto = {
    clientId: command.clientId,
    serviceId: command.serviceId,
    serviceName: command.serviceName,
    preferredDate: command.preferredDate,
    clientName: command.clientName,
    clientPhone: command.clientPhone,
    clientEmail: command.clientEmail
  };
  
  try {
    // Вызываем внешний сервис бронирования
    const result = await bookService(bookingRequest);
    
    // Проверяем тип результата
    if ('bookingId' in result) {
      // Успешное бронирование
      await serviceBooked(result);
    } else {
      // Ошибка бронирования
      await serviceBookingFailed(result);
    }
  } catch (error: any) {
    // Непредвиденная ошибка
    await serviceBookingFailed({
      serviceId: command.serviceId,
      error: error.message || 'Неизвестная ошибка при бронировании',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};