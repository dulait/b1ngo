import { type Page, type Locator, expect } from '@playwright/test';

export class GamePage {
  readonly page: Page;
  readonly matrix: Locator;
  readonly leaderboard: Locator;
  readonly leaderboardEmpty: Locator;
  readonly playersCollapsible: Locator;
  readonly endGameButton: Locator;
  readonly endGameSheet: Locator;
  readonly endGameConfirm: Locator;
  readonly endGameCancel: Locator;

  constructor(page: Page) {
    this.page = page;
    this.matrix = page.locator('bng-matrix');
    this.leaderboard = page.getByTestId('game-leaderboard');
    this.leaderboardEmpty = page.locator('bng-leaderboard p');
    this.playersCollapsible = page.getByTestId('game-players');
    this.endGameButton = page.getByTestId('game-end-game');
    this.endGameSheet = page.getByRole('dialog', { name: /end game/i });
    this.endGameConfirm = page.getByTestId('end-game-confirm');
    this.endGameCancel = page.getByTestId('end-game-cancel');
  }

  getSquare(row: number, col: number): Locator {
    return this.page.getByTestId(`square-${row}-${col}`);
  }

  getLeaderboardEntry(rank: number): Locator {
    return this.page.getByTestId(`leaderboard-entry-${rank}`);
  }

  async clickSquare(row: number, col: number) {
    await this.getSquare(row, col).click();
  }

  async markSquare(row: number, col: number) {
    await this.clickSquare(row, col);
  }

  async unmarkSquare(row: number, col: number) {
    await this.clickSquare(row, col);
  }

  async endGame() {
    await this.endGameButton.click();
    await expect(this.endGameSheet).toBeVisible();
    await this.endGameConfirm.click();
  }

  async expectVisible() {
    await expect(this.matrix).toBeVisible();
  }

  async expectSquareMarked(row: number, col: number) {
    const gridcell = this.getSquare(row, col).getByRole('gridcell');
    await expect(gridcell).toHaveAttribute('aria-selected', 'true');
  }

  async expectSquareUnmarked(row: number, col: number) {
    const gridcell = this.getSquare(row, col).getByRole('gridcell');
    await expect(gridcell).not.toHaveAttribute('aria-selected', 'true');
  }

  async expectSquareWinning(row: number, col: number) {
    const gridcell = this.getSquare(row, col).getByRole('gridcell');
    await expect(gridcell).toHaveClass(/border-success/);
  }

  async expectLeaderboardEntry(rank: number, displayName: string) {
    const entry = this.getLeaderboardEntry(rank);
    await expect(entry).toBeVisible();
    await expect(entry).toContainText(displayName);
  }

  async expectLeaderboardEmpty() {
    await expect(this.leaderboardEmpty).toContainText('No winners yet.');
  }

  async expectEndGameVisible() {
    await expect(this.endGameButton).toBeVisible();
  }

  async expectEndGameNotVisible() {
    await expect(this.endGameButton).not.toBeVisible();
  }
}
