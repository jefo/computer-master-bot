import { Keyboard } from "../keyboard";
import { message } from "../text";

export async function RenameComponent(props: { name: string }) {
  const keyboard = new Keyboard()
    .text('⬅️ Назад', 'back');

  const msg = message(({ b, n }) => [
    "Текущее имя: ", b(props.name),
    n(2),
    "Введите новое имя:"
  ]);

  return {
    ...msg,
    reply_markup: keyboard.inline(),
  };
}
