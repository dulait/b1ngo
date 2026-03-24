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
    this.createRoomCard = page.getByTestId('create-room-card');
    this.hostNameInput = page.getByTestId('create-room-name');
    this.seasonSelect = page.getByTestId('create-room-season');
    this.grandPrixSelect = page.getByTestId('create-room-gp');
    this.sessionTypeSelect = page.getByTestId('create-room-session');
    this.moreOptionsButton = page.getByTestId('create-room-more-options');
    this.createRoomSubmit = page.getByTestId('create-room-submit');
    this.matrixSizeButtons = page.getByTestId('create-room-matrix-sizes');
    this.winPatternToggles = page.getByTestId('create-room-win-patterns');
    this.joinRoomCard = page.getByTestId('join-room-card');
    this.joinCodeInput = page.getByTestId('join-room-code');
    this.joinNameInput = page.getByTestId('join-room-name');
    this.joinRoomSubmit = page.getByTestId('join-room-submit');
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

  async submitCreateRoom(): Promise<void> {
    await this.createRoomSubmit.click();
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
