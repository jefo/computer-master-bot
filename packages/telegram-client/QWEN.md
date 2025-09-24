# @computer-master/telegram-client Project Context

## Project Overview

This is a lightweight, type-safe Telegram Bot API client for Bun, written in TypeScript. The library provides a comprehensive interface to interact with the Telegram Bot API, allowing developers to build Telegram bots with full TypeScript support and type safety.

Key features:
- Built with Bun for maximum performance
- Full TypeScript support with comprehensive type definitions
- Type-safe API responses
- Supports all core Telegram Bot API methods
- Lightweight and dependency-free
- Simple and intuitive API

The project follows a modular architecture with clear separation of concerns:
- `index.ts`: Main entry point that exports the client and types
- `telegram-client.ts`: Main implementation of the Telegram client with all API methods
- `telegram-types.ts`: Complete type definitions for the entire Telegram Bot API
- `interfaces.ts`: Re-exports core interfaces for compatibility
- Test and example files for demonstration and verification

## Building and Running

### Commands
Based on the `package.json`:

- **Build**: `bun run build` (compiles TypeScript to JavaScript in the `dist` directory)
- **Development**: `bun run dev` (runs the index.ts file directly)
- **Test**: `bun test` (runs tests using Bun's test framework)
- **Example**: `bun run example` (runs the example implementation)
- **Prepublish**: Automatically runs build before publishing

### Project Structure
```
- dist/ (compiled output)
- example.ts (usage example)
- index.ts (main entry point)
- interfaces.ts (exported interfaces)
- telegram-client.ts (main client implementation)
- telegram-types.ts (complete type definitions)
- telegram-client.test.ts (test suite)
- test.ts (simple verification test)
```

## Development Conventions

### Code Style
- Written in TypeScript with strict type checking
- Uses modern ES2020+ syntax
- Follows standard TypeScript/JavaScript conventions
- Comprehensive type definitions for all Telegram API methods and responses

### Error Handling
- All API errors are thrown as `TelegramError` instances
- Network errors are wrapped in TelegramError
- Proper error handling with descriptive messages

### API Design
- Method names match Telegram Bot API methods
- Parameters are typed according to official API documentation
- Responses are properly typed based on API specification
- Consistent async/await pattern throughout

### Testing
- Uses Bun's built-in test framework (`bun:test`)
- Tests cover client initialization and core functionality
- Error handling is tested for edge cases
- Mock tokens are used for testing purposes

## Key Files and Functions

### telegram-client.ts
The core implementation with methods for:
- Authentication (`getMe()`)
- Message sending (`sendMessage()`)
- Media handling (`sendPhoto()`, `sendDocument()`, etc.)
- Location services (`sendLocation()`, `sendVenue()`)
- Chat management (`banChatMember()`, `unbanChatMember()`, etc.)
- Polls, games, and other advanced features
- Webhook management and updates polling

### telegram-types.ts
Comprehensive type definitions that match the official Telegram Bot API specification, including:
- All message types (text, media, location, contacts, etc.)
- Chat and user information
- Stickers, animations, and other media types
- Webhook and update types
- All API method parameters and responses

### Testing and Example Files
- `telegram-client.test.ts`: Comprehensive test suite
- `example.ts`: Example usage implementation
- `test.ts`: Basic functionality verification

## Dependencies and Environment

- Built for Bun runtime environment
- Uses native `fetch` for HTTP requests
- TypeScript 5.0+ as peer dependency
- Bun-types for type definitions
- No external dependencies for runtime (dependency-free)

## Usage Notes

When working with this project:
1. To use in a real bot, you'll need a valid Telegram bot token
2. All API methods return properly typed responses
3. Use the exported interfaces for type safety in your code
4. Error handling should account for both network errors and Telegram API errors
5. Methods support optional parameters as defined in the official Telegram Bot API documentation