import { type Page, type Locator, expect } from '@playwright/test';

export class LobbyPage {
  readonly page: Page;
  readonly joinCodeDisplay: Locator;
  readonly cardSection: Locator;
  readonly matrix: Locator;
  readonly playerList: Locator;
  readonly startGameButton: Locator;
  readonly editSheetTitle: Locator;
  readonly editSquareInput: Locator;
  readonly editSaveButton: Locator;
  readonly editCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.joinCodeDisplay = page.getByTestId('lobby-join-code');
    this.cardSection = page.getByTestId('lobby-card');
    this.matrix = page.locator('bng-matrix');
    this.playerList = page.getByTestId('lobby-player-list');
    this.startGameButton = page.getByTestId('lobby-start-game');
    this.editSheetTitle = page.getByRole('dialog', { name: 'Edit Square' });
    this.editSquareInput = page.getByTestId('edit-square-input');
    this.editSaveButton = page.getByTestId('edit-square-save');
    this.editCancelButton = page.getByTestId('edit-square-cancel');
  }

  getSquare(row: number, col: number): Locator {
    return this.page.getByTestId(`square-${row}-${col}`);
  }

  getPlayerChip(displayName: string): Locator {
    return this.page.getByTestId(`player-chip-${displayName}`);
  }

  async clickSquare(row: number, col: number): Promise<void> {
    await this.getSquare(row, col).click();
  }

  async editSquare(row: number, col: number, newText: string): Promise<void> {
    await this.clickSquare(row, col);
    await expect(this.editSheetTitle).toBeVisible();
    await this.editSquareInput.locator('input').fill(newText);
    await this.editSaveButton.click();
    await expect(this.editSheetTitle).not.toBeVisible();
  }

  async startGame(): Promise<void> {
    await this.startGameButton.click();
  }

  async expectVisible(): Promise<void> {
    await expect(this.joinCodeDisplay).toBeVisible();
    await expect(this.cardSection).toBeVisible();
  }

  async expectJoinCode(code: string): Promise<void> {
    await expect(this.joinCodeDisplay).toContainText(code);
  }

  async expectPlayerVisible(displayName: string): Promise<void> {
    await expect(this.getPlayerChip(displayName)).toBeVisible();
  }

  async expectPlayerCount(count: number): Promise<void> {
    await expect(this.playerList).toContainText(`Players (${count})`);
  }

  async expectStartGameVisible(): Promise<void> {
    await expect(this.startGameButton).toBeVisible();
  }

  async expectStartGameNotVisible(): Promise<void> {
    await expect(this.startGameButton).not.toBeVisible();
  }

  async expectSquareText(row: number, col: number, text: string): Promise<void> {
    await expect(this.getSquare(row, col)).toContainText(text);
  }

  async expectFreeSpace(row: number, col: number): Promise<void> {
    await expect(this.getSquare(row, col)).toContainText('FREE');
  }
}
