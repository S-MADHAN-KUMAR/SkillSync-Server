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
exports.uploadFileToCloudinary = void 0;
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadFileToCloudinary = (fileBuffer, type, folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resourceType = type === 'pdf' ? 'raw' : 'image';
        const extension = type === 'pdf' ? '.pdf' : '';
        const publicId = `file_${Date.now()}${extension}`; // ensure extension for PDF
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.default.uploader.upload_stream({
                resource_type: resourceType,
                folder,
                public_id: publicId,
                use_filename: true,
                unique_filename: false,
            }, (error, result) => {
                if (error) {
                    reject(error);
                }
                else if (result) {
                    resolve(result.secure_url);
                }
                else {
                    reject(new Error('Upload failed: No result returned from Cloudinary'));
                }
            });
            const readableStream = new stream_1.Readable();
            readableStream.push(fileBuffer);
            readableStream.push(null);
            readableStream.pipe(stream);
        });
    }
    catch (error) {
        throw error;
    }
});
exports.uploadFileToCloudinary = uploadFileToCloudinary;
