
import { Keyboard } from "../keyboard";
import { message } from "../text";

export async function CounterComponent(props: { count: number, name: string }) {
  const keyboard = new Keyboard()
    .text('➖', 'decrement')
    .text('➕', 'increment')
    .row()
    .text('✏️ Переименовать', 'rename');

  const msg = message(({ b }) => [
    b(props.name), ": ", b(String(props.count))
  ]);

  return {
    ...msg,
    reply_markup: keyboard.inline(),
  };
}
