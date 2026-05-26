import { initializeBrowser, closeBrowser } from "../lib/automation/browser";

async function main() {
  console.log("Starting practice script...");
  
  // Open headed browser (headless: false)
  const session = await initializeBrowser(false, false);
  const { page } = session;

  try {
    console.log("Navigating to example.com...");
    await page.goto("https://example.com", { waitUntil: "networkidle" });
    
    // Print page title
    const title = await page.title();
    console.log(`Page title is: "${title}"`);
    
    // Wait a few seconds to visually observe
    console.log("Waiting for 3 seconds...");
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error("An error occurred during practice script:", error);
  } finally {
    // Close browser safely
    await closeBrowser(session, false);
    console.log("Practice script finished.");
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}
