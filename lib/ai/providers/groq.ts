import { Groq } from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

interface GenerateJsonOptions {
  model?: string;
  temperature?: number;
  maxRetries?: number;
}

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

/**
 * Abstraction layer for AI text generation using Groq.
 * Implements exponential backoff retry handling and forces structured JSON output.
 */
export async function generateStructuredJson<T>(
  systemPrompt: string,
  userPrompt: string,
  options: GenerateJsonOptions = {}
): Promise<T> {
  const { model = DEFAULT_MODEL, temperature = 0.2, maxRetries = 3 } = options;

  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: `${systemPrompt}\n\nIMPORTANT: You must return ONLY a raw, valid JSON object. Do not wrap it in markdown block quotes (\`\`\`json). Do not add any conversational text before or after.`,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature,
        response_format: { type: "json_object" }, // Enforce JSON mode if supported by model
      });

      const content = response.choices[0]?.message?.content || "";
      if (!content) throw new Error("Empty response from AI provider");

      // Attempt to parse JSON
      const parsedData = JSON.parse(content);
      return parsedData as T;
    } catch (error: any) {
      lastError = error;
      attempt++;
      console.warn(`[AI Provider] Attempt ${attempt} failed. Retrying...`, error.message);
      
      // Exponential backoff
      if (attempt < maxRetries) {
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw new Error(`AI generation failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}
