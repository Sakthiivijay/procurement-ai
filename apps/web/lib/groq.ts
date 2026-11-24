// apps/web/lib/groq.ts
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("Missing GROQ_API_KEY in .env.local");
}

console.log("✅ Groq API Key loaded:", apiKey.substring(0, 10) + "...");

export const groq = new Groq({ apiKey });