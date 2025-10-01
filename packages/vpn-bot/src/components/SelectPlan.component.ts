
import type { PlanDto } from "../domain/queries";
import { MessagePayload } from "@bot-machine/telegram-sdk";

/**
 * Компонент для отображения списка тарифных планов.
 * @param props - Массив объектов PlanDto, полученный из getPlansQuery.
 */
export async function SelectPlanComponent(props: PlanDto[]): Promise<MessagePayload> {
  const text = "Пожалуйста, выберите тарифный план:";

  // Создаем инлайн-кнопки для каждого плана
  const inline_keyboard = props.map(plan => [
    {
      text: `${plan.name} - $${plan.price}`,
      // callback_data будет обработан в onAction нашего флоу
      callback_data: `select_plan:${plan.id}`,
    },
  ]);

  return {
    text: text,
    reply_markup: {
      inline_keyboard,
    },
  };
}
