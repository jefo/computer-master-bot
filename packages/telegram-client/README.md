# @bot-machine/telegram-client

A lightweight, type-safe Telegram Bot API client for Bun, written in TypeScript.

## Features

- 🚀 Built with Bun for maximum performance
- 📝 Full TypeScript support with comprehensive type definitions
- 🔒 Type-safe API responses
- 🌐 Supports all core Telegram Bot API methods
- 📦 Lightweight and dependency-free
- 🛠️ Simple and intuitive API

## Installation

```bash
# Using bun
bun add @bot-machine/telegram-client

# Using npm
npm install @bot-machine/telegram-client

# Using yarn
yarn add @bot-machine/telegram-client
```

## Quick Start

```typescript
import { TelegramClient } from '@bot-machine/telegram-client';

// Initialize the client with your bot token
const client = new TelegramClient('YOUR_BOT_TOKEN');

// Get bot information
const me = await client.getMe();
console.log(`Hello, I'm ${me.first_name}!`);

// Send a message
const message = await client.sendMessage({
  chat_id: 123456789,
  text: 'Hello from TypeScript!'
});

console.log(`Message sent: ${message.text}`);
```

## API Reference

### TelegramClient

#### Constructor

```typescript
const client = new TelegramClient(token: string);
```

- `token` - Your Telegram Bot API token

#### Methods

##### `getMe()`

A simple method for testing your bot's authentication token. Returns basic information about the bot.

```typescript
const me = await client.getMe();
```

##### `sendMessage(params: SendMessageParams)`

Send text messages.

```typescript
const message = await client.sendMessage({
  chat_id: 123456789,
  text: 'Hello world!'
});
```

##### `getUpdates(params?: GetUpdatesParams)`

Receive incoming updates using long polling.

```typescript
const updates = await client.getUpdates({
  offset: 123456789,
  timeout: 30
});
```

## Error Handling

All API errors are thrown as `TelegramError` instances:

```typescript
import { TelegramClient, TelegramError } from '@bot-machine/telegram-client';

const client = new TelegramClient('YOUR_BOT_TOKEN');

try {
  const me = await client.getMe();
} catch (error) {
  if (error instanceof TelegramError) {
    console.error(`Telegram API Error: ${error.message}`);
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.