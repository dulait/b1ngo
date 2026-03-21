import { type Page, expect } from '@playwright/test';

export async function expectToast(page: Page, message: string | RegExp): Promise<void> {
  const toast = page.locator('[role="alert"]').filter({ hasText: message });
  await expect(toast).toBeVisible({ timeout: 5000 });
}

export async function expectNoToast(page: Page): Promise<void> {
  await expect(page.locator('[role="alert"]')).not.toBeVisible();
}
