"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askGemini = askGemini;
exports.sanitizeGeminiResponse = sanitizeGeminiResponse;
// utils/geminiHelper.ts or services/gemini.service.ts
const genai_1 = require("@google/genai");
const constants_1 = require("./constants");
function askGemini(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const result = yield ai.models.generateContent({
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
                throw new Error(constants_1.GeminiErrorMsg.FAILED_TO_GENERATE);
            }
            return rawText;
        }
        catch (error) {
            console.error("Gemini API call failed:", error);
            throw error;
        }
    });
}
function sanitizeGeminiResponse(response) {
    return response.replace(/```json|```/g, '').trim();
}
