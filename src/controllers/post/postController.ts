import { Request, Response } from "express";
import { IPostService } from "../../services/interface/IPostService";
import { StatusCode } from "../../utils/enums";
import { IPostController } from "../interface/IPostController";
import { PostSuccessMsg } from "../../utils/constants";
import { uploadFileToCloudinary } from "../../utils/uploadToCloudinary";
import { ILikeService } from "../../services/interface/ILikeService";

export class PostController implements IPostController {
    private _postService: IPostService;
    constructor(_postService: IPostService) {
        this._postService = _postService;
    }

    async createPost(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body;
            const id = req.params.id;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            let imageUrls: string[] = [];

            if (files && files.images) {
                for (const file of files.images) {
                    if (file.mimetype.startsWith('image/')) {
                        const url = await uploadFileToCloudinary(file.buffer, 'image', 'post_images');
                        imageUrls.push(url);
                    } else {
                        throw new Error('Only image files are allowed in images field.');
                    }
                }
            }

            // Fallback if frontend also sends image URLs in body
            if (payload.imageUrls) {
                const parsed = typeof payload.imageUrls === 'string' ? JSON.parse(payload.imageUrls) : payload.imageUrls;
                imageUrls = [...imageUrls, ...parsed];
            }

            payload.imageUrls = imageUrls;

            const response = await this._postService.createPost(payload, id);
            res.status(StatusCode.OK).json({
                success: true,
                message: PostSuccessMsg.CREATED,
                post: response,
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
        }
    }

    async getRecentPosts(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._postService.getRecentPosts(id)
            res.status(StatusCode.OK).json({
                success: true,
                posts: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async getAllPosts(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body

            const response = await this._postService.getAllPosts(payload)
            res.status(StatusCode.OK).json({
                success: true,
                posts: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async getUserPosts(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const query = (req.query.querys as string) || "";
            const userId = (req.query.userId as string) || "";

            const { posts, totalPosts } = await this._postService.getUserPosts(page,
                pageSize,
                query,
                userId)
            res.status(StatusCode.OK).json({
                success: true,
                posts,
                totalPosts
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async getPost(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._postService.getPost(id)
            res.status(StatusCode.OK).json({
                success: true,
                post: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async updatePost(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body

            const id = req.params.id
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            console.log('files:', files);

            let imageUrls: string[] = [];

            if (files && files.images) {
                for (const file of files.images) {
                    if (file.mimetype.startsWith('image/')) {
                        const url = await uploadFileToCloudinary(file.buffer, 'image', 'post_images');
                        imageUrls.push(url);
                    } else {
                        throw new Error('Only image files are allowed in images field.');
                    }
                }
            }

            // Fallback if frontend also sends image URLs in body
            if (payload.imageUrls) {
                const parsed = typeof payload.imageUrls === 'string' ? JSON.parse(payload.imageUrls) : payload.imageUrls;
                imageUrls = [...imageUrls, ...parsed];
            }

            payload.imageUrls = imageUrls.length > 0 ? imageUrls : payload.images

            console.log(payload)

            const response = await this._postService.updatePost(payload, id
            )
            res.status(StatusCode.OK).json({
                success: true,
                message: 'Post Updated',
                post: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async toggleStatus(req: Request, res: Response): Promise<void> {
        try {
            const status = req.body.status
            const id = req.params.id
            const response = await this._postService.toggleStatus(status, id
            )
            res.status(StatusCode.OK).json({
                success: true,
                message: status === true ? "Post Recoverd" : "Post Removed",
                post: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async likePost(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const id = req.params.id
            const response = await this._postService.likePost(id, payload?.postId)
            res.status(StatusCode.OK).json({
                success: true,
                post: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async commentpost(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const id = req.params.id
            const response = await this._postService.commentpost(id, payload)
            res.status(StatusCode.OK).json({
                success: true,
                post: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async replyComment(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const id = req.params.id
            const response = await this._postService.replyComment(id, payload)
            res.status(StatusCode.OK).json({
                success: true,
                post: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async nestesReply(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const id = req.params.id
            const response = await this._postService.nestesReply(id, payload)
            res.status(StatusCode.OK).json({
                success: true,
                post: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async getReplies(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._postService.getReplies(payload)
            res.status(StatusCode.OK).json({
                success: true,
                replies: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async removeComment(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._postService.removeComment(id)
            res.status(StatusCode.OK).json({
                success: true,
                replies: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async removeReply(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._postService.removeReply(id)
            res.status(StatusCode.OK).json({
                success: true,
                replies: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async removeNestedReply(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._postService.removeNestedReply(id)
            res.status(StatusCode.OK).json({
                success: true,
                replies: response
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async getUserAllPosts(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const id = (req.query.id as string) || "";
            const role = (req.query.role as string) || "";
            const userId = (req.query.userId as string) || "";

            const { posts, totalPosts } = await this._postService.getUserAllPosts(page,
                pageSize,
                id,
                userId,
                role
            )
            res.status(StatusCode.OK).json({
                success: true,
                posts,
                totalPosts,
                totalPages: totalPosts && Math.ceil(totalPosts / pageSize),
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async savePost(req: Request, res: Response): Promise<void> {
        try {
            const payload = req.body
            const response = await this._postService.savePost(payload)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "Post Saved"
                })
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                    message: "Failed to save"
                })
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async removeSavedPost(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id
            const response = await this._postService.removeSavePost(id)
            if (response) {
                res.status(StatusCode.OK).json({
                    success: true,
                    message: "Post Removed"
                })
            } else {
                res.status(StatusCode.OK).json({
                    success: false,
                    message: "Failed to remove post"
                })
            }
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: err.message,
            });
            console.log('Error:', err.message);
        }
    }

    async getAllSavedPosts(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 10;
            const querys = (req.query.querys as string) || "";
            const userId = (req.query.id as string) || "";
            const role = (req.query.role as string) || "";

            const { posts, totalPosts } = await this._postService.getAllSavedPosts(
                page,
                pageSize,
                userId,
                querys,
                role
            );

            res.status(StatusCode.OK).json({
                success: true,
                posts,
                totalPosts,
                totalPages: totalPosts && Math.ceil(totalPosts / pageSize),
            });
        } catch (error) {
            const err = error as Error;
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: err.message,
            });
            console.log("Error fetching saved posts:", err.message);
        }
    }

}
