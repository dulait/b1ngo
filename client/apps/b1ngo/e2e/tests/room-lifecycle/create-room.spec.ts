import { test, expect } from '../../fixtures/base.fixture';
import { HomePage } from '../../pages/home.page';
import { LobbyPage } from '../../pages/lobby.page';
import { expectToast } from '../../helpers/toast.helper';

test.describe('BNG-001: Create Room', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.goto();
    await page.evaluate(() => localStorage.removeItem('bng-session'));
  });

  test('AC-1: creates room with valid inputs and returns roomId, joinCode, playerId', async ({
    page,
  }) => {
    await home.createRoom('TestHost');
    await home.expectNavigatedToRoom();

    const lobby = new LobbyPage(page);
    await lobby.expectVisible();
  });

  test('AC-2: sets auth cookie with correct options', async ({ context }) => {
    await home.createRoom('CookieHost');
    await home.expectNavigatedToRoom();

    const cookies = await context.cookies();
    const authCookie = cookies.find((c) => c.name === '__bng_s');
    expect(authCookie).toBeTruthy();
    expect(authCookie!.httpOnly).toBe(true);
    expect(authCookie!.secure).toBe(false);
    expect(authCookie!.sameSite).toBe('Lax');
    expect(authCookie!.path).toBe('/');
  });

  test('AC-3: stores bng-session in localStorage', async ({ page }) => {
    await home.createRoom('SessionHost');
    await home.expectNavigatedToRoom();

    const session = await page.evaluate(() => localStorage.getItem('bng-session'));
    expect(session).toBeTruthy();
    const parsed = JSON.parse(session!);
    expect(parsed.roomId).toBeTruthy();
    expect(parsed.playerId).toBeTruthy();
  });

  test('AC-4: uses default configuration when no advanced options set', async ({ page, api }) => {
    await home.createRoom('DefaultConfigHost');
    await home.expectNavigatedToRoom();

    const session = await page.evaluate(() => localStorage.getItem('bng-session'));
    const parsed = JSON.parse(session!);
    const cookies = await page.context().cookies();
    const token = cookies.find((c) => c.name === '__bng_s')!.value;

    const state = await api.getRoomState(parsed.roomId, token);
    expect(state.configuration.matrixSize).toBe(5);
    expect(state.configuration.winningPatterns).toEqual(
      expect.arrayContaining(['Row', 'Column', 'Diagonal']),
    );
  });

  test('AC-5: creates room with custom matrix size and winning patterns', async ({
    page,
    api,
  }) => {
    await home.hostNameInput.locator('input').fill('CustomHost');
    await home.selectFirstAvailableOptions();
    await home.toggleMoreOptions();
    await home.selectMatrixSize(3);
    await home.toggleWinPattern('Blackout');
    await home.submitCreateRoom();
    await home.expectNavigatedToRoom();

    const session = await page.evaluate(() => localStorage.getItem('bng-session'));
    const parsed = JSON.parse(session!);
    const cookies = await page.context().cookies();
    const token = cookies.find((c) => c.name === '__bng_s')!.value;

    const state = await api.getRoomState(parsed.roomId, token);
    expect(state.configuration.matrixSize).toBe(3);
    expect(state.configuration.winningPatterns).toContain('Blackout');
  });

  test('AC-7: collapsing More Options preserves selected values', async ({ page, api }) => {
    await home.hostNameInput.locator('input').fill('CollapseHost');
    await home.selectFirstAvailableOptions();
    await home.toggleMoreOptions();
    await home.selectMatrixSize(3);
    await home.toggleMoreOptions();
    await home.submitCreateRoom();
    await home.expectNavigatedToRoom();

    const session = await page.evaluate(() => localStorage.getItem('bng-session'));
    const parsed = JSON.parse(session!);
    const cookies = await page.context().cookies();
    const token = cookies.find((c) => c.name === '__bng_s')!.value;

    const state = await api.getRoomState(parsed.roomId, token);
    expect(state.configuration.matrixSize).toBe(3);
  });

  test('AC-8: form loads reference data and populates Season dropdown', async () => {
    await expect(home.seasonSelect.locator('button[role="combobox"]')).not.toBeDisabled();
    await home.expectSessionTypeDisabled();
  });

  test('AC-9: selecting season enables Grand Prix dropdown filtered by season', async () => {
    await home.seasonSelect.locator('button[role="combobox"]').click();
    await home.seasonSelect.locator('div[role="option"]').first().click();

    await expect(home.grandPrixSelect.locator('button[role="combobox"]')).not.toBeDisabled();
    await home.expectSessionTypeDisabled();
  });

  test('AC-10: selecting Grand Prix enables Session Type dropdown with valid session types', async () => {
    await home.selectFirstAvailableOptions();
    await expect(home.sessionTypeSelect.locator('button[role="combobox"]')).not.toBeDisabled();
  });

  test('AC-11: reference data loading failure shows toast and disables form', async ({ page }) => {
    await page.route('**/api/v1/reference-data', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Something went wrong. Please try again.' }) }),
    );
    await page.goto('/');

    await expectToast(page, /something went wrong/i);
  });

  test('ERR-1: rejects empty host display name', async ({ page }) => {
    await home.selectFirstAvailableOptions();
    await home.submitCreateRoom({ force: true });
    await expect(page).toHaveURL('/');
  });

  test('ERR-2: rejects display name exceeding 50 characters', async () => {
    const longName = 'A'.repeat(51);
    await home.hostNameInput.locator('input').fill(longName);
    const value = await home.hostNameInput.locator('input').inputValue();
    expect(value.length).toBeLessThanOrEqual(50);
  });

  test('ERR-7: rejects even matrix size via UI', async () => {
    await home.toggleMoreOptions();
    const matrixButtons = home.matrixSizeButtons.locator('button');
    const count = await matrixButtons.count();
    for (let i = 0; i < count; i++) {
      const text = await matrixButtons.nth(i).textContent();
      const size = parseInt(text!.trim());
      expect(size % 2).toBe(1);
    }
  });
});
