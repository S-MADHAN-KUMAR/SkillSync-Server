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

        // Accumulate the response from the stream and return it
        let result = '';
        for await (const chunk of response) {
            if (chunk.text) result += chunk.text;
        }

        return result.trim();
    } catch (error) {
        console.error('Error in askGemini:', error);
        return null; // Return null if there's an error
    }
}

export function sanitizeGeminiResponse(response: string): string {
    // Simplify and make the regex more precise to clean the response
    return response.replace(/```json|```/g, '').trim();
}
