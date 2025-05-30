"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const enums_1 = require("../utils/enums");
const constants_1 = require("../utils/constants");
const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err.message);
    res.status(enums_1.StatusCode.INTERNAL_SERVER_ERROR).json({
        error: constants_1.GeneralServerErrorMsg.INTERNAL_SERVER_ERROR,
        details: err.message,
    });
};
exports.errorHandler = errorHandler;
