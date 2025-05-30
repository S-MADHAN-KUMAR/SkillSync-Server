// utils/geminiHelper.ts or services/gemini.service.ts
import { GoogleGenAI } from "@google/genai";
import { GeminiErrorMsg } from "./constants";

export async function askGemini(prompt: string): Promise<string> {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        });

        const rawText = result.text;
        if (!rawText) {
            throw new Error(GeminiErrorMsg.FAILED_TO_GENERATE);
        }

        return rawText;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw error;
    }
}

export function sanitizeGeminiResponse(response: string): string {
    return response.replace(/```json|```/g, '').trim();
}
