import OpenAI from 'openai';
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ OPENAI_API_KEY missing in .env");
}

const openai = new OpenAI({
  apiKey: apiKey || 'dummy',
});

// Adapter to mimic Gemini 'generateContent' for minimal code change elsewhere
export const getGeminiModel = () => {
  return {
    generateContent: async (prompt: string) => {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });
        const text = response.choices[0]?.message?.content || "";
        return {
          response: {
            text: () => text
          }
        };
      } catch (error) {
        console.error("OpenAI Error:", error);
        throw error;
      }
    }
  };
};
