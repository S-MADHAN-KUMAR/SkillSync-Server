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
exports.FollowController = void 0;
const enums_1 = require("../../utils/enums");
class FollowController {
    constructor(_followService) {
        this._followService = _followService;
    }
    request(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const result = yield this._followService.request(payload);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Follow already exists or request failed.",
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
    accept(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                console.log('req.body', req.body);
                const result = yield this._followService.accept(payload);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Follow already exists or request failed.",
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
    cancel(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                console.log('req.body', req.body);
                const result = yield this._followService.cancel(payload);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Follow already exists or request failed.",
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
    unfollow(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                console.log('req.body', req.body);
                const result = yield this._followService.unfollow(payload);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Follow already exists or request failed.",
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
exports.FollowController = FollowController;
