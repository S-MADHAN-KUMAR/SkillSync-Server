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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
function sendEmail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ to, subject, otp }) {
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.COMPANY_MAIL,
                pass: process.env.MAIL_PASSWORD,
            },
        });
        const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <div style="text-align: center;">
        <h1 style="color: #4e54c8;font-size: 20px">Welcome to SKILL-SYNC</h1>
        <p style="font-size: 16px;">Hello 👋</p>
        <p style="font-size: 18px; margin: 10px 0;">Your OTP code is:</p>
        <h1 style="background: #4e54c8; color: #fff; padding: 10px 20px; border-radius: 10px; display: inline-block;">
          ${otp}
        </h1>
        <p style="margin-top: 20px;">Please do not share this code with anyone. It will expire in 5 minutes.</p>
        <br/>
        <p style="font-size: 14px; color: #999;">– SKILL-SYNC Team</p>
      </div>
    </div>
  `;
        try {
            const info = yield transporter.sendMail({
                from: process.env.COMPANY_MAIL,
                to,
                subject,
                html: htmlContent,
            });
            console.log('Email sent:', info.response);
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    });
}
