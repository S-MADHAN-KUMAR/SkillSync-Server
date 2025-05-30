import { Types } from "mongoose";
import { IAiMockInterview, IMockANS } from "../../interfaces/IAiMockInterviewModel";
import { IAiVoiceInterviewModel } from "../../interfaces/IAiVoiceInterviewModel";
import { IUser } from "../../interfaces/IUser";
import { IAIRepository } from "../../repositories/interface/IAIRepository";
import { IInterviewConversationRepository } from "../../repositories/interface/IInterviewConversationRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { IVoiceInterviewRepository } from "../../repositories/interface/IVoiceInterviewRepository";
import { Interview, mockINterview } from "../../types/types";
import { UserErrorMessages } from "../../utils/constants";
import { Roles, StatusCode } from "../../utils/enums";
import { askGemini, sanitizeGeminiResponse } from "../../utils/gemini";
import { HttpError } from "../../utils/httpError";
import { IAIService } from "../interface/IAIService";
import { IVoiceInterviewFeedbackRepository } from "../../repositories/interface/IVoiceInterviewFeedbackRepository";
import { IvoiceInterviewFeedback } from "../../interfaces/IvoiceInterviewFeedback";
import { ICandidateRepository } from "../../repositories/interface/ICandidateRepository";
import { IEmployeeRepository } from "../../repositories/interface/IEmployeeRepository";

export class AiService implements IAIService {
    private _aiRepository: IAIRepository
    private _voiceInterviewRepository: IVoiceInterviewRepository
    private _interviewConversationRepository: IInterviewConversationRepository
    private _userRepository: IUserRepository
    private _voiceInterviewFeedbackRepository: IVoiceInterviewFeedbackRepository
    private _candidateProfileRepository: ICandidateRepository
    private _employeeprofileRepository: IEmployeeRepository

