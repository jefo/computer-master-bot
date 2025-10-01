
// Этот файл имитирует запросы к базе данных или внешним сервисам.

// DTO - Data Transfer Objects
// Это структуры данных, которые мы передаем между слоями приложения.
export interface PlanDto {
  id: number;
  name: string;
  price: number;
}

export interface OrderDto {
  id: number;
  plan: PlanDto;
  status: 'pending' | 'paid';
}

// --- Mocked Queries ---

/**
 * Запрос для получения списка всех доступных тарифных планов.
 */
export async function getPlansQuery(): Promise<PlanDto[]> {
  console.log('Executing query: getPlansQuery');
  // В реальном приложении здесь был бы запрос к базе данных.
  return [
    { id: 1, name: '1 месяц', price: 10 },
    { id: 2, name: '6 месяцев', price: 50 },
    { id: 3, name: '1 год', price: 90 },
  ];
}

/**
 * Запрос для получения информации о конкретном заказе.
 * @param ctx - Контекст, из которого можно взять ID заказа (предполагается, что он сохранился в сессии)
 */
export async function getOrderQuery(ctx: any): Promise<OrderDto> {
    console.log('Executing query: getOrderQuery');
    // В реальном приложении мы бы искали заказ по ID из сессии
    const mockOrder: OrderDto = {
        id: 123,
        plan: { id: ctx.session.planId, name: 'Выбранный план', price: 50 },
        status: 'pending'
    };
    return mockOrder;
}

/**
 * Запрос для получения содержимого .ovpn файла для оплаченного заказа.
 */
export async function getOvpnFileQuery(ctx: any): Promise<{ fileContent: string }> {
    console.log('Executing query: getOvpnFileQuery');
    // Здесь была бы логика генерации или получения файла
    const mockFileContent = `
client
dev tun
proto udp
remote your-vpn-server.com 1194
resolv-retry infinite
... (и так далее)
`;
    return { fileContent: mockFileContent };
}
