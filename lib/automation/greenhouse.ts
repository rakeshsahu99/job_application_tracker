import { Page } from 'playwright';
import { typeSlowly, uploadResume, waitForForm, clickRealistic } from './helpers';
import path from 'path';

export interface ApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumePath: string; // Absolute path to a local resume file
  linkedIn?: string;
}

/**
 * Automates applying to a Greenhouse job board.
 * Note: Greenhouse boards typically use IDs like `first_name`, `last_name`, `email`, `phone` for their inputs.
 */
export async function applyToGreenhouse(page: Page, url: string, data: ApplicationData) {
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for the main form to be visible
  await waitForForm(page, '#application_form');

  // Fill out the application fields
  if (data.firstName) {
    const firstNameInput = page.locator('input#first_name');
    await firstNameInput.waitFor();
    await typeSlowly(firstNameInput, data.firstName);
  }

  if (data.lastName) {
    const lastNameInput = page.locator('input#last_name');
    await lastNameInput.waitFor();
    await typeSlowly(lastNameInput, data.lastName);
  }

  if (data.email) {
    const emailInput = page.locator('input#email');
    await emailInput.waitFor();
    await typeSlowly(emailInput, data.email);
  }

  if (data.phone) {
    const phoneInput = page.locator('input#phone');
    if (await phoneInput.count() > 0) {
      await typeSlowly(phoneInput, data.phone);
    }
  }
  
  if (data.linkedIn) {
     const linkedinInput = page.getByLabel(/linkedin/i);
     if (await linkedinInput.count() > 0) {
        await typeSlowly(linkedinInput.first(), data.linkedIn);
     }
  }

  // Upload Resume
  if (data.resumePath) {
    console.log('Uploading resume from:', data.resumePath);
    // Greenhouse resume upload button often has a specific data-custom-attribute or button text.
    // Sometimes it's a hidden input. We can use a generic selector for the file input if it exists,
    // or click the 'Attach' button.
    
    // Attempt 1: Direct file input
    const fileInputs = page.locator('input[type="file"]');
    if (await fileInputs.count() > 0) {
      // Find the one for resume
      await fileInputs.first().setInputFiles(data.resumePath);
    } else {
      // Attempt 2: Click attach button (simplified for demonstration)
      const attachButton = page.getByText(/Attach|Upload/i).first();
      if (await attachButton.isVisible()) {
          await uploadResume(page, 'button:has-text("Attach"), button:has-text("Upload")', data.resumePath);
      }
    }
  }

  // Wait a bit to ensure files are uploaded
  await page.waitForTimeout(2000);

  // Instead of submitting immediately, we stop here for user review (semi-automation)
  console.log('Form filled! Please review the application in the browser window.');
  console.log('You can manually click "Submit Application" when ready.');
  
  // We leave the browser open. The worker will handle the session.
}
