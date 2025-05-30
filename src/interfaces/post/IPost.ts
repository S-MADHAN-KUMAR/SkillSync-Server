import { Types, Document } from "mongoose";
import { Roles } from "../../utils/enums";

export interface IPost extends Document {
    userId: Types.ObjectId | string;
    role: Roles.EMPLOYEE | Roles.CANDIDATE | Roles.ADMIN;
    posterName: string;
    posterAvatar?: string;
    description: string;
    imageUrls?: string[];
    tags?: string[];
    likesCount: number;
    commentsCount: number;
    isEdited: boolean;
    status: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
