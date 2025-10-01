
import type { OrderDto } from "../domain/queries";
import { MessagePayload } from "@bot-machine/telegram-sdk";

/**
 * Компонент для отображения информации о заказе и кнопки оплаты.
 * @param props - Объект OrderDto, полученный из getOrderQuery.
 */
export async function PaymentComponent(props: OrderDto): Promise<MessagePayload> {
  const text = `
Вы выбрали: <b>${props.plan.name}</b>
Сумма к оплате: <b>$${props.plan.price}</b>

Нажмите кнопку ниже, чтобы перейти к оплате.
  `;

  const inline_keyboard = [[{
    text: "Оплатить 💳",
    // Эта callback_data будет обработана в onAction состояния 'payment'
    callback_data: "pay",
  }]];

  return {
    text: text,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard,
    },
  };
}
