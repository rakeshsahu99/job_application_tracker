import { Page, Locator } from 'playwright';

/**
 * Types slowly into an input field to mimic human behavior
 */
export async function typeSlowly(locator: Locator, text: string, minDelay = 30, maxDelay = 100) {
  for (const char of text) {
    await locator.type(char, { delay: Math.random() * (maxDelay - minDelay) + minDelay });
  }
}

/**
 * Uploads a resume using standard file chooser pattern
 */
export async function uploadResume(page: Page, fileInputSelector: string, filePath: string) {
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator(fileInputSelector).click()
  ]);
  
  await fileChooser.setFiles(filePath);
}

/**
 * Wait for a specific form or container to load and become stable
 */
export async function waitForForm(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 30000 });
  // Also wait for network to be idle to ensure no sneaky requests are blocking form submission
  await page.waitForLoadState('networkidle');
}

/**
 * Helper to click next / submit buttons realistically
 */
export async function clickRealistic(locator: Locator) {
  // move mouse to the element first
  await locator.hover();
  // wait a tiny bit
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
  // click it
  await locator.click();
}
