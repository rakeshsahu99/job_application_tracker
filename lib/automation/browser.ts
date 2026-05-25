import { chromium, Browser, BrowserContext } from 'playwright';
import path from 'path';
import fs from 'fs';

let browserInstance: Browser | null = null;

/**
 * Initializes and returns a browser instance in headed mode for debugging and semi-automation.
 */
export async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({
      headless: false, // Must be false for semi-automation/review
      args: [
        '--disable-blink-features=AutomationControlled', // Evade some bot detections
        '--start-maximized',
      ],
    });
  }
  return browserInstance;
}

/**
 * Gets a persistent or standard context. 
 * We use a standard context but inject cookies if we saved them previously.
 */
export async function getContext(browser: Browser, sessionName = 'default'): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const sessionPath = path.join(process.cwd(), '.sessions', `${sessionName}.json`);
  if (fs.existsSync(sessionPath)) {
    try {
      const cookies = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      await context.addCookies(cookies);
    } catch (e) {
      console.error('Failed to load cookies:', e);
    }
  }

  return context;
}

/**
 * Save cookies from the current context for future use
 */
export async function saveCookies(context: BrowserContext, sessionName = 'default') {
  const cookies = await context.cookies();
  const sessionDir = path.join(process.cwd(), '.sessions');
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }
  const sessionPath = path.join(sessionDir, `${sessionName}.json`);
  fs.writeFileSync(sessionPath, JSON.stringify(cookies, null, 2));
}

/**
 * Clean up the browser instance
 */
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
