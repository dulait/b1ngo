import { test as baseTest, type Page, type BrowserContext } from '@playwright/test';
import { ApiHelper } from '../helpers/api.helper';
import { navigateToRoom } from './base.fixture';

const API_BASE_URL = process.env['API_BASE_URL'] || 'https://localhost:7249';

export interface MultiPlayerFixtures {
  api: ApiHelper;
  createPlayerPage: (
    roomId: string,
    playerId: string,
    playerToken: string,
  ) => Promise<{ page: Page; context: BrowserContext }>;
}

export const multiPlayerTest = baseTest.extend<MultiPlayerFixtures>({
  api: async ({ playwright }, use) => {
    const requestContext = await playwright.request.newContext({
      ignoreHTTPSErrors: true,
    });
    const api = new ApiHelper(requestContext, API_BASE_URL);
    await use(api);
    await requestContext.dispose();
  },

  createPlayerPage: async ({ browser }, use) => {
    const contexts: BrowserContext[] = [];

    const factory = async (roomId: string, playerId: string, playerToken: string) => {
      const context = await browser.newContext({ ignoreHTTPSErrors: true });
      contexts.push(context);
      const page = await context.newPage();
      await navigateToRoom(page, context, roomId, playerId, playerToken);
      return { page, context };
    };

    await use(factory);

    for (const ctx of contexts) {
      await ctx.close();
    }
  },
});

export { expect } from '@playwright/test';
