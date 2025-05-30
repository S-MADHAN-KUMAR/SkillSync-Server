import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';

export const uploadFileToCloudinary = async (
    fileBuffer: Buffer,
    type: 'image' | 'pdf',
    folder: string
) => {
    try {
        const resourceType = type === 'pdf' ? 'raw' : 'image';
        const extension = type === 'pdf' ? '.pdf' : '';
        const publicId = `file_${Date.now()}${extension}`; // ensure extension for PDF

        return new Promise<string>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    resource_type: resourceType,
                    folder,
                    public_id: publicId,
                    use_filename: true,
                    unique_filename: false,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve(result.secure_url);
                    } else {
                        reject(new Error('Upload failed: No result returned from Cloudinary'));
                    }
                }
            );

            const readableStream = new Readable();
            readableStream.push(fileBuffer);
            readableStream.push(null);
            readableStream.pipe(stream);
        });
    } catch (error) {
        throw error;
    }
};
