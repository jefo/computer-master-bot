
import { MessagePayload } from "@bot-machine/telegram-sdk";

/**
 * Компонент для отображения сообщения об успешной оплате и отправки файла.
 * @param props - Объект с содержимым файла, полученный из getOvpnFileQuery.
 */
export async function ReceiveFileComponent(props: { fileContent: string }): Promise<MessagePayload> {

  // TODO: В будущем фреймворк должен поддерживать отправку файлов.
  // А пока отправляем содержимое файла в виде текста.

  const text = `
Оплата прошла успешно! ✅

Вот ваш конфигурационный файл. Скопируйте текст ниже и сохраните его в файл с расширением .ovpn

<code>
${props.fileContent}
</code>
  `;

  return {
    text: text,
    parse_mode: "HTML",
    // Убираем все кнопки
    reply_markup: {
      inline_keyboard: [],
    },
  };
}
