
import type { OrderDto } from "./queries";

// --- Mocked Commands ---

/**
 * Команда для создания нового заказа.
 * @param ctx - Контекст, содержащий параметры (ID плана) и сессию.
 */
export async function createOrderCommand(ctx: any): Promise<OrderDto> {
  const planId = parseInt(ctx.params[0], 10); // ctx.params[0] будет извлечен из 'select_plan:(.+)'
  console.log(`Executing command: createOrderCommand with planId: ${planId}`);

  // В реальном приложении мы бы создали запись в базе данных.
  // Здесь мы просто сохраняем ID плана в сессию для последующего использования.
  ctx.session.planId = planId;

  const mockOrder: OrderDto = {
    id: Date.now(), // Генерируем временный ID
    plan: { id: planId, name: "Загрузка...", price: 0 }, // Детали плана загрузятся в onEnter следующего шага
    status: "pending",
  };

  return mockOrder;
}

/**
 * Команда для обработки (имитации) платежа.
 * @param ctx - Контекст, содержащий сессию.
 */
export async function processPaymentCommand(ctx: any): Promise<{ success: boolean }> {
  console.log(`Executing command: processPaymentCommand for order related to planId: ${ctx.session.planId}`);

  // Здесь была бы интеграция с платежной системой.
  // Мы просто считаем, что оплата прошла успешно.

  return { success: true };
}
