import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// root .env dosyasını yükler
dotenv.config({ path: "../../../.env" });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY .env dosyasında bulunamadı");
}

// Gemini client (TEK KERE oluşturulur)
const genAI = new GoogleGenerativeAI(apiKey);

// Dışarıdan kullanılacak tek fonksiyon
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
};
