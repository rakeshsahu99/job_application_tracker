import { initializeBrowser, closeBrowser } from "../lib/automation/browser";

async function main() {
  console.log("Starting selectors practice script...");
  
  // Headed mode for observation
  const session = await initializeBrowser(false, false);
  const { page } = session;

  try {
    // We use a simple testing site for practice
    await page.goto("https://the-internet.herokuapp.com/login", { waitUntil: "networkidle" });
    
    // 1. ID Selector
    console.log("Locating by ID...");
    const usernameById = page.locator("#username");
    await usernameById.fill("tomsmith");
    
    // 2. Class Selector + wait
    console.log("Locating by Class...");
    await page.waitForSelector(".radius");
    const passwordByClass = page.locator(".radius").nth(1); // second input with this class is password
    await passwordByClass.fill("SuperSecretPassword!");
    
    // 3. getByRole (Recommended by Playwright)
    console.log("Locating by Role...");
    const loginBtnByRole = page.getByRole("button", { name: /login/i });
    
    // 4. XPath and CSS (Just for practice demonstration)
    const _headerXpath = page.locator('//h2[contains(text(), "Login Page")]');
    const _headerCss = page.locator('h2:has-text("Login Page")');
    
    // Execute click and wait for navigation to avoid race conditions
    console.log("Clicking login...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      loginBtnByRole.click()
    ]);
    
    // 5. Text Selector
    const successMessage = page.locator('text=You logged into a secure area!');
    if (await successMessage.isVisible()) {
      console.log("Login successful! Located success message by text.");
    }
    
    await page.waitForTimeout(2000);
  } catch (error) {
    console.error("An error occurred during selectors practice:", error);
  } finally {
    await closeBrowser(session, false);
    console.log("Selectors practice script finished.");
  }
}

if (require.main === module) {
  main().catch(console.error);
}
