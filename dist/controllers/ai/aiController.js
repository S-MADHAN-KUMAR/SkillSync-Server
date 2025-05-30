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
exports.AiController = void 0;
const enums_1 = require("../../utils/enums");
const constants_1 = require("../../utils/constants");
class AiController {
    constructor(_aiService) {
        this._aiService = _aiService;
    }
    createMockInterview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const payload = req.body;
                const response = yield this._aiService.createMockInterview(payload, id);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: constants_1.MockInterviewSuccessMsg.CREATED,
                        interview: response,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: constants_1.MockInterviewErrorMsg.FAILED_TO_CREATED,
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getMockInterview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._aiService.getMockInterview(id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    interview: response,
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    saveAnswer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._aiService.saveAnswer(req.body, id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    message: constants_1.MockInterviewSuccessMsg.ANSWER_SAVED,
                    data: response,
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getAllMockInterviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const querys = req.query.querys || "";
                const id = req.query.id || "";
                const { interviews, totalInterviews } = yield this._aiService.getAllMockInterviews(page, pageSize, querys, id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    interviews: interviews,
                    totalInterviews: totalInterviews && Math.ceil(totalInterviews / pageSize)
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    checkAiAccess(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this._aiService.checkAiAccess(id);
                if (result) {
                    const { user, isHaveAccess } = result;
                    res.status(enums_1.StatusCode.OK).json({
                        success: isHaveAccess,
                        user,
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    removeInterview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const result = yield this._aiService.removeInterview(payload);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: 'Interview Deleted'
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    createInterview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employeeId = req.params.employeeId;
                const payload = req.body;
                const response = yield this._aiService.createInterview(payload, employeeId);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: constants_1.MockInterviewSuccessMsg.CREATED,
                        interview: response,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: constants_1.MockInterviewErrorMsg.FAILED_TO_CREATED,
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getAllVoiceInterviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 10;
                const querys = req.query.querys || "";
                const id = req.query.id || "";
                const { interviews, totalInterviews } = yield this._aiService.getAllVoiceInterviews(page, pageSize, querys, id);
                res.status(enums_1.StatusCode.OK).json({
                    success: true,
                    interviews: interviews,
                    totalInterviews: totalInterviews && Math.ceil(totalInterviews / pageSize)
                });
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getAllCandidates(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this._aiService.getAllCandidates();
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        users: response
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getInterview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._aiService.getInterview(id);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        interview: response
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    checkInterviewAccess(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._aiService.checkInterviewAccess(payload);
                if (response !== null) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        interview: response
                    });
                }
                else {
                    res.status(enums_1.StatusCode.OK).json({
                        success: false,
                        message: "You don'thave access to join the interview !"
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    askAnswer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const response = yield this._aiService.inteviewConversation(payload);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: constants_1.MockInterviewSuccessMsg.CREATED,
                        answer: response,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: constants_1.MockInterviewErrorMsg.FAILED_TO_CREATED,
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    getFeedback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._aiService.getFeedback(id);
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        interview: response
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
    removeVoiceInterview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const response = yield this._aiService.removeVoiceInterview({ id });
                if (response) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                        message: "Interview removed successfully!"
                    });
                }
            }
            catch (error) {
                const err = error;
                res.status(enums_1.StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    }
}
exports.AiController = AiController;
