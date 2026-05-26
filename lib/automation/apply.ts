import { Page } from "playwright";
import { safeClick, safeUpload, typeformWait } from "./helpers";

/**
 * Practice script to simulate filling a job application form.
 */
export async function performApply(page: Page, url: string, formData: any) {
  try {
    console.log(`[Apply] Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "networkidle" });

    // Fill common fields using role/locator APIs
    console.log("[Apply] Filling out text fields...");
    
    if (formData.firstName) {
      await page.getByRole('textbox', { name: /first name/i }).fill(formData.firstName).catch(() => {});
    }
    
    if (formData.lastName) {
      await page.getByRole('textbox', { name: /last name/i }).fill(formData.lastName).catch(() => {});
    }

    if (formData.email) {
      await page.getByRole('textbox', { name: /email/i }).fill(formData.email).catch(() => {});
    }

    // Example of dropdown selection
    console.log("[Apply] Selecting dropdowns...");
    if (formData.country) {
      const countryDropdown = page.locator('select').filter({ hasText: /country|location/i });
      if (await countryDropdown.count() > 0) {
        await countryDropdown.first().selectOption({ label: formData.country }).catch(() => {});
      }
    }

    // Example of Checkboxes / Radios
    console.log("[Apply] Handling checkboxes...");
    const checkbox = page.getByRole('checkbox', { name: /agree|terms|consent/i });
    if (await checkbox.count() > 0) {
      await checkbox.first().check().catch(() => {});
    }

    // Upload resume
    console.log("[Apply] Uploading resume...");
    if (formData.resumePath) {
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        await fileInput.first().setInputFiles(formData.resumePath).catch(() => {});
      }
    }

    await typeformWait(page, 2000);
    console.log("[Apply] Application form filled successfully.");
  } catch (error) {
    console.error("[Apply] Error filling application:", error);
    throw error;
  }
}
