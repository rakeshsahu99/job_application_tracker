# Automation Guidelines

This document outlines the principles for maintaining and expanding the Playwright automation engine within this project.

## Core Principles
1. **Never block the main thread**: Automation scripts take time. Always invoke them via background jobs (BullMQ).
2. **Prioritize stable locators**: Use `getByRole`, `getByPlaceholder`, and `getByLabel` over arbitrary XPath chains or dynamically generated CSS classes.
3. **Fail gracefully**: Wrap risky operations in `try-catch` blocks and use `.catch(() => {})` for optional fields to ensure a single missing field doesn't crash the entire flow.
4. **Rate Limiting**: Do not spam target ATS systems. Use intentional delays (`page.waitForTimeout`) to simulate human interactions and avoid triggering anti-bot flags.

## Directory Structure
- `lib/automation/browser.ts`: Core browser lifecycle (launch, close, contexts).
- `lib/automation/helpers.ts`: Reusable abstractions (e.g., `safeClick`, `safeUpload`).
- `lib/automation/[ATS_NAME].ts`: Specific adapters for ATS platforms like Greenhouse or Lever.

## Adding a New ATS Adapter
When integrating a new ATS (e.g., Workday):
1. Create `lib/automation/workday.ts`.
2. Implement an exported function following the signature `async function applyToWorkday(page: Page, formData: JobApplicationData)`.
3. Use our standard `helpers.ts` utilities.
4. Test thoroughly using local scripts before wiring it into the Redis worker queue.
