import { GoogleGenAI } from '@google/genai';

export async function askGemini(prompt: string): Promise<string | null> {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
    });

    const model = 'gemini-2.5-pro-exp-03-25';
    const config = {
        responseMimeType: 'text/plain',
    };

    const contents = [
        {
            role: 'user',
            parts: [{ text: prompt }],
        },
    ];

    try {
        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        let result = '';
        for await (const chunk of response) {
            if (chunk.text) result += chunk.text;
        }

        return result.trim();
    } catch (error) {
        console.error('Error in askGemini:', error);
        return null;
    }
}


export function sanitizeGeminiResponse(response: string): string {
    return response
        .replace(/```json/g, '') // remove starting markdown
        .replace(/```/g, '')     // remove ending markdown
        .trim();
}
