import { Page } from 'playwright';
import { typeSlowly, uploadResume, waitForForm, clickRealistic } from './helpers';
import { ApplicationData } from './greenhouse'; // reusing the same interface

/**
 * Automates applying to a Lever job board.
 * Lever typically uses names like "name", "email", "phone" for inputs.
 */
export async function applyToLever(page: Page, url: string, data: ApplicationData) {
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for the main form to be visible (Lever uses a different form id/class)
  await waitForForm(page, '#application-form');

  // Fill out the application fields
  if (data.firstName || data.lastName) {
    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.count() > 0) {
      await nameInput.waitFor();
      await typeSlowly(nameInput, `${data.firstName} ${data.lastName}`.trim());
    }
  }

  if (data.email) {
    const emailInput = page.locator('input[name="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.waitFor();
      await typeSlowly(emailInput, data.email);
    }
  }

  if (data.phone) {
    const phoneInput = page.locator('input[name="phone"]');
    if (await phoneInput.count() > 0) {
      await typeSlowly(phoneInput, data.phone);
    }
  }

  if (data.linkedIn) {
    const linkedinInput = page.locator('input[name="urls[LinkedIn]"]');
    if (await linkedinInput.count() > 0) {
      await typeSlowly(linkedinInput, data.linkedIn);
    }
  }

  // Upload Resume
  if (data.resumePath) {
    console.log('Uploading resume to Lever from:', data.resumePath);
    
    // Lever often has a generic file input for resume
    const resumeInput = page.locator('input[type="file"][name="resume"]');
    if (await resumeInput.count() > 0) {
      await resumeInput.setInputFiles(data.resumePath);
    } else {
      const fileInputs = page.locator('input[type="file"]');
      if (await fileInputs.count() > 0) {
         await fileInputs.first().setInputFiles(data.resumePath);
      }
    }
  }

  await page.waitForTimeout(2000);

  // Stop here for user review
  console.log('Lever form filled! Please review the application in the browser window.');
}
