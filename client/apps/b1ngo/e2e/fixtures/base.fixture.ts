import { test as base, expect, type Page, type BrowserContext } from '@playwright/test';
import { ApiHelper } from '../helpers/api.helper';

const API_BASE_URL = process.env['API_BASE_URL'] || 'https://localhost:7249';

export interface BaseFixtures {
  api: ApiHelper;
}

export const test = base.extend<BaseFixtures>({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      localStorage.setItem('bng-tutorial-completed', 'true');
      const style = document.createElement('style');
      style.textContent = 'app-tutorial { display: none !important; }';
      (document.head ?? document.documentElement).appendChild(style);
    });
    await use(page);
  },
  api: async ({ playwright }, use) => {
    const requestContext = await playwright.request.newContext({
      ignoreHTTPSErrors: true,
    });
    const api = new ApiHelper(requestContext, API_BASE_URL);
    await use(api);
    await requestContext.dispose();
  },
});

export async function dismissTutorial(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('bng-tutorial-completed', 'true');
  });
}

export async function navigateToRoom(
  page: Page,
  context: BrowserContext,
  roomId: string,
  playerId: string,
  playerToken: string,
): Promise<void> {
  await dismissTutorial(page);
  await context.addCookies([
    {
      name: 'PlayerToken',
      value: playerToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    },
  ]);

  await page.goto('/');
  await page.evaluate(
    ({ roomId, playerId, playerToken }) => {
      localStorage.setItem('bng-session', JSON.stringify({ roomId, playerId, playerToken }));
    },
    { roomId, playerId, playerToken },
  );

  await page.goto(`/room/${roomId}`);
}

export { expect };
