import { Page } from "playwright";
import { typeformWait } from "./helpers";

/**
 * A generalized login function to practice form filling and handling navigation.
 * Uses try-catch block to handle potential errors gracefully.
 */
export async function performLogin(page: Page, url: string, usernameStr: string, passwordStr: string) {
  try {
    console.log(`[Login] Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle" });

    // Wait for the username field and fill it
    console.log("[Login] Entering username...");
    await page.waitForSelector('input[type="text"], input[type="email"], input[name="username"]', { timeout: 10000 });
    const usernameInput = page.locator('input[type="text"], input[type="email"], input[name="username"]').first();
    await usernameInput.fill(usernameStr);

    // Enter password
    console.log("[Login] Entering password...");
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(passwordStr);

    // Wait for navigation after clicking submit
    console.log("[Login] Submitting form...");
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Log In"), button:has-text("Sign In")').first();
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 }).catch(() => console.log("[Login] No navigation occurred, proceeding...")),
      submitButton.click(),
    ]);

    console.log("[Login] Successfully completed login sequence.");
  } catch (error) {
    console.error("[Login] Error during login flow:", error);
    throw error;
  }
}
