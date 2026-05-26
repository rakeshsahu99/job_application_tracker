import { initializeBrowser, closeBrowser } from "../lib/automation/browser";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Starting forms practice script...");
  
  // Headed mode
  const session = await initializeBrowser(false, false);
  const { page } = session;

  try {
    // Create a dummy resume file for upload testing
    const dummyFilePath = path.join(process.cwd(), "dummy-resume.pdf");
    if (!fs.existsSync(dummyFilePath)) {
      fs.writeFileSync(dummyFilePath, "Dummy Resume Content");
    }

    // Go to a dummy forms page (using a generic internet practice site or similar)
    // Here we'll use a known automation playground
    await page.goto("https://demoqa.com/automation-practice-form", { waitUntil: "networkidle" });
    
    // 1. Text Inputs
    console.log("Filling inputs...");
    await page.getByPlaceholder("First Name").fill("John");
    await page.getByPlaceholder("Last Name").fill("Doe");
    await page.getByPlaceholder("name@example.com").fill("john.doe@example.com");

    // 2. Radio Buttons
    console.log("Selecting radio button...");
    // Sometimes labels are clickable if the input is hidden by custom CSS
    await page.locator('label[for="gender-radio-1"]').click();

    // 3. Mobile Number
    await page.getByPlaceholder("Mobile Number").fill("1234567890");

    // 4. Checkboxes
    console.log("Checking checkboxes...");
    await page.locator('label[for="hobbies-checkbox-1"]').click();
    await page.locator('label[for="hobbies-checkbox-2"]').click();

    // 5. File Upload (Resume Simulation)
    console.log("Uploading file...");
    const fileInput = page.locator("#uploadPicture");
    await fileInput.setInputFiles(dummyFilePath);
    
    // Clean up dummy file afterwards
    fs.unlinkSync(dummyFilePath);

    // 6. Submit
    // Scrolling into view in case it's obscured by ads
    const submitBtn = page.locator("#submit");
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click({ force: true });
    
    console.log("Form submitted. Waiting to observe results...");
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error("An error occurred during forms practice:", error);
  } finally {
    await closeBrowser(session, false);
    console.log("Forms practice script finished.");
  }
}

if (require.main === module) {
  main().catch(console.error);
}
