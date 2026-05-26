import { chromium, Page } from "playwright";
import path from "path";
import fs from "fs";

/**
 * Step 17: Playwright Automation Fundamentals
 * This script demonstrates launching the browser, handling navigation,
 * using different selectors, managing alerts, waiting strategies,
 * and form interaction.
 */
async function runAutomation() {
  console.log("Launching browser in headed mode...");
  // 1. Launch a browser instance in headed mode (headless: false) for visual debugging
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300, // Slow down execution slightly to observe actions
  });

  // Create a new browser context (session persistence can be added here)
  const context = await browser.newContext();
  
  // 2. Open a new page in the context
  const page: Page = await context.newPage();

  // Create a dummy resume file for upload testing
  const dummyResumePath = path.resolve(process.cwd(), "lib/playwright/dummy-resume.txt");
  if (!fs.existsSync(dummyResumePath)) {
    // Ensure directory exists
    fs.mkdirSync(path.dirname(dummyResumePath), { recursive: true });
    fs.writeFileSync(dummyResumePath, "Dummy Resume Content for Automation Testing");
  }

  try {
    console.log("Navigating to automation practice form...");
    // 3. Navigate to a beginner-friendly practice website
    await page.goto("https://demoqa.com/automation-practice-form", {
      waitUntil: "networkidle", // Waiting strategy: Wait until network connections settle
      timeout: 30000
    });

    console.log("Filling out the form using various selectors...");
    
    // 4. Practice different selector strategies

    // ID Selector
    await page.locator("#firstName").fill("Jane");
    
    // CSS Class Selector (with combination)
    await page.locator(".mr-sm-2[id='lastName']").fill("Doe");
    
    // Accessibility Role / getByRole (Preferred, highly stable)
    // Sometimes labels aren't strictly linked, but placeholders work as well:
    await page.getByPlaceholder("name@example.com").fill("jane.doe@example.com");

    // XPath Selector (Fragile, but good to know)
    const mobileField = page.locator("//input[@id='userNumber']");
    await mobileField.fill("1234567890");

    // Text Selector (clicking a label that acts as a radio button in this UI)
    await page.locator("text=Female").click();

    console.log("Uploading file...");
    // 5. File upload handling
    const fileInput = page.locator("#uploadPicture");
    await fileInput.setInputFiles(dummyResumePath);

    // Scrolling down so the submit button is in view
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    console.log("Submitting form...");
    // Click submit
    await page.locator("#submit").click({ force: true }); // force true helps if it's covered by a banner

    // 6. Wait for modal popup to ensure submission success
    console.log("Waiting for success modal...");
    await page.waitForSelector(".modal-content", { state: "visible", timeout: 10000 });
    console.log("Form successfully submitted and modal appeared.");

    // 7. Handling JavaScript Alerts (Example navigation)
    console.log("Navigating to alert practice page...");
    await page.goto("https://demoqa.com/alerts", { waitUntil: "networkidle" });
    
    // Set up an alert listener before clicking the button that triggers it
    page.once("dialog", async dialog => {
      console.log(`Alert triggered! Message: "${dialog.message()}"`);
      await dialog.accept(); // Dismiss the alert
      console.log("Alert accepted.");
    });
    
    console.log("Clicking alert button...");
    await page.locator("#alertButton").click();

    console.log("All automation tasks completed successfully!");

  } catch (error) {
    console.error("Automation encountered an error:", error);
  } finally {
    console.log("Closing browser...");
    // 8. Always close the browser properly to prevent memory leaks and dangling processes
    await context.close();
    await browser.close();
  }
}

// Execute the automation script
runAutomation();
