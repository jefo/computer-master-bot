
import { describe, test, expect, beforeEach } from 'bun:test';
import { getCounterQuery, incrementCounterCommand, decrementCounterCommand, renameCounterCommand } from './counter';
import type { AppContext } from '../types';

// Mock AppContext for testing
let mockCtx: AppContext;

describe('Counter Core Logic', () => {

  beforeEach(() => {
    // Reset the mock context before each test
    mockCtx = {
      session: {},
    } as AppContext;
  });

  // 1. Tests for getCounterQuery
  describe('getCounterQuery', () => {
    test('should return default state when session is empty', async () => {
      const result = await getCounterQuery.execute(undefined, mockCtx);
      expect(result).toEqual({ name: 'Счетчик', count: 0 });
    });

    test('should return state from session when it exists', async () => {
      mockCtx.session.counterName = 'My Counter';
      mockCtx.session.counterValue = 42;
      const result = await getCounterQuery.execute(undefined, mockCtx);
      expect(result).toEqual({ name: 'My Counter', count: 42 });
    });
  });

  // 2. Tests for incrementCounterCommand
  describe('incrementCounterCommand', () => {
    test('should increment count from 0 to 1', async () => {
      await incrementCounterCommand.execute(undefined, mockCtx);
      expect(mockCtx.session.counterValue).toBe(1);
    });

    test('should increment count from an existing value', async () => {
      mockCtx.session.counterValue = 5;
      await incrementCounterCommand.execute(undefined, mockCtx);
      expect(mockCtx.session.counterValue).toBe(6);
    });
  });

  // 3. Tests for decrementCounterCommand
  describe('decrementCounterCommand', () => {
    test('should decrement count from 0 to -1', async () => {
      await decrementCounterCommand.execute(undefined, mockCtx);
      expect(mockCtx.session.counterValue).toBe(-1);
    });
  });

  // 4. Tests for renameCounterCommand
  describe('renameCounterCommand', () => {
    test('should update the counter name in the session', async () => {
      const input = { newName: 'New Awesome Counter' };
      await renameCounterCommand.execute(input, mockCtx);
      expect(mockCtx.session.counterName).toBe('New Awesome Counter');
    });

    test('should return the new state after renaming', async () => {
      const input = { newName: 'New Name' };
      mockCtx.session.counterValue = 10;
      const result = await renameCounterCommand.execute(input, mockCtx);
      expect(result).toEqual({ name: 'New Name', count: 10 });
    });

    test('should throw a Zod validation error for invalid input', async () => {
      const invalidInput = { newName: '' }; // Empty string is invalid
      
      // We expect the Zod schema parsing within the command to throw
      const execution = () => renameCounterCommand.input.parse(invalidInput);

      expect(execution).toThrow(); // Bun's test runner uses Jest-like `toThrow`
    });
  });
});
