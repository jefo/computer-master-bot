import { createPort, usePort } from '@maxdev1/sotajs';

// DTO для передачи данных о ценах
export type ServicePriceDto = {
  serviceName: string;
  price: number;
  description: string;
};

export type PricesOutputDto = {
  services: ServicePriceDto[];
  lastUpdated: string;
};

// Выходной порт для передачи данных о ценах
export const showPricesOutPort = createPort<(dto: PricesOutputDto) => Promise<void>>();

// Use case для отображения цен с жестко закодированными данными (YAGNI принцип)
export const showPricesUseCase = async (): Promise<void> => {
  const showPrices = usePort(showPricesOutPort);
  
  // Жестко закодированные данные о ценах (YAGNI)
  const pricesData: PricesOutputDto = {
    services: [
      {
        serviceName: "Диагностика компьютера",
        price: 500,
        description: "Бесплатная диагностика при ремонте"
      },
      {
        serviceName: "Замена термопасты",
        price: 300,
        description: "Замена термопасты процессора и видеокарты"
      },
      {
        serviceName: "Чистка компьютера",
        price: 800,
        description: "Полная чистка системы охлаждения"
      },
      {
        serviceName: "Установка Windows",
        price: 1000,
        description: "Установка операционной системы с драйверами"
      },
      {
        serviceName: "Восстановление данных",
        price: 1500,
        description: "Восстановление данных с HDD/SSD (до 100 ГБ)"
      }
    ],
    lastUpdated: new Date().toISOString()
  };

  await showPrices(pricesData);
};