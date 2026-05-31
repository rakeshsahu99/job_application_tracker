import { chromium, Browser, BrowserContext, Page } from "playwright";
import path from "path";
import fs from "fs";

export interface BrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

let activeBrowser: Browser | null = null;
let activeContext: BrowserContext | null = null;

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

  activeBrowser = browser;
  activeContext = context;

  return { browser, context, page };
}

/**
 * Launches a standalone browser instance.
 */
export async function getBrowser(): Promise<Browser> {
  if (activeBrowser) {
    try {
      await activeBrowser.close();
    } catch (e) {}
  }
  activeBrowser = await chromium.launch({
    headless: false,
    args: ["--start-maximized"],
  });
  return activeBrowser;
}

/**
 * Returns/Creates a browser context with persistent state per user.
 */
export async function getContext(browser: Browser, userId: string): Promise<BrowserContext> {
  const storageStatePath = path.join(process.cwd(), `auth_${userId}.json`);
  const hasStorage = fs.existsSync(storageStatePath);
  activeContext = await browser.newContext({
    storageState: hasStorage ? storageStatePath : undefined,
    viewport: null,
  });
  return activeContext;
}

/**
 * Saves cookies/storage state for the given context.
 */
export async function saveCookies(context: BrowserContext, userId: string): Promise<void> {
  const storageStatePath = path.join(process.cwd(), `auth_${userId}.json`);
  await context.storageState({ path: storageStatePath });
  console.log(`[Browser] Saved cookies/state for user ${userId} to ${storageStatePath}`);
}

/**
 * Safely closes the browser session and optionally saves the storage state.
 */
export async function closeBrowser(
  session?: BrowserSession,
  saveStorageState = false
): Promise<void> {
  if (session) {
    if (saveStorageState) {
      const storageStatePath = path.join(process.cwd(), "auth.json");
      await session.context.storageState({ path: storageStatePath });
      console.log(`[Browser] Session state saved to ${storageStatePath}`);
    }
    await session.context.close();
    await session.browser.close();
  } else {
    if (activeContext) {
      try {
        await activeContext.close();
      } catch (e) {}
      activeContext = null;
    }
    if (activeBrowser) {
      try {
        await activeBrowser.close();
      } catch (e) {}
      activeBrowser = null;
    }
  }
  console.log("[Browser] Browser closed safely.");
}
