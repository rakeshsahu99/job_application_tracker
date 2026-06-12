import { Groq } from "groq-sdk";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
console.log("Loaded GROQ_API_KEY from .env:", apiKey ? `${apiKey.substring(0, 10)}...` : "UNDEFINED");

if (!apiKey) {
  console.error("Error: GROQ_API_KEY is not defined in the environment.");
  process.exit(1);
}

const groq = new Groq({ apiKey });

async function testGroq() {
  try {
    console.log("Attempting a simple chat completion with Groq...");
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Test system prompt" },
        { role: "user", content: "Say hello!" }
      ],
      temperature: 0.2
    });
    console.log("SUCCESS! Groq responded:");
    console.log(response.choices[0]?.message?.content);
  } catch (error: any) {
    console.error("FAILED! Groq API returned an error:");
    console.error(error);
  }
}

testGroq();
