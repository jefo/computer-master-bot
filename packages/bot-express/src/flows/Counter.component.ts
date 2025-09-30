
import type { MessagePayload } from "../types";

export async function CounterComponent(props: { count: number }): Promise<MessagePayload> {
  return {
    text: `Текущее значение: <b>${props.count}</b>`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[
        { text: '➖', callback_data: 'decrement' },
        { text: '➕', callback_data: 'increment' },
      ]],
    },
  };
}
