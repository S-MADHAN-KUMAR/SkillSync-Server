"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionType = exports.VerifiedStatus = exports.Roles = exports.StatusCode = void 0;
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["OK"] = 200] = "OK";
    StatusCode[StatusCode["CREATED"] = 201] = "CREATED";
    StatusCode[StatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCode[StatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    StatusCode[StatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    StatusCode[StatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    StatusCode[StatusCode["CONFLICT"] = 409] = "CONFLICT";
    StatusCode[StatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(StatusCode || (exports.StatusCode = StatusCode = {}));
var Roles;
(function (Roles) {
    Roles["ADMIN"] = "admin";
    Roles["EMPLOYEE"] = "employee";
    Roles["CANDIDATE"] = "candidate";
})(Roles || (exports.Roles = Roles = {}));
var VerifiedStatus;
(function (VerifiedStatus) {
    VerifiedStatus["REJECTED"] = "rejected";
    VerifiedStatus["APPROVED"] = "approved";
    VerifiedStatus["PENDING"] = "pending";
})(VerifiedStatus || (exports.VerifiedStatus = VerifiedStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEBITED"] = "debit";
    TransactionType["CREDITED"] = "credit";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
