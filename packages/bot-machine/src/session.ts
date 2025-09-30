
import type { AppContext, Middleware, ISessionStore } from './types';

/**
 * A simple in-memory session store that uses a `Map`.
 * This is the default store if no other is provided.
 * It is not recommended for production use as it will lose all data on restart.
 */
export class InMemorySessionStore implements ISessionStore {
  private readonly store = new Map<string, Record<string, any>>();

  /** @inheritdoc */
  async get(key: string): Promise<Record<string, any> | undefined> {
    return this.store.get(key);
  }

  /** @inheritdoc */
  async set(key: string, value: Record<string, any>): Promise<void> {
    this.store.set(key, value);
  }

  /** @inheritdoc */
  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

/**
 * Manages user sessions by connecting the bot to a session store.
 */
export class SessionManager {
  private readonly store: ISessionStore;

  /**
   * Creates a new SessionManager.
   * @param store An object that implements the `ISessionStore` interface. Defaults to `InMemorySessionStore`.
   */
  constructor(store?: ISessionStore) {
    this.store = store ?? new InMemorySessionStore();
  }

  /**
   * Returns the middleware function to be used by the router.
   * This middleware loads the session into `ctx.session` before handlers are executed
   * and saves the session after they have completed.
   */
  middleware(): Middleware {
    return async (ctx: AppContext, next: () => Promise<void>) => {
      const userId = ctx.from?.id;
      if (!userId) {
        // No user, no session. Useful for channel posts, etc.
        ctx.session = {};
        await next();
        return;
      }

      const key = userId.toString();
      ctx.session = (await this.store.get(key)) ?? {};

      await next();

      // Save session after all handlers have run.
      // If the session object is empty, delete it from the store.
      if (Object.keys(ctx.session).length === 0) {
        await this.store.delete(key);
      } else {
        await this.store.set(key, ctx.session);
      }
    };
  }
}
