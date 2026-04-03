import { type Page, type Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly createRoomCard: Locator;
  readonly hostNameInput: Locator;
  readonly seasonSelect: Locator;
  readonly grandPrixSelect: Locator;
  readonly sessionTypeSelect: Locator;
  readonly moreOptionsButton: Locator;
  readonly createRoomSubmit: Locator;
  readonly matrixSizeButtons: Locator;
  readonly winPatternToggles: Locator;
  readonly joinRoomCard: Locator;
  readonly joinCodeInput: Locator;
  readonly joinNameInput: Locator;
  readonly joinRoomSubmit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createRoomCard = page.locator('bng-card').filter({ hasText: 'Create Room' });
    this.hostNameInput = this.createRoomCard.locator('bng-input', { has: page.getByLabel('Your Name') });
    this.seasonSelect = this.createRoomCard.locator('bng-select', { has: page.getByText('Season') });
    this.grandPrixSelect = this.createRoomCard.locator('bng-select', { has: page.getByText('Grand Prix') });
    this.sessionTypeSelect = this.createRoomCard.locator('bng-select', { has: page.getByText('Session Type') });
    this.moreOptionsButton = this.createRoomCard.getByRole('button', { name: /more options|less options/i });
    this.createRoomSubmit = this.createRoomCard.getByRole('button', { name: 'Create Room' });
    this.matrixSizeButtons = page.getByRole('radiogroup', { name: /card size/i });
    this.winPatternToggles = this.createRoomCard.locator('bng-pill-toggle');
    this.joinRoomCard = page.locator('bng-card').filter({ hasText: 'Join Room' });
    this.joinCodeInput = this.joinRoomCard.locator('bng-code-input');
    this.joinNameInput = this.joinRoomCard.locator('bng-input', { has: page.getByLabel('Your Name') });
    this.joinRoomSubmit = this.joinRoomCard.getByRole('button', { name: 'Join Room' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async fillCreateRoomForm(options: {
    hostName: string;
    season?: string;
    grandPrix?: string;
    sessionType?: string;
  }): Promise<void> {
    await this.hostNameInput.locator('input').fill(options.hostName);
    if (options.season) {
      await this.selectDropdown(this.seasonSelect, options.season);
    }
    if (options.grandPrix) {
      await this.selectDropdown(this.grandPrixSelect, options.grandPrix);
    }
    if (options.sessionType) {
      await this.selectDropdown(this.sessionTypeSelect, options.sessionType);
    }
  }

  async selectDropdown(selectLocator: Locator, optionText: string): Promise<void> {
    await selectLocator.locator('button[role="combobox"]').click();
    await selectLocator.locator('div[role="option"]').filter({ hasText: optionText }).click();
  }

  async selectFirstAvailableOptions(): Promise<void> {
    await this.seasonSelect.locator('button[role="combobox"]').click();
    await this.seasonSelect.locator('div[role="option"]').first().click();

    await expect(this.grandPrixSelect.locator('button[role="combobox"]')).not.toBeDisabled();
    await this.grandPrixSelect.locator('button[role="combobox"]').click();
    await this.grandPrixSelect.locator('div[role="option"]').first().click();

    await expect(this.sessionTypeSelect.locator('button[role="combobox"]')).not.toBeDisabled();
    await this.sessionTypeSelect.locator('button[role="combobox"]').click();
    await this.sessionTypeSelect.locator('div[role="option"]').first().click();
  }

  async submitCreateRoom(options?: { force?: boolean }): Promise<void> {
    await this.createRoomSubmit.click({ force: options?.force });
  }

  async createRoom(hostName: string): Promise<void> {
    await this.hostNameInput.locator('input').fill(hostName);
    await this.selectFirstAvailableOptions();
    await this.submitCreateRoom();
  }

  async toggleMoreOptions(): Promise<void> {
    await this.moreOptionsButton.click();
  }

  async selectMatrixSize(size: number): Promise<void> {
    await this.matrixSizeButtons
      .locator('button')
      .filter({ hasText: String(size) })
      .click();
  }

  async toggleWinPattern(pattern: string): Promise<void> {
    await this.winPatternToggles
      .locator('button')
      .filter({ hasText: pattern })
      .click();
  }

  async fillJoinRoomForm(joinCode: string, displayName: string): Promise<void> {
    await this.joinCodeInput.click();
    await this.joinCodeInput.locator('input').pressSequentially(joinCode, { delay: 50 });
    await this.joinNameInput.locator('input').fill(displayName);
  }

  async submitJoinRoom(): Promise<void> {
    await this.joinRoomSubmit.click();
  }

  async joinRoom(joinCode: string, displayName: string): Promise<void> {
    await this.fillJoinRoomForm(joinCode, displayName);
    await this.submitJoinRoom();
  }

  async expectOnHomePage(): Promise<void> {
    await expect(this.createRoomCard).toBeVisible();
    await expect(this.joinRoomCard).toBeVisible();
  }

  async expectGrandPrixDisabled(): Promise<void> {
    await expect(this.grandPrixSelect.locator('button[role="combobox"]')).toBeDisabled();
  }

  async expectSessionTypeDisabled(): Promise<void> {
    await expect(this.sessionTypeSelect.locator('button[role="combobox"]')).toBeDisabled();
  }

  async expectNavigatedToRoom(): Promise<void> {
    await this.page.waitForURL(/\/room\//);
  }
}
