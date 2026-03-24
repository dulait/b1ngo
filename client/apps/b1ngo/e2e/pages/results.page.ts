import { type Page, type Locator, expect } from '@playwright/test';

export class ResultsPage {
  readonly page: Page;
  readonly gameOverHeading: Locator;
  readonly rankDisplay: Locator;
  readonly leaderboard: Locator;
  readonly leaderboardEmpty: Locator;
  readonly cardSection: Locator;
  readonly matrix: Locator;
  readonly newRoomButton: Locator;
  readonly shareResultButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gameOverHeading = page.getByTestId('results-game-over');
    this.rankDisplay = page.getByTestId('results-rank');
    this.leaderboard = page.getByTestId('results-leaderboard');
    this.leaderboardEmpty = page.locator('bng-leaderboard p').filter({ hasText: 'No winners.' });
    this.cardSection = page.getByTestId('results-card');
    this.matrix = page.locator('bng-matrix');
    this.newRoomButton = page.getByTestId('results-new-room');
    this.shareResultButton = page.getByTestId('results-share');
  }

  getLeaderboardEntry(rank: number): Locator {
    return this.page.getByTestId(`leaderboard-entry-${rank}`);
  }

  getSquare(row: number, col: number): Locator {
    return this.page.getByTestId(`square-${row}-${col}`);
  }

  async clickNewRoom(): Promise<void> {
    await this.newRoomButton.click();
  }

  async expectVisible(): Promise<void> {
    await expect(this.gameOverHeading).toBeVisible();
  }

  async expectRank(rank: number): Promise<void> {
    await expect(this.rankDisplay).toContainText(`#${rank}`);
  }

  async expectNoRank(): Promise<void> {
    await expect(this.rankDisplay).not.toBeVisible();
  }

  async expectLeaderboardEntry(rank: number, displayName: string, pattern?: string): Promise<void> {
    const entry = this.getLeaderboardEntry(rank);
    await expect(entry).toBeVisible();
    await expect(entry).toContainText(displayName);
    if (pattern) {
      await expect(entry).toContainText(pattern);
    }
  }

  async expectNoWinners(): Promise<void> {
    await expect(this.leaderboardEmpty).toBeVisible();
  }

  async expectCardVisible(): Promise<void> {
    await expect(this.cardSection).toBeVisible();
  }

  async expectSquareMarked(row: number, col: number): Promise<void> {
    const gridcell = this.getSquare(row, col).getByRole('gridcell');
    await expect(gridcell).toHaveAttribute('aria-selected', 'true');
  }
}
