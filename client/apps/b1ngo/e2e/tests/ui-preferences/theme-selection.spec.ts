import { test, expect } from '../../fixtures/base.fixture';
import { GamePage } from '../../pages/game.page';
import { navigateToRoom } from '../../fixtures/base.fixture';
import { setupActiveGame } from '../../helpers/room.helper';

test.describe('BNG-016: Theme Selection', () => {
  test('AC-1: default theme uses system preference', async ({ page }) => {
    await page.goto('/');

    const storedTheme = await page.evaluate(() => localStorage.getItem('bng-theme'));
    expect(storedTheme).toBeNull();
  });

  test('AC-2: selecting a theme applies it immediately and persists', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('theme-button').click();

    const themeSheet = page.getByRole('dialog', { name: /theme/i });
    await expect(themeSheet).toBeVisible();

    const themeOptions = themeSheet.locator('[data-testid^="theme-option-"]');
    await expect(themeOptions.first()).toBeVisible();
    const optionCount = await themeOptions.count();
    expect(optionCount).toBeGreaterThan(1);

    const secondOption = themeOptions.nth(1);
    await secondOption.click();

    const storedTheme = await page.evaluate(() => localStorage.getItem('bng-theme'));
    expect(storedTheme).not.toBeNull();
  });

  test('AC-3: theme is restored on page reload', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('theme-button').click();
    const themeSheet = page.getByRole('dialog', { name: /theme/i });
    await expect(themeSheet).toBeVisible();

    const themeOptions = themeSheet.locator('[data-testid^="theme-option-"]');
    await expect(themeOptions.first()).toBeVisible();
    await themeOptions.nth(1).click();

    const storedThemeBefore = await page.evaluate(() => localStorage.getItem('bng-theme'));

    await page.reload();

    const storedThemeAfter = await page.evaluate(() => localStorage.getItem('bng-theme'));
    expect(storedThemeAfter).toBe(storedThemeBefore);
  });

  test('AC-4: theme change does not affect game state', async ({ page, context, api }) => {
    const room = await setupActiveGame(api, { matrixSize: 3 });
    await navigateToRoom(page, context, room.roomId, room.host.playerId, room.host.playerToken);

    const game = new GamePage(page);
    await game.expectVisible();

    await game.markSquare(0, 0);
    await game.expectSquareMarked(0, 0);

    await page.getByTestId('theme-button').click();
    const themeSheet = page.getByRole('dialog', { name: /theme/i });
    await expect(themeSheet).toBeVisible();
    const themeOptions = themeSheet.locator('[data-testid^="theme-option-"]');
    await expect(themeOptions.first()).toBeVisible();
    await themeOptions.nth(1).click();

    await game.expectSquareMarked(0, 0);
    await game.expectVisible();
  });
});
