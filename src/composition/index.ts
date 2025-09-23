import { setPortAdapter, setPortAdapters } from '@maxdev1/sotajs';
import { bookServicePort } from '@domain/ports/booking.port';
import { bookingServiceAdapter } from '@infra/booking-system.adapter';
import { showPricesOutPort } from '@app/showPrices.usecase';
import { serviceBookedOutPort, serviceBookingFailedOutPort } from '@app/bookService.usecase';

// Адаптер для отображения цен (в реальном приложении может выводить в Telegram, консоль и т.д.)
const showPricesAdapter = async (dto: any) => {
  console.log('=== Прайс-лист компьютерного мастера ===');
  console.log(`Дата обновления: ${new Date(dto.lastUpdated).toLocaleString()}`);
  console.log('');
  
  dto.services.forEach((service: any, index: number) => {
    console.log(`${index + 1}. ${service.serviceName}`);
    console.log(`   Цена: ${service.price} руб.`);
    console.log(`   Описание: ${service.description}`);
    console.log('');
  });
};

// Адаптер для успешного бронирования - уведомление клиенту
const serviceBookedClientNotificationAdapter = async (dto: any) => {
  console.log('=== Уведомление клиенту ===');
  console.log('✅ Услуга успешно забронирована!');
  console.log(`Номер подтверждения: ${dto.confirmationCode}`);
  console.log(`Дата записи: ${new Date(dto.confirmedDate).toLocaleString()}`);
  console.log(`Услуга: ${dto.serviceName}`);
  console.log('');
};

// Адаптер для успешного бронирования - уведомление бизнесу
const serviceBookedBusinessNotificationAdapter = async (dto: any) => {
  console.log('=== Уведомление бизнесу ===');
  console.log('🔔 Новое бронирование!');
  console.log(`Номер подтверждения: ${dto.confirmationCode}`);
  console.log(`Клиент: ${dto.clientName}`);
  console.log(`Телефон: ${dto.clientPhone}`);
  console.log(`Email: ${dto.clientEmail || 'не указан'}`);
  console.log(`Услуга: ${dto.serviceName}`);
  console.log(`Дата записи: ${new Date(dto.confirmedDate).toLocaleString()}`);
  console.log('');
};

// Объединенный адаптер для успешного бронирования
const serviceBookedAdapter = async (dto: any) => {
  await serviceBookedClientNotificationAdapter(dto);
  await serviceBookedBusinessNotificationAdapter(dto);
};

// Адаптер для ошибок бронирования - уведомление клиенту
const serviceBookingFailedClientNotificationAdapter = async (dto: any) => {
  console.log('=== Уведомление клиенту ===');
  console.log('❌ Ошибка бронирования:');
  console.log(`Услуга ID: ${dto.serviceId}`);
  console.log(`Ошибка: ${dto.error}`);
  console.log(`Код ошибки: ${dto.errorCode}`);
  console.log('');
};

// Адаптер для ошибок бронирования - уведомление бизнесу
const serviceBookingFailedBusinessNotificationAdapter = async (dto: any) => {
  console.log('=== Уведомление бизнесу ===');
  console.log('⚠️ Ошибка бронирования:');
  console.log(`Услуга ID: ${dto.serviceId}`);
  console.log(`Ошибка: ${dto.error}`);
  console.log(`Код ошибки: ${dto.errorCode}`);
  console.log('');
};

// Объединенный адаптер для ошибок бронирования
const serviceBookingFailedAdapter = async (dto: any) => {
  await serviceBookingFailedClientNotificationAdapter(dto);
  await serviceBookingFailedBusinessNotificationAdapter(dto);
};

// Связывание портов с адаптерами
setPortAdapters([
  [bookServicePort, bookingServiceAdapter],
  [showPricesOutPort, showPricesAdapter],
  [serviceBookedOutPort, serviceBookedAdapter],
  [serviceBookingFailedOutPort, serviceBookingFailedAdapter]
]);

console.log('Ports and adapters successfully composed');
