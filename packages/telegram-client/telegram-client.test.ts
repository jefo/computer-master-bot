// telegram-client.test.ts - Test suite for the Telegram client

import { describe, expect, it } from 'bun:test';
import { TelegramClient, TelegramError } from './index';

describe('TelegramClient', () => {
  const VALID_TOKEN = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
  
  it('should create a client with a valid token', () => {
    const client = new TelegramClient(VALID_TOKEN);
    expect(client).toBeInstanceOf(TelegramClient);
  });
  
  it('should throw an error without a token', () => {
    expect(() => new TelegramClient('')).toThrow('Telegram Bot Token is required');
    expect(() => new TelegramClient(undefined as any)).toThrow('Telegram Bot Token is required');
  });
  
  it('should have all required methods', () => {
    const client = new TelegramClient(VALID_TOKEN);
    expect(typeof client.getMe).toBe('function');
    expect(typeof client.sendMessage).toBe('function');
    expect(typeof client.getUpdates).toBe('function');
    expect(typeof client.answerCallbackQuery).toBe('function');
    expect(typeof client.editMessageText).toBe('function');
    expect(typeof client.editMessageReplyMarkup).toBe('function');
  });
});

describe('TelegramError', () => {
  it('should create a TelegramError with message and code', () => {
    const error = new TelegramError('Test error', 400);
    expect(error).toBeInstanceOf(TelegramError);
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(400);
    expect(error.name).toBe('TelegramError');
  });
  
  it('should create a TelegramError with just a message', () => {
    const error = new TelegramError('Test error');
    expect(error).toBeInstanceOf(TelegramError);
    expect(error.message).toBe('Test error');
    expect(error.code).toBeUndefined();
  });
});