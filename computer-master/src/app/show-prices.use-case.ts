// DTO для элемента прайс-листа
export interface PriceItemDto {
  id: string;
  name: string;
  price: number;
  description: string;
}

// Use Case
export const showPricesUseCase = async (): Promise<PriceItemDto[]> => {
  // Хардкодим прайс-лист внутри use case
  const priceList: PriceItemDto[] = [
    {
      id: '1',
      name: 'Диагностика компьютера',
      price: 500,
      description: 'Полная проверка всех компонентов'
    },
    {
      id: '2',
      name: 'Установка Windows',
      price: 1500,
      description: 'Установка и настройка ОС Windows'
    },
    {
      id: '3',
      name: 'Чистка от пыли',
      price: 1000,
      description: 'Полная чистка системы охлаждения'
    }
  ];

  return priceList;
};
