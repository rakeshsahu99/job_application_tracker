import { promises as fs } from 'fs';
import path from 'path';

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const pdfParseModule = require('pdf-parse');
    
    // Check if it is the modern class-based library
    let PDFParseClass = pdfParseModule.PDFParse;
    if (!PDFParseClass && pdfParseModule.default) {
      PDFParseClass = pdfParseModule.default.PDFParse;
    }
    
    if (PDFParseClass) {
      const parser = new PDFParseClass({ data: buffer });
      const result = await parser.getText();
      return result.text || '';
    }
    
    // Fallback to classic function-based library
    let pdfParseFn = pdfParseModule;
    if (pdfParseFn.default) {
      pdfParseFn = pdfParseFn.default;
    }
    
    if (typeof pdfParseFn === 'function') {
      const result = await pdfParseFn(buffer);
      return result.text || '';
    }
    
    throw new Error('Could not resolve a valid PDF parsing function or class from pdf-parse');
  } catch (error) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error('Failed to parse PDF file');
  }
}

export async function fetchAndParsePdf(url: string): Promise<string> {
  try {
    let buffer: Buffer;

    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      // Local path on the server - read directly from the filesystem!
      const normalizedPath = url.startsWith('/') ? url : `/${url}`;
      const filePath = path.join(process.cwd(), 'public', normalizedPath);
      buffer = await fs.readFile(filePath);
    } else {
      // Remote absolute URL - perform HTTP fetch
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    return parsePdfBuffer(buffer);
  } catch (error) {
    console.error('Error fetching and parsing PDF:', error);
    throw new Error('Failed to fetch and parse PDF file');
  }
}