    constructor(_aiRepository: IAIRepository,
        _userRepository: IUserRepository,
        _voiceInterviewRepository: IVoiceInterviewRepository, _interviewConversationRepository: IInterviewConversationRepository,
        _voiceInterviewFeedbackRepository: IVoiceInterviewFeedbackRepository,
        _candidateProfileRepository: ICandidateRepository,
        _employeeprofileRepository: IEmployeeRepository
    ) {
        this._aiRepository = _aiRepository;
        this._userRepository = _userRepository;
        this._voiceInterviewRepository = _voiceInterviewRepository;
        this._interviewConversationRepository = _interviewConversationRepository;
        this._voiceInterviewFeedbackRepository = _voiceInterviewFeedbackRepository;
        this._candidateProfileRepository = _candidateProfileRepository;
        this._employeeprofileRepository = _employeeprofileRepository;
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

    async getAllMockInterviews(
        page: number,
        pageSize: number,
        querys?: string,
        id?: string,
    ): Promise<{ interviews: IAiMockInterview[] | null; totalInterviews: number }> {

        const skip = (page - 1) * pageSize;
        const filter: any = { isDeleted: false };

        if (id) {
            filter.candidateId = id;
        }

        if (querys && querys.trim() !== "") {
            filter.$or = [
                { jobPosition: { $regex: querys, $options: "i" } },
                { jobDescription: { $regex: querys, $options: "i" } },
            ];
        }

        const interviews = await this._aiRepository.findAll(filter, skip, pageSize);
        const totalInterviews = await this._aiRepository.countDocuments(filter);

        if (interviews) {
            return { interviews, totalInterviews };
        } else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async createMockInterview(payload: mockINterview, id: string): Promise<IAiMockInterview | null> {
        const user = await this._userRepository.findById(id);

        if (!user || !user.status) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

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
      }
    ]
    
    Do not include explanations, headings, or any extra text—**only the JSON array**.
    `;

        const response = await askGemini(prompt);

        try {
            const clean = sanitizeGeminiResponse(response);
            const parsed = JSON.parse(clean);

            const newPayload = {
                candidateId: user._id as string,
                jsonMockResp: parsed,
                jobPosition: payload.jobRole,
                jobDescription: payload.description,
                jobExperience: Number(payload.experience),
                mode: payload.mode,
                numberOfQuestions: Number(payload.numberOfQuestions)
            };

            return await this._aiRepository.create(newPayload);
        } catch (error) {
            console.error("Failed to parse or create Gemini response:", error);
            return null;
        }
    }

    async saveAnswer(
        payload: { feedback: string; questionId: string; userAnswer: string },
        id: string
    ): Promise<IAiMockInterview | null> {
        try {
            const aiData = await this._aiRepository.findById(id);
            if (!aiData) {
                throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
            }

            const prompt = `Give a detailed rating (1-5) and constructive feedback on this answer:
    
    Question: ${payload.feedback}
    User's Answer: ${payload.userAnswer}
    
    Return only JSON:
    [
      {
        "rating": 4,
        "feedback": "Your explanation covered the basics but missed some edge cases."
      }
    ]
    `;

            const rawText = await askGemini(prompt);

            let answers: IMockANS[];
            try {
                const clean = sanitizeGeminiResponse(rawText);
                const parsed = JSON.parse(clean);
                const parsedArray = Array.isArray(parsed) ? parsed : [parsed];

                answers = parsedArray.map((item) => {
                    const rating = Number(item.rating);
                    if (isNaN(rating)) throw new Error(`Invalid rating: ${item.rating}`);
                    return {
                        rating,
                        feedback: item.feedback,
                        questionId: payload.questionId,
                        userAnswer: payload.userAnswer,
                    };
                });
            } catch (err: any) {
                throw new Error(`Failed to parse Gemini response: ${err.message}`);
            }

            const existingAnswers = aiData.jsonMockAnswer || [];
            const idx = existingAnswers.findIndex((a) => a.questionId === payload.questionId);

            if (idx !== -1) {
                existingAnswers[idx] = answers[0];
            } else {
                existingAnswers.push(...answers);
            }

            await this._aiRepository.update(id, { jsonMockAnswer: existingAnswers });
            return aiData;
        } catch (error) {
            console.error("Error saving answer:", error);
            throw error;
        }
    }

    async checkAiAccess(id: string): Promise<{ user: IUser; isHaveAccess: boolean } | null> {
        const user = await this._userRepository.findById(id);

        if (!user) return null;

        return {
            user,
            isHaveAccess: !!user.hasAiAccess,
        };
    }

    async removeInterview(payload: { id: string, userId: string }): Promise<boolean | null> {
        const interview = await this._aiRepository.findOneAndUpdate({ _id: payload?.id, candidateId: payload?.userId }, { isDeleted: true });

        if (!interview) return null;

        return true
    }

    async createInterview(payload: Interview, employeeId: string): Promise<IAiVoiceInterviewModel | null> {
        const user = await this._userRepository.findById(employeeId);

        if (!user || !user.status) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const prompt = `You are an expert technical interviewer. 
Based on the following inputs, generate a well-structured list of high-quality interview questions: 
Job Title: ${payload?.jobTitle} 
Job Description:  ${payload?.jobDescription} 
Interview Duration:  ${payload?.interviewDuration}
Interview Type:  ${payload?.interviewTypes}
📝Your task: 
Analyze the job description to identify key responsibilities, required skills, and expected experience. 
Generate a list of interview questions depends on interview duration 
Adjust the number and depth of questions to match the interview duration. 
Ensure the questions match the tone and structure of a real-life ${payload?.interviewTypes} interview. 
🧩Format your response in JSON format with array list of questions. 
format: interviewQuestions=[ 
{ 
question:", 
type: 'Technical/Behavioral/Experince/Problem Solving/Leaseship' 
},{ 
}] 
🎯The goal is to create a structured, relevant, and time-optimized interview plan for a ${payload?.jobTitle} role`

        const response = await askGemini(prompt);

        try {
            const clean = sanitizeGeminiResponse(response);
            const parsed = JSON.parse(clean);
            console.log(parsed);

            const newPayload = {
                employeeId: employeeId,
                questions: parsed?.interviewQuestions,
                jobPosition: payload?.jobTitle,
                interviewDuration: payload?.interviewDuration,
                interviewTypes: payload?.interviewTypes,
                jobDescription: payload?.jobDescription,
                jobTitle: payload?.jobTitle,
                interviewFor: payload?.interviewFor,
            };

            return await this._voiceInterviewRepository.create(newPayload);

        } catch (error) {
            console.error("Failed to parse or create Gemini response:", error);
            return null;
        }
    }

    async getAllVoiceInterviews(
        page: number,
        pageSize: number,
        querys?: string,
        id?: string,
    ): Promise<{ interviews: any[] | null; totalInterviews: number }> {

        const skip = (page - 1) * pageSize;
        const filter: any = { isDeleted: false, expiredDate: { $gt: new Date() } };

        if (id) {
            filter.employeeId = id;
        }

        if (querys && querys.trim() !== "") {
            filter.$or = [
                { jobPosition: { $regex: querys, $options: "i" } },
                { jobDescription: { $regex: querys, $options: "i" } },
            ];
        }

        const interviews = await this._voiceInterviewRepository.findAll(filter, skip, pageSize);
        const totalInterviews = await this._voiceInterviewRepository.countDocuments(filter);

        if (!interviews) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        // Fetch all user info in parallel (limit fields if you want)
        const interviewsWithUserInfo = await Promise.all(
            interviews.map(async (interview) => {
                const userInfo = await this._userRepository.findById(interview.interviewFor);
                return {
                    ...interview,
                    userInfo: userInfo || null,
                };
            })
        );

        return { interviews: interviewsWithUserInfo, totalInterviews };
    }

    async getAllCandidates(): Promise<IUser[] | null> {
        try {
            const users = await this._userRepository.findAll({ status: true, hasAiAccess: true, role: Roles.CANDIDATE });
            return users;
        } catch (error) {
            console.error("Error fetching candidates with AI access:", error);
            return null;
        }
    }

    async getInterview(
        id: string
    ): Promise<{ interview: IAiVoiceInterviewModel; userInfo: IUser; userProfile: any | null } | null> {
        try {
            const interview = await this._voiceInterviewRepository.findOne({ _id: id, isDeleted: false });
            if (!interview) return null;

            const userInfo = await this._userRepository.findOne({
                _id: interview.interviewFor,
                hasAiAccess: true,
            });

            if (!userInfo) return null;

            let userProfile: any | null = null;

            if (userInfo.role === Roles.CANDIDATE && userInfo.candidateProfileId) {
                userProfile = await this._candidateProfileRepository.findById(userInfo.candidateProfileId as string);
            } else if (userInfo.role === Roles.EMPLOYEE && userInfo.employeeProfileId) {
                userProfile = await this._employeeprofileRepository.findById(userInfo.employeeProfileId as string);
            }

            return { interview, userInfo, userProfile };
        } catch (error) {
            console.error("Error fetching interview with user info:", error);
            return null;
        }
    }

    async checkInterviewAccess(payload: { id: string, userId: string }): Promise<any | null> {
        try {
            const interview = await this._voiceInterviewRepository.findOne({ _id: payload?.id, interviewFor: payload?.userId });
            if (!interview) return null;

            const userInfo = await this._userRepository.findById(interview.interviewFor);
            return { interview, userInfo };
        } catch (error) {
            console.error("Error fetching interview with user info:", error);
            return null;
        }
    }

    async inteviewConversation(payload: { question: string, questions: number, interviewId: string, answer: string, time: any }): Promise<any | null> {
        try {

            const prompt = `
            You are a helpful and professional AI interview assistant having a real-time voice conversation with a candidate.
            
            The current interview question is:
            "${payload?.question}"
            
            The candidate responded with:
            "${payload?.answer}"
            
            If the candidate asks for clarification or to repeat the question, kindly and clearly repeat the original question exactly as it was asked.
            
            If the candidate struggles or gives an incomplete or unclear answer, respond kindly and offer gentle encouragement or a helpful explanation to guide them. For example, you might say:
            "That's okay, take your time. Here's a hint to help you think it through..."
            
            If the candidate gives a good or partial answer, encourage them warmly like a supportive interviewer. Use phrases like:
            "Good job! That was a solid answer." or "Thanks for sharing that! Let's keep going."
            
            If the answer is not clear-cut or mostly incorrect, provide the correct answer along with a helpful suggestion. Then continue to the next question.
            
            If the user says something like "skip" or "move to the next question", or if the answer is mostly correct, give feedback and a suggestion — then transition using the phrase "Next question".
            
            Keep your responses natural, concise, friendly, and easy to understand — as if speaking in real time during a live interview. Avoid any prefixes, formatting, or complex language. Use plain, spoken language.
            
            There are ${payload?.questions} questions remaining in the interview. Consider the remaining time ${payload?.time} left and move to the next question accordingly.
            `;

            const getResponse = await askGemini(prompt)


            const createPayload = {
                interviewId: new Types.ObjectId(payload?.interviewId),
                question: payload?.question,
                aiResponse: getResponse,
                userAnswer: payload?.answer
            }

            if (getResponse) {
                const saveConversation = await this._interviewConversationRepository.create(createPayload)

                if (saveConversation) {
                    return getResponse
                }
            }

        } catch (error) {
            console.error("Error fetching interview with user info:", error);
            return null;
        }
    }

    async getFeedback(
        id: string
    ): Promise<{
        interview: IAiVoiceInterviewModel;
        userInfo: IUser;
        feedback: IvoiceInterviewFeedback | null;
    } | null> {
        try {
            const interview = await this._voiceInterviewRepository.findById(id);
            if (!interview) return null;

            const userInfo = await this._userRepository.findById(interview.interviewFor);
            if (!userInfo) return null;

            const alreadyExist = await this._voiceInterviewFeedbackRepository.findById(interview?.feedBackId)

            if (alreadyExist) {
                return {
                    interview,
                    userInfo,
                    feedback: alreadyExist,
                };
            }

            const conversations = await this._interviewConversationRepository.findAll({
                interviewId: interview._id,
            });

            const prompt = `${conversations}
      Depends on this Interview Conversation between assistant and user,
      Give me feedback for user interview and this all questions ${interview.questions}. 
      Give me rating out of 10 for technicalSkills, communication, problemSolving, experience. 
      Also give me summary in 3 lines about the interview and one line to let me know whether the candidate is recommended for hire or not with a message. 
      Give me response in JSON format:
      
      {
        feedback: {
          rating: {
            technicalSkills: 5,
            communication: 6,
            problemSolving: 4,
            experience: 7
          },
          summary: "<3 line summary>",
          recommendation: "Recommended" | "Not Recommended",
          recommendationMsg: "..."
        }
      }
      `;

            const getResponse: any = await askGemini(prompt);

            console.log("🧠 Raw Gemini Response:", getResponse);

            const clean = sanitizeGeminiResponse(getResponse);
            const feedbackJson = JSON.parse(clean);

            if (feedbackJson?.feedback?.rating) {
                const data = {
                    interviewId: new Types.ObjectId(interview._id as string),
                    technicalSkills: Number(feedbackJson.feedback.rating?.technicalSkills || 0),
                    communication: Number(feedbackJson.feedback.rating?.communication || 0),
                    problemSolving: Number(feedbackJson.feedback.rating?.problemSolving || 0),
                    experience: Number(feedbackJson.feedback.rating?.experience || 0),
                    summary: String(feedbackJson.feedback.summary || ""),
                    recommendation: String(feedbackJson.feedback.recommendation || ""),
                    recommendationMsg: String(feedbackJson.feedback.recommendationMsg || ""),
                };

                const feedbackCreated = await this._voiceInterviewFeedbackRepository.create(data);
                await this._voiceInterviewRepository.update(interview._id as string, { feedBackId: feedbackCreated?._id.toString() })
                return {
                    interview,
                    userInfo,
                    feedback: feedbackCreated,
                };
            } else {
                console.warn("⚠️ Feedback JSON structure invalid or missing required fields.", feedbackJson);
                return null;
            }



        } catch (error) {
            console.error("Error fetching interview with user info:", error);
            return null;
        }
    }

    async removeVoiceInterview(payload: { id: string }): Promise<boolean> {
        const interview = await this._voiceInterviewRepository.update(payload.id, { isDeleted: true });

        if (!interview) {
            return false; // Interview not found or update failed
        }

        await this._voiceInterviewFeedbackRepository.findOneAndDelete({ _id: interview.feedBackId });
        await this._interviewConversationRepository.deleteMany({ interviewId: interview._id });

        return true;
    }



}    