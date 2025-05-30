import { Router } from "express";
import { postController } from "../config/dependencyInjector";
import upload from "../utils/upload";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Roles } from "../utils/enums";

const router = Router();


router.post(
    '/create/:id',
    upload.fields([
        { name: 'images', maxCount: 5 }
    ]), authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]),
    postController.createPost.bind(postController)
);

router.get('/recent/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.getRecentPosts.bind(postController));

router.post('/get/all', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.getAllPosts.bind(postController));

router.get('/get/user', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.getUserPosts.bind(postController));

router.get('/get/post/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.getPost.bind(postController));

router.post('/update/post/:id', upload.fields([
    { name: 'images', maxCount: 5 }
]), authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.updatePost.bind(postController));

router.put('/update/status/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.toggleStatus.bind(postController));

router.put('/like/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.likePost.bind(postController));

router.post('/comment/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.commentpost.bind(postController));

router.post('/reply/comment/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.replyComment.bind(postController));

router.put('/nested/reply/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.nestesReply.bind(postController));

router.post('/get/replies', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.getReplies.bind(postController));

router.get('/remove/comment/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.removeComment.bind(postController));

router.get('/remove/reply/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.removeReply.bind(postController));

router.get('/remove/nested/reply/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.removeNestedReply.bind(postController));

router.get('/get/user/posts', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.getUserAllPosts.bind(postController));

router.post('/save/post', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.savePost.bind(postController));

router.get('/remove/save/post/:id', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.removeSavedPost.bind(postController));

router.get('/get/savedPosts', authMiddleware([Roles.CANDIDATE, Roles.EMPLOYEE]), postController.getAllSavedPosts.bind(postController));

const postRoutes = router;
export default postRoutes;
