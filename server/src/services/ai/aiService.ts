import { IAiMockInterview, IMockANS } from "../../interfaces/IAiMockInterviewModel";
import { IAIRepository } from "../../repositories/interface/IAIRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { mockINterview } from "../../types/types";
import { GeminiErrorMsg, MockInterviewErrorMsg, UserErrorMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { askGemini, sanitizeGeminiResponse } from "../../utils/gemini";
import { HttpError } from "../../utils/httpError";
import { IAIService } from "../interface/IAIService";

export class AiService implements IAIService {
    private _aiRepository: IAIRepository
    private _userRepository: IUserRepository

    constructor(_aiRepository: IAIRepository, _userRepository: IUserRepository) {
        this._aiRepository = _aiRepository;
        this._userRepository = _userRepository;
    }

    async createMockInterview(payload: mockINterview, id: string): Promise<IAiMockInterview | null> {
        const user = await this._userRepository.findById(id);

        if (user && user.status) {
            const prompt = `You are an AI interview generator.

Generate exactly ${payload.numberOfQuestions} interview questions and answers for a ${payload.mode.toLowerCase()} level candidate.

Job Position: ${payload.jobRole}
Job Description: ${payload.description}
Years of Experience: ${payload.experience}

Return the output in **strict JSON format**, as an array of objects. Each object must contain:

- "question": the interview question as a string
- "answer": the ideal answer as a string

Example format:
[
  {
    "question": "What is React?",
    "answer": "React is a JavaScript library for building user interfaces..."
  },
  ...
]

Do not include explanations, headings, or any extra text—**only the JSON array**.
`;


            const response = await askGemini(prompt);

            if (response) {
                try {
                    const clean = sanitizeGeminiResponse(response);
                    const parsed = JSON.parse(clean);
                    console.log('Parsed mock interview:', parsed);

                    const newPayload = {
                        candidateId: user._id as string,
                        jsonMockResp: parsed,
                        jobPosition: payload.jobRole,
                        jobDescription: payload.description,
                        jobExperience: Number(payload.experience),
                        mode: payload.mode,
                        numberOfQuestions: Number(payload.numberOfQuestions)
                    };

                    const created = await this._aiRepository.create(newPayload);
                    return created;
                } catch (error) {
                    console.error('Failed to parse or create Gemini response:', error);
                    return null;
                }
            } else {
                throw new HttpError(MockInterviewErrorMsg.FAILED_TO_CREATED, StatusCode.INTERNAL_SERVER_ERROR);
            }
        } else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async getMockInterview(id: string): Promise<IAiMockInterview | null> {
        const response = await this._aiRepository.findById(id);
        if (response) {
            return response
        }
        else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async getAllMockInterviews(id: string): Promise<IAiMockInterview[] | null> {
        const response = await this._aiRepository.findAll({
            candidateId: id
        });
        if (response) {
            return response
        }
        else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    // async saveAnswer(payload: { feedback: string, questionId: string, userAnswer: string }, id: string): Promise<IAiMockInterview | null> {
    //     // Fetch AI data and Gemini response concurrently
    //     const [aiData, geminiResponse] = await Promise.all([
    //         this._aiRepository.findById(id),
    //         askGemini(payload.feedback), // Call Gemini API concurrently
    //     ]);

    //     if (!aiData) {
    //         throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
    //     }

    //     if (!geminiResponse) {
    //         throw new HttpError(GeminiErrorMsg.FAILED_TO_GENERATE, StatusCode.BAD_REQUEST);
    //     }

    //     // Sanitize Gemini response
    //     const clean = sanitizeGeminiResponse(geminiResponse);
    //     let parsed;
    //     try {
    //         parsed = JSON.parse(clean);
    //     } catch (err) {
    //         throw new Error(`Invalid JSON from Gemini: ${clean}`);
    //     }

    //     const answers: IMockANS[] = Array.isArray(parsed) ? parsed : [parsed];

    //     // Check if the question exists asynchronously
    //     const questionExistsPromise = this._aiRepository.findOne({ "jsonMockResp._id": payload.questionId });

    //     // Enrich the answers before merging
    //     const enriched = answers.map((item) => {
    //         const rating = Number(item.rating);
    //         if (isNaN(rating)) throw new Error(`Invalid rating: ${item.rating}`);
    //         return {
    //             rating,
    //             feedback: item.feedback,
    //             questionId: payload.questionId,
    //             userAnswer: payload.userAnswer,
    //         };
    //     });

    //     // Wait for the question check to finish
    //     const questionExists = await questionExistsPromise;

    //     if (!questionExists) {
    //         throw new HttpError(MockInterviewErrorMsg.QUESTION_NOT_FOUND, StatusCode.NOT_FOUND);
    //     }

    //     // Merge the answers and update the AI data
    //     const updatedAnswers = Array.isArray(aiData.jsonMockAnswer)
    //         ? [...aiData.jsonMockAnswer, ...enriched]
    //         : enriched;

    //     await this._aiRepository.update(id, { jsonMockAnswer: updatedAnswers });

    //     // Fetch the updated AI data after the update
    //     return await this._aiRepository.findById(id);
    // }

    async saveAnswer(
        payload: { feedback: string; questionId: string; userAnswer: string },
        id: string
    ): Promise<IAiMockInterview | null> {
        // Run Gemini and DB fetch concurrently
        const [aiData, geminiResponse] = await Promise.all([
            this._aiRepository.findById(id),
            askGemini(payload.feedback),
        ]);

        if (!aiData) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        if (!geminiResponse) {
            throw new HttpError(GeminiErrorMsg.FAILED_TO_GENERATE, StatusCode.BAD_REQUEST);
        }

        const clean = sanitizeGeminiResponse(geminiResponse);

        let parsed;
        try {
            parsed = JSON.parse(clean);
        } catch (err) {
            throw new Error(`Invalid JSON from Gemini: ${clean}`);
        }

        const answers: IMockANS[] = Array.isArray(parsed) ? parsed : [parsed];

        // Validate answer structure
        const enriched = answers.map((item) => {
            const rating = Number(item.rating);
            if (isNaN(rating)) throw new Error(`Invalid rating: ${item.rating}`);
            return {
                rating,
                feedback: item.feedback,
                questionId: payload.questionId,
                userAnswer: payload.userAnswer,
            };
        });

        // Find if answer already exists
        const existingAnswers = aiData.jsonMockAnswer || [];
        const updatedAnswers = [...existingAnswers];
        const index = existingAnswers.findIndex(ans => ans.questionId === payload.questionId);

        if (index !== -1) {
            // Update existing answer
            updatedAnswers[index] = enriched[0];
        } else {
            // Append new answer
            updatedAnswers.push(...enriched);
        }

        // Save updated answers
        await this._aiRepository.update(id, { jsonMockAnswer: updatedAnswers });

        return await this._aiRepository.findById(id);
    }
      

}    