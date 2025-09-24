# Bot UI Message Mockups

This document outlines the visual design and content for all user-facing messages in the Computer Master Bot, including emojis and MarkdownV2 formatting.

---

## 1. Welcome Message (`/start` command)

**User Input:** `/start`

**Bot Message 1 (Reply Keyboard):**
```
👋 Привет! Я ваш личный помощник компьютерного мастера.
✨ Статус мастера: *свободен*
💻 Готов помочь с диагностикой, ремонтом и настройкой вашего ПК.
```
**Bot Message 2 (Inline Keyboard):**
```
🚨 Если вам нужна экстренная помощь, нажмите кнопку ниже:
[ 🆘 Экстренная помощь ]
```

---

## 2. Services and Prices (`Услуги и Цены` / `/prices` command)

**User Input:** `Услуги и Цены` or `/prices`

**Bot Message:**
```
🛠️ *Наши услуги:*

*Диагностика компьютера* \- 500 руб
_Полная проверка всех компонентов_

*Установка Windows* \- 1500 руб
_Установка и настройка ОС Windows_

*Чистка от пыли* \- 1000 руб
_Полная чистка системы охланения_
```

---

## 3. Book an Appointment (Initial - Select Service)

**User Input:** `Записаться на Прием` or `/book`

**Bot Message:**
```
🗓️ Отлично! Чтобы записаться на прием, пожалуйста, выберите интересующую вас услугу:
[ Диагностика компьютера ]
[ Установка Windows ]
[ Чистка от пыли ]
[ Отмена ]
```

---

## 4. Emergency Help (Initial - Select Problems)

**User Input:** Click `🆘 Экстренная помощь`

**Bot Message:**
```
🚨 Мастер свяжется с вами в ближайшее время, укажите вашу проблему:
[ 🖥️ Компьютер не включается ]
[ 💀 Синий экран смерти ]
[ 🐌 Вирусы / Медленная работа ]
[ 🌐 Нет интернета ]
[ ❓ Другая проблема ]
[ Далее ]
[ Отмена ]
```

---

## 5. Cancellation Message

**User Input:** Click `Отмена`

**Bot Message:**
```
❌ Запись отменена. Вы можете начать заново, отправив /start.
```
**Bot Message 2 (Reply Keyboard):**
```
Чем еще могу помочь?
```

---

## 6. Unknown Command Message

**User Input:** Any unrecognized text

**Bot Message:**
```
🤔 Извините, я не понял вашу команду.
Пожалуйста, воспользуйтесь кнопками меню или отправьте /start, чтобы увидеть доступные опции.
```

---
