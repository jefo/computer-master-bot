import { BookingRequestDto, BookingConfirmationDto, BookingErrorDto } from '@domain/ports/booking.port';

// Простой адаптер для демонстрации работы с внешним сервисом бронирования
// В реальном приложении здесь будет HTTP-клиент или другой способ связи с внешним API
export const bookingServiceAdapter = async (dto: BookingRequestDto): Promise<BookingConfirmationDto | BookingErrorDto> => {
  // Имитация проверки доступности времени
  const preferredDate = new Date(dto.preferredDate);
  const preferredHour = preferredDate.getHours();
  
  // Предположим, что время до 10:00 и после 18:00 недоступно
  if (preferredHour < 10 || preferredHour >= 18) {
    return {
      serviceId: dto.serviceId,
      error: 'Выбранное время недоступно. Рабочие часы: 10:00-18:00',
      errorCode: 'TIME_SLOT_UNAVAILABLE'
    };
  }
  
  // Имитация проверки доступности сервиса
  // Некоторые сервисы могут быть временно недоступны
  const unavailableServices = ['service-003', 'service-005'];
  if (unavailableServices.includes(dto.serviceId)) {
    return {
      serviceId: dto.serviceId,
      error: 'Услуга временно недоступна',
      errorCode: 'SERVICE_UNAVAILABLE'
    };
  }
  
  // Имитация проверки данных клиента
  if (!dto.clientName || !dto.clientPhone) {
    return {
      serviceId: dto.serviceId,
      error: 'Необходимо указать имя и телефон клиента',
      errorCode: 'CLIENT_DATA_INVALID'
    };
  }
  
  // Если все проверки пройдены, создаем подтверждение бронирования
  // В реальном приложении здесь будет вызов внешнего API
  return {
    bookingId: `booking-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    serviceId: dto.serviceId,
    serviceName: dto.serviceName,
    confirmedDate: dto.preferredDate,
    confirmationCode: `CONF-${Math.floor(Math.random() * 1000000)}`
  };
};