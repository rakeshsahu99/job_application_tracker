export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    // Clean text: remove excessive newlines and whitespace noise
    let text = data.text;
    text = text.replace(/\n\s*\n/g, '\n'); // Replace multiple newlines with a single newline
    text = text.replace(/[ \t]{2,}/g, ' '); // Replace multiple spaces/tabs with a single space
    return text.trim();
  } catch (error) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error('Failed to parse PDF file');
  }
}

export async function fetchAndParsePdf(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return parsePdfBuffer(buffer);
  } catch (error) {
    console.error('Error fetching and parsing PDF:', error);
    throw new Error('Failed to fetch and parse PDF file');
  }
}
