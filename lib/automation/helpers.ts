import { Page, Locator } from "playwright";

/**
 * Custom helper to wait for a short duration gracefully.
 */
export async function typeformWait(page: Page, ms = 1000) {
  await page.waitForTimeout(ms);
}

/**
 * Safely clicks an element if it exists and is visible.
 */
export async function safeClick(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector).first();
    if (await element.isVisible({ timeout: 5000 })) {
      await element.click();
      return true;
    }
  } catch (error) {
    console.log(`[Helper] Could not click on ${selector}`);
  }
  return false;
}

/**
 * Helper to upload a file (e.g. resume) to a file input safely.
 */
export async function safeUpload(page: Page, selector: string, filePath: string): Promise<boolean> {
  try {
    const inputFiles = page.locator(selector).first();
    await inputFiles.waitFor({ state: "attached", timeout: 5000 });
    await inputFiles.setInputFiles(filePath);
    return true;
  } catch (error) {
    console.log(`[Helper] Could not upload file at ${selector}`);
  }
  return false;
}
