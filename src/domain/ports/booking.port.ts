import { createPort } from '@maxdev1/sotajs';

// DTO для запроса бронирования
export type BookingRequestDto = {
  clientId: string;
  serviceId: string;
  serviceName: string;
  preferredDate: string; // ISO date string
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
};

// DTO для подтверждения бронирования
export type BookingConfirmationDto = {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  confirmedDate: string; // ISO date string
  confirmationCode: string;
};

// DTO для ошибки бронирования
export type BookingErrorDto = {
  serviceId: string;
  error: string;
  errorCode: 'TIME_SLOT_UNAVAILABLE' | 'SERVICE_UNAVAILABLE' | 'CLIENT_DATA_INVALID' | 'INTERNAL_ERROR';
};

// Порт для внешнего сервиса бронирования
export const bookServicePort = createPort<(dto: BookingRequestDto) => Promise<BookingConfirmationDto | BookingErrorDto>>();