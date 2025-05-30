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
exports.ConnectionsController = void 0;
const enums_1 = require("../../utils/enums");
class ConnectionsController {
    constructor(_connectionsService) {
        this._connectionsService = _connectionsService;
    }
    request(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const result = yield this._connectionsService.request(payload);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Connection already exists or request failed.",
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
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const result = yield this._connectionsService.makeAllRead(id);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Connection already exists or request failed.",
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
                console.log(payload);
                const result = yield this._connectionsService.accept(payload);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Connection already exists or request failed.",
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
                const result = yield this._connectionsService.cancel(payload);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Connection already exists or request failed.",
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
    disconnect(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body;
                const result = yield this._connectionsService.disconnect(payload);
                if (result) {
                    res.status(enums_1.StatusCode.OK).json({
                        success: true,
                    });
                }
                else {
                    res.status(enums_1.StatusCode.BAD_REQUEST).json({
                        success: false,
                        message: "Connection already exists or request failed.",
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
exports.ConnectionsController = ConnectionsController;
