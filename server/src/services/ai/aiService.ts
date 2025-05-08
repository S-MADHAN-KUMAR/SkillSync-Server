import { IAiMockInterview } from "../../interfaces/IAiMockInterviewModel";
import { IAIRepository } from "../../repositories/interface/IAIRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { mockINterview } from "../../types/types";
import { MockInterviewErrorMsg, UserErrorMessages } from "../../utils/constants";
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


}