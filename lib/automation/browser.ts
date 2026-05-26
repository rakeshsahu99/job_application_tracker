import { chromium, Browser, BrowserContext, Page } from "playwright";
import path from "path";
import fs from "fs";

export interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

/**
 * Initializes a Playwright browser session.
 * For practice, we use headed mode (headless: false).
 */
export async function initializeBrowser(
  headless = false,
  useStorageState = true
): Promise<BrowserSession> {
  const browser = await chromium.launch({
    headless,
    args: ["--start-maximized"],
  });

  const storageStatePath = path.join(process.cwd(), "auth.json");
  const hasStorageState = useStorageState && fs.existsSync(storageStatePath);

  const context = await browser.newContext({
    storageState: hasStorageState ? storageStatePath : undefined,
    viewport: null, // use maximized viewport
  });

  const page = await context.newPage();

  return { browser, context, page };
}

/**
 * Safely closes the browser session and optionally saves the storage state.
 */
export async function closeBrowser(
  session: BrowserSession,
  saveStorageState = false
): Promise<void> {
  if (saveStorageState) {
    const storageStatePath = path.join(process.cwd(), "auth.json");
    await session.context.storageState({ path: storageStatePath });
    console.log(`[Browser] Session state saved to ${storageStatePath}`);
  }

  await session.context.close();
  await session.browser.close();
  console.log("[Browser] Browser closed safely.");
}
