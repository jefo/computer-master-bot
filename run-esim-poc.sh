#!/bin/bash

# Скрипт для запуска PoC-версии eSIM Travel бота
echo "Запуск PoC-версии eSIM Travel бота..."

# Проверяем, установлен ли Bun
if ! command -v bun &> /dev/null; then
    echo "Ошибка: Bun не найден. Пожалуйста, установите Bun."
    exit 1
fi

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo "Установка зависимостей..."
    bun install
fi

echo "Запуск бота..."
cd esim-bot
bun run dev