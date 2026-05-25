import { chromium, Page } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

// Using process.cwd() to resolve paths safely regardless of module type
const resumePath = path.resolve(process.cwd(), "lib/playwright/dummy-resume.txt");

async function runAutomation() {
  console.log("Launching browser...");
  // 1. Launch a browser instance in headed mode so we can see what's happening
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500, // Slow down execution by 500ms so you can visually follow the actions
  });

  // 2. Create a new browser context (similar to an incognito window with its own cookies/cache)
  const context = await browser.newContext();

  // 3. Open a new page in the context
  const page: Page = await context.newPage();

  try {
    console.log("Navigating to test form...");
    // 4. Navigate to our local Next.js test form
    // Note: Ensure your Next.js dev server is running on localhost:3000
    await page.goto("http://localhost:3000/playwright-test", {
      waitUntil: "networkidle", // Wait until there are no network connections for at least 500 ms
    });

    console.log("Filling out the form...");
    
    // 5. Interacting with the form using reliable locators
    // getByLabel is great for accessibility and robustness
    await page.getByLabel("Full Name").fill("John Doe");
    
    // You can also use CSS locators if needed, but getByRole/getByLabel are preferred
    await page.getByLabel("Email address").fill("john.doe@example.com");
    
    // Selecting an option from a dropdown
    await page.getByLabel("Role Applied For").selectOption("software_engineer");
    
    // Checking a checkbox
    await page.getByLabel("Subscribe to job alerts").check();

    console.log("Uploading resume...");
    // Uploading a file
    await page.getByLabel("Resume (PDF)").setInputFiles(resumePath);

    console.log("Submitting form...");
    // Clicking the submit button
    await page.getByRole("button", { name: "Submit Application" }).click();

    console.log("Waiting for success message...");
    // 6. Wait for the success message to appear and verify it
    // We wait for the text to ensure the form was processed
    const successMessage = page.getByText("Application successfully submitted");
    await successMessage.waitFor({ state: "visible", timeout: 5000 });
    
    console.log("Automation completed successfully!");

  } catch (error) {
    console.error("Automation failed:", error);
  } finally {
    console.log("Closing browser in 3 seconds...");
    // Wait for 3 seconds before closing so you can see the final state
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // 7. Always close the browser properly to clean up resources
    await browser.close();
  }
}

// Execute the function
runAutomation();
