/**
 * Utility functions for cleaning and normalizing resume text extracted from PDFs
 */

export function cleanResumeText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove excessive newlines (more than 2 consecutive newlines)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 2. Remove excessive whitespace/tabs
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');

  // 3. Strip non-printable ASCII characters or weird Unicode artifacts
  cleaned = cleaned.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, '');

  // 4. Fix broken word wraps (e.g. "com-\nputer" -> "computer")
  cleaned = cleaned.replace(/-\n\s*/g, '');

  // 5. Trim leading and trailing whitespace
  return cleaned.trim();
}
