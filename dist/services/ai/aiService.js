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
exports.AiService = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../utils/constants");
const enums_1 = require("../../utils/enums");
const gemini_1 = require("../../utils/gemini");
const httpError_1 = require("../../utils/httpError");
class AiService {
    constructor(_aiRepository, _userRepository, _voiceInterviewRepository, _interviewConversationRepository, _voiceInterviewFeedbackRepository, _candidateProfileRepository, _employeeprofileRepository) {
        this._aiRepository = _aiRepository;
        this._userRepository = _userRepository;
        this._voiceInterviewRepository = _voiceInterviewRepository;
        this._interviewConversationRepository = _interviewConversationRepository;
        this._voiceInterviewFeedbackRepository = _voiceInterviewFeedbackRepository;
        this._candidateProfileRepository = _candidateProfileRepository;
        this._employeeprofileRepository = _employeeprofileRepository;
    }
    getMockInterview(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._aiRepository.findById(id);
            if (response) {
                return response;
            }
            else {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    getAllMockInterviews(page, pageSize, querys, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const filter = { isDeleted: false };
            if (id) {
                filter.candidateId = id;
            }
            if (querys && querys.trim() !== "") {
                filter.$or = [
                    { jobPosition: { $regex: querys, $options: "i" } },
                    { jobDescription: { $regex: querys, $options: "i" } },
                ];
            }
            const interviews = yield this._aiRepository.findAll(filter, skip, pageSize);
            const totalInterviews = yield this._aiRepository.countDocuments(filter);
            if (interviews) {
                return { interviews, totalInterviews };
            }
            else {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
        });
    }
    createMockInterview(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findById(id);
            if (!user || !user.status) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
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
            const response = yield (0, gemini_1.askGemini)(prompt);
            try {
                const clean = (0, gemini_1.sanitizeGeminiResponse)(response);
                const parsed = JSON.parse(clean);
                const newPayload = {
                    candidateId: user._id,
                    jsonMockResp: parsed,
                    jobPosition: payload.jobRole,
                    jobDescription: payload.description,
                    jobExperience: Number(payload.experience),
                    mode: payload.mode,
                    numberOfQuestions: Number(payload.numberOfQuestions)
                };
                return yield this._aiRepository.create(newPayload);
            }
            catch (error) {
                console.error("Failed to parse or create Gemini response:", error);
                return null;
            }
        });
    }
    saveAnswer(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const aiData = yield this._aiRepository.findById(id);
                if (!aiData) {
                    throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
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
                const rawText = yield (0, gemini_1.askGemini)(prompt);
                let answers;
                try {
                    const clean = (0, gemini_1.sanitizeGeminiResponse)(rawText);
                    const parsed = JSON.parse(clean);
                    const parsedArray = Array.isArray(parsed) ? parsed : [parsed];
                    answers = parsedArray.map((item) => {
                        const rating = Number(item.rating);
                        if (isNaN(rating))
                            throw new Error(`Invalid rating: ${item.rating}`);
                        return {
                            rating,
                            feedback: item.feedback,
                            questionId: payload.questionId,
                            userAnswer: payload.userAnswer,
                        };
                    });
                }
                catch (err) {
                    throw new Error(`Failed to parse Gemini response: ${err.message}`);
                }
                const existingAnswers = aiData.jsonMockAnswer || [];
                const idx = existingAnswers.findIndex((a) => a.questionId === payload.questionId);
                if (idx !== -1) {
                    existingAnswers[idx] = answers[0];
                }
                else {
                    existingAnswers.push(...answers);
                }
                yield this._aiRepository.update(id, { jsonMockAnswer: existingAnswers });
                return aiData;
            }
            catch (error) {
                console.error("Error saving answer:", error);
                throw error;
            }
        });
    }
    checkAiAccess(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findById(id);
            if (!user)
                return null;
            return {
                user,
                isHaveAccess: !!user.hasAiAccess,
            };
        });
    }
    removeInterview(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const interview = yield this._aiRepository.findOneAndUpdate({ _id: payload === null || payload === void 0 ? void 0 : payload.id, candidateId: payload === null || payload === void 0 ? void 0 : payload.userId }, { isDeleted: true });
            if (!interview)
                return null;
            return true;
        });
    }
    createInterview(payload, employeeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findById(employeeId);
            if (!user || !user.status) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            const prompt = `You are an expert technical interviewer. 
Based on the following inputs, generate a well-structured list of high-quality interview questions: 
Job Title: ${payload === null || payload === void 0 ? void 0 : payload.jobTitle} 
Job Description:  ${payload === null || payload === void 0 ? void 0 : payload.jobDescription} 
Interview Duration:  ${payload === null || payload === void 0 ? void 0 : payload.interviewDuration}
Interview Type:  ${payload === null || payload === void 0 ? void 0 : payload.interviewTypes}
📝Your task: 
Analyze the job description to identify key responsibilities, required skills, and expected experience. 
Generate a list of interview questions depends on interview duration 
Adjust the number and depth of questions to match the interview duration. 
Ensure the questions match the tone and structure of a real-life ${payload === null || payload === void 0 ? void 0 : payload.interviewTypes} interview. 
🧩Format your response in JSON format with array list of questions. 
format: interviewQuestions=[ 
{ 
question:", 
type: 'Technical/Behavioral/Experince/Problem Solving/Leaseship' 
},{ 
}] 
🎯The goal is to create a structured, relevant, and time-optimized interview plan for a ${payload === null || payload === void 0 ? void 0 : payload.jobTitle} role`;
            const response = yield (0, gemini_1.askGemini)(prompt);
            try {
                const clean = (0, gemini_1.sanitizeGeminiResponse)(response);
                const parsed = JSON.parse(clean);
                console.log(parsed);
                const newPayload = {
                    employeeId: employeeId,
                    questions: parsed === null || parsed === void 0 ? void 0 : parsed.interviewQuestions,
                    jobPosition: payload === null || payload === void 0 ? void 0 : payload.jobTitle,
                    interviewDuration: payload === null || payload === void 0 ? void 0 : payload.interviewDuration,
                    interviewTypes: payload === null || payload === void 0 ? void 0 : payload.interviewTypes,
                    jobDescription: payload === null || payload === void 0 ? void 0 : payload.jobDescription,
                    jobTitle: payload === null || payload === void 0 ? void 0 : payload.jobTitle,
                    interviewFor: payload === null || payload === void 0 ? void 0 : payload.interviewFor,
                };
                return yield this._voiceInterviewRepository.create(newPayload);
            }
            catch (error) {
                console.error("Failed to parse or create Gemini response:", error);
                return null;
            }
        });
    }
    getAllVoiceInterviews(page, pageSize, querys, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * pageSize;
            const filter = { isDeleted: false, expiredDate: { $gt: new Date() } };
            if (id) {
                filter.employeeId = id;
            }
            if (querys && querys.trim() !== "") {
                filter.$or = [
                    { jobPosition: { $regex: querys, $options: "i" } },
                    { jobDescription: { $regex: querys, $options: "i" } },
                ];
            }
            const interviews = yield this._voiceInterviewRepository.findAll(filter, skip, pageSize);
            const totalInterviews = yield this._voiceInterviewRepository.countDocuments(filter);
            if (!interviews) {
                throw new httpError_1.HttpError(constants_1.UserErrorMessages.USER_NOT_FOUND, enums_1.StatusCode.NOT_FOUND);
            }
            // Fetch all user info in parallel (limit fields if you want)
            const interviewsWithUserInfo = yield Promise.all(interviews.map((interview) => __awaiter(this, void 0, void 0, function* () {
                const userInfo = yield this._userRepository.findById(interview.interviewFor);
                return Object.assign(Object.assign({}, interview), { userInfo: userInfo || null });
            })));
            return { interviews: interviewsWithUserInfo, totalInterviews };
        });
    }
    getAllCandidates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this._userRepository.findAll({ status: true, hasAiAccess: true, role: enums_1.Roles.CANDIDATE });
                return users;
            }
            catch (error) {
                console.error("Error fetching candidates with AI access:", error);
                return null;
            }
        });
    }
    getInterview(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const interview = yield this._voiceInterviewRepository.findOne({ _id: id, isDeleted: false });
                if (!interview)
                    return null;
                const userInfo = yield this._userRepository.findOne({
                    _id: interview.interviewFor,
                    hasAiAccess: true,
                });
                if (!userInfo)
                    return null;
                let userProfile = null;
                if (userInfo.role === enums_1.Roles.CANDIDATE && userInfo.candidateProfileId) {
                    userProfile = yield this._candidateProfileRepository.findById(userInfo.candidateProfileId);
                }
                else if (userInfo.role === enums_1.Roles.EMPLOYEE && userInfo.employeeProfileId) {
                    userProfile = yield this._employeeprofileRepository.findById(userInfo.employeeProfileId);
                }
                return { interview, userInfo, userProfile };
            }
            catch (error) {
                console.error("Error fetching interview with user info:", error);
                return null;
            }
        });
    }
    checkInterviewAccess(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const interview = yield this._voiceInterviewRepository.findOne({ _id: payload === null || payload === void 0 ? void 0 : payload.id, interviewFor: payload === null || payload === void 0 ? void 0 : payload.userId });
                if (!interview)
                    return null;
                const userInfo = yield this._userRepository.findById(interview.interviewFor);
                return { interview, userInfo };
            }
            catch (error) {
                console.error("Error fetching interview with user info:", error);
                return null;
            }
        });
    }
    inteviewConversation(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = `
            You are a helpful and professional AI interview assistant having a real-time voice conversation with a candidate.
            
            The current interview question is:
            "${payload === null || payload === void 0 ? void 0 : payload.question}"
            
            The candidate responded with:
            "${payload === null || payload === void 0 ? void 0 : payload.answer}"
            
            If the candidate asks for clarification or to repeat the question, kindly and clearly repeat the original question exactly as it was asked.
            
            If the candidate struggles or gives an incomplete or unclear answer, respond kindly and offer gentle encouragement or a helpful explanation to guide them. For example, you might say:
            "That's okay, take your time. Here's a hint to help you think it through..."
            
            If the candidate gives a good or partial answer, encourage them warmly like a supportive interviewer. Use phrases like:
            "Good job! That was a solid answer." or "Thanks for sharing that! Let's keep going."
            
            If the answer is not clear-cut or mostly incorrect, provide the correct answer along with a helpful suggestion. Then continue to the next question.
            
            If the user says something like "skip" or "move to the next question", or if the answer is mostly correct, give feedback and a suggestion — then transition using the phrase "Next question".
            
            Keep your responses natural, concise, friendly, and easy to understand — as if speaking in real time during a live interview. Avoid any prefixes, formatting, or complex language. Use plain, spoken language.
            
            There are ${payload === null || payload === void 0 ? void 0 : payload.questions} questions remaining in the interview. Consider the remaining time ${payload === null || payload === void 0 ? void 0 : payload.time} left and move to the next question accordingly.
            `;
                const getResponse = yield (0, gemini_1.askGemini)(prompt);
                const createPayload = {
                    interviewId: new mongoose_1.Types.ObjectId(payload === null || payload === void 0 ? void 0 : payload.interviewId),
                    question: payload === null || payload === void 0 ? void 0 : payload.question,
                    aiResponse: getResponse,
                    userAnswer: payload === null || payload === void 0 ? void 0 : payload.answer
                };
                if (getResponse) {
                    const saveConversation = yield this._interviewConversationRepository.create(createPayload);
                    if (saveConversation) {
                        return getResponse;
                    }
                }
            }
            catch (error) {
                console.error("Error fetching interview with user info:", error);
                return null;
            }
        });
    }
    getFeedback(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                const interview = yield this._voiceInterviewRepository.findById(id);
                if (!interview)
                    return null;
                const userInfo = yield this._userRepository.findById(interview.interviewFor);
                if (!userInfo)
                    return null;
                const alreadyExist = yield this._voiceInterviewFeedbackRepository.findById(interview === null || interview === void 0 ? void 0 : interview.feedBackId);
                if (alreadyExist) {
                    return {
                        interview,
                        userInfo,
                        feedback: alreadyExist,
                    };
                }
                const conversations = yield this._interviewConversationRepository.findAll({
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
                const getResponse = yield (0, gemini_1.askGemini)(prompt);
                console.log("🧠 Raw Gemini Response:", getResponse);
                const clean = (0, gemini_1.sanitizeGeminiResponse)(getResponse);
                const feedbackJson = JSON.parse(clean);
                if ((_a = feedbackJson === null || feedbackJson === void 0 ? void 0 : feedbackJson.feedback) === null || _a === void 0 ? void 0 : _a.rating) {
                    const data = {
                        interviewId: new mongoose_1.Types.ObjectId(interview._id),
                        technicalSkills: Number(((_b = feedbackJson.feedback.rating) === null || _b === void 0 ? void 0 : _b.technicalSkills) || 0),
                        communication: Number(((_c = feedbackJson.feedback.rating) === null || _c === void 0 ? void 0 : _c.communication) || 0),
                        problemSolving: Number(((_d = feedbackJson.feedback.rating) === null || _d === void 0 ? void 0 : _d.problemSolving) || 0),
                        experience: Number(((_e = feedbackJson.feedback.rating) === null || _e === void 0 ? void 0 : _e.experience) || 0),
                        summary: String(feedbackJson.feedback.summary || ""),
                        recommendation: String(feedbackJson.feedback.recommendation || ""),
                        recommendationMsg: String(feedbackJson.feedback.recommendationMsg || ""),
                    };
                    const feedbackCreated = yield this._voiceInterviewFeedbackRepository.create(data);
                    yield this._voiceInterviewRepository.update(interview._id, { feedBackId: feedbackCreated === null || feedbackCreated === void 0 ? void 0 : feedbackCreated._id.toString() });
                    return {
                        interview,
                        userInfo,
                        feedback: feedbackCreated,
                    };
                }
                else {
                    console.warn("⚠️ Feedback JSON structure invalid or missing required fields.", feedbackJson);
                    return null;
                }
            }
            catch (error) {
                console.error("Error fetching interview with user info:", error);
                return null;
            }
        });
    }
    removeVoiceInterview(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const interview = yield this._voiceInterviewRepository.update(payload.id, { isDeleted: true });
            if (!interview) {
                return false; // Interview not found or update failed
            }
            yield this._voiceInterviewFeedbackRepository.findOneAndDelete({ _id: interview.feedBackId });
            yield this._interviewConversationRepository.deleteMany({ interviewId: interview._id });
            return true;
        });
    }
}
exports.AiService = AiService;
