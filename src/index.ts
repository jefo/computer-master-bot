import './composition';
import { showPricesUseCase } from '@app/showPrices.usecase';
import { bookServiceUseCase } from '@app/bookService.usecase';

async function main() {
  console.log('=== Демонстрация работы бота компьютерного мастера ===\n');
  
  // Демонстрация отображения цен
  console.log('1. Отображение прайс-листа:');
  await showPricesUseCase();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Демонстрация успешного бронирования
  console.log('2. Попытка бронирования услуги:');
  await bookServiceUseCase({
    clientId: 'client-001',
    serviceId: 'time-slot-001', // Используем ID временного слота
    serviceName: 'Диагностика компьютера',
    preferredDate: new Date().toISOString(),
    clientName: 'Иван Иванов',
    clientPhone: '+7(999)123-45-67',
    clientEmail: 'ivan@example.com'
  });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Демонстрация ошибки бронирования (недоступное время)
  console.log('3. Попытка бронирования с некорректными данными:');
  await bookServiceUseCase({
    clientId: 'client-002',
    serviceId: 'invalid-time-slot', // Несуществующий ID временного слота
    serviceName: 'Замена термопасты',
    preferredDate: new Date().toISOString(),
    clientName: 'Петр Петров',
    clientPhone: '+7(999)765-43-21'
  });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Демонстрация ошибки бронирования (недостаточно данных)
  console.log('4. Попытка бронирования с недостаточными данными:');
  await bookServiceUseCase({
    clientId: 'client-003',
    serviceId: 'time-slot-002',
    serviceName: 'Чистка компьютера',
    preferredDate: new Date().toISOString(),
    clientName: '', // Пустое имя
    clientPhone: '+7(999)111-22-33'
  });
}

main().catch(console.error);