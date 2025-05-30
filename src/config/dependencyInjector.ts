import { AdminController } from "../controllers/admin/adminController";
import { AiController } from "../controllers/ai/aiController";
import { ApplicationsController } from "../controllers/applications/applicationsController";
import { CandidateController } from "../controllers/candidate/candidateController";
import { ConnectionsController } from "../controllers/connections/connectionsController";
import { EmployeeController } from "../controllers/employee/employeeController";
import { FollowController } from "../controllers/follow/followController";
import { IAdminControllers } from "../controllers/interface/IAdminController";
import { IAIController } from "../controllers/interface/IAIController";
import { IApplicationsControllers } from "../controllers/interface/IApplicationsController";
import { ICandidateControllers } from "../controllers/interface/ICandidateController";
import { IConnectionsController } from "../controllers/interface/IConnectionsController";
import { IEmployeeController } from "../controllers/interface/IEmployeeController";
import { IFollowController } from "../controllers/interface/IFollowController";
import { INotificationsController } from "../controllers/interface/INotificationsController";
import { IPostController } from "../controllers/interface/IPostController";
import { IUserController } from "../controllers/interface/IUserController";
import { NotificationsController } from "../controllers/notifications/notificationsController";
import { PostController } from "../controllers/post/postController";
import { UserController } from "../controllers/user/userController";
import { VoiceInterviewRepository } from "../repositories/ai/voiceInterviewRepository";
import { ApplicationsRepository } from "../repositories/applications/applicationRepository";
import { CandidateRepository } from "../repositories/candidate/candidateRepository";
import { CommentRepository } from "../repositories/comment/commentRepository";
import { ConnectionsRepository } from "../repositories/connections/connectionsRepository";
import { EmployeeRepository } from "../repositories/employee/employeeRepository";
import { FollowRepository } from "../repositories/follow/followRepository";
import { IAdminRepository } from "../repositories/interface/IAdminRepository";
import { IAIRepository } from "../repositories/interface/IAIRepository";
import { IApplicationsRepository } from "../repositories/interface/IApplicationsRepository";
import { ICandidateRepository } from "../repositories/interface/ICandidateRepository";
import { ICommentRepository } from "../repositories/interface/ICommentRepository";
import { IConnectionsRepository } from "../repositories/interface/IConnectionsRepository";
import { IEmployeeRepository } from "../repositories/interface/IEmployeeRepository";
import { IFollowRepository } from "../repositories/interface/IFollowRepository";
import { IInterviewConversationRepository } from "../repositories/interface/IInterviewConversationRepository";
import { IJobPostRepository } from "../repositories/interface/IJobPostRepository";
import { ILikeRepository } from "../repositories/interface/ILikeRepository";
import { INotificationsRepository } from "../repositories/interface/INotificationsRepository";
import { IPostRepository } from "../repositories/interface/IPostRepository";
import { IReplyRepository } from "../repositories/interface/IReplyRepository";
import { ISaveCandidateRepository } from "../repositories/interface/ISaveCandidateRepository";
import { ISaveJobsRepository } from "../repositories/interface/ISaveJobsRepository";
import { ISavePostsRepository } from "../repositories/interface/ISavePostsRepository";
import { IUserRepository } from "../repositories/interface/IUserRepository";
import { IVoiceInterviewFeedbackRepository } from "../repositories/interface/IVoiceInterviewFeedbackRepository";
import { IVoiceInterviewRepository } from "../repositories/interface/IVoiceInterviewRepository";
import { InterviewConversationRepository } from "../repositories/interviewConversation/interviewConversationRepository";
import { JobRepository } from "../repositories/jobPost/jobPostRepository";
import { LikeRepository } from "../repositories/like/likeRepository";
import { NotificationsRepository } from "../repositories/notification/notificationsRepository";
import { PostRepository } from "../repositories/post/postRepository";
import { ReplyRepository } from "../repositories/reply/replyRepository";
import { SaveCandidateRepository } from "../repositories/saved/saveCandidateRepository/saveCandidateRepository";
import { SaveJobsRepository } from "../repositories/saved/saveJobsRepository/saveJobsRepository";
import { SavePostsRepository } from "../repositories/saved/savePostRepository/savePostRepository";
import { UserRepository } from "../repositories/user/userRepository";
import { VoiceInterviewFeedbackRepository } from "../repositories/voiceInterviewFeedback/voiceInterviewFeedbackRepository";
import { AdminService } from "../services/admin/adminService";
import { AiService } from "../services/ai/aiService";
import { ApplicationsService } from "../services/applications/applicationsService";
import { CandidateService } from "../services/candidate/candidateService";
import { CommentService } from "../services/comment/commentService";
import { ConnectionsService } from "../services/connections/connectionsServices";
import { EmployeeService } from "../services/employee/employeeService";
import { FollowService } from "../services/follow/followService";
import { IAdminService } from "../services/interface/IAdminService";
import { IAIService } from "../services/interface/IAIService";
import { IApplicationsService } from "../services/interface/IApplicationsService";
import { ICandidateService } from "../services/interface/ICandidateService";
import { ICommentService } from "../services/interface/ICommentService";
import { IConnectionsService } from "../services/interface/IConnectionsService";
import { IEmployeeService } from "../services/interface/IEmployeeService";
import { IFollowService } from "../services/interface/IFollowService";
import { ILikeService } from "../services/interface/ILikeService";
import { INotificationsService } from "../services/interface/INotificationsService";
import { IPostService } from "../services/interface/IPostService";
import { IReplyService } from "../services/interface/IReplyService";
import { IUserService } from "../services/interface/IUserService";
import { LikeService } from "../services/like/likeService";
import { NotificationsService } from "../services/notifications/notificationsServices";
import { PostService } from "../services/post/postService";
import { ReplyService } from "../services/reply/replyService";
import { UserService } from "../services/user/userService";
import { AdminRepository } from "../repositories/admin/adminRepository";
import { AiRepository } from "../repositories/ai/aiRepository";
import { IMessageRepository } from "../repositories/interface/IMessageRepository";
import { MessageRepository } from "../repositories/message/messageRepository";
import { IMessageService } from "../services/interface/IMessageService";
import { IMessageController } from "../controllers/interface/IMessageController";

// Repositories
const userRepository: IUserRepository = new UserRepository();
const candidateRepository: ICandidateRepository = new CandidateRepository();
const employeeRepository: IEmployeeRepository = new EmployeeRepository();
const notificationsRepository: INotificationsRepository = new NotificationsRepository();
const connectionsRepository: IConnectionsRepository = new ConnectionsRepository();
const likeRepository: ILikeRepository = new LikeRepository();
const commentRepository: ICommentRepository = new CommentRepository();
const replyRepository: IReplyRepository = new ReplyRepository();
const postRepository: IPostRepository = new PostRepository();
const applicationsRepository: IApplicationsRepository = new ApplicationsRepository();
const jobRepository: IJobPostRepository = new JobRepository();
const followRepository: IFollowRepository = new FollowRepository();
const adminRepository: IAdminRepository = new AdminRepository();
const voiceInterviewRepository: IVoiceInterviewRepository = new VoiceInterviewRepository();
const interviewConversationRepository: IInterviewConversationRepository = new InterviewConversationRepository();
const voiceInterviewFeedbackRepository: IVoiceInterviewFeedbackRepository = new VoiceInterviewFeedbackRepository();
const aiRepository: IAIRepository = new AiRepository();
const savedPostsRepository: ISavePostsRepository = new SavePostsRepository();
const savedcandidateRepository: ISaveCandidateRepository = new SaveCandidateRepository();
const savedJobsRepository: ISaveJobsRepository = new SaveJobsRepository();
const messageRepository: IMessageRepository = new MessageRepository();

// Services
const userService: IUserService = new UserService(userRepository, savedcandidateRepository, candidateRepository);
const notificationsService: INotificationsService = new NotificationsService(notificationsRepository, employeeRepository)
const connectionsService: IConnectionsService = new ConnectionsService(connectionsRepository, userRepository, notificationsRepository);
const likeService: ILikeService = new LikeService(likeRepository);
const commentService: ICommentService = new CommentService(commentRepository);
const replyService: IReplyService = new ReplyService(replyRepository);
const postService: IPostService = new PostService(postRepository, userRepository, likeRepository, notificationsRepository, commentRepository, replyRepository, savedPostsRepository);
const employeeService: IEmployeeService = new EmployeeService(employeeRepository, userRepository, jobRepository, applicationsRepository, savedJobsRepository, savedcandidateRepository, postRepository);
const applicationsService: IApplicationsService = new ApplicationsService(candidateRepository, userRepository, applicationsRepository, jobRepository);
const candidateService: ICandidateService = new CandidateService(
    candidateRepository,
    userRepository,
    connectionsRepository,
    savedJobsRepository,
    jobRepository,
    savedcandidateRepository,
    applicationsRepository,
    messageRepository
);
const followService: IFollowService = new FollowService(followRepository, userRepository, notificationsRepository, employeeRepository);
const adminService: IAdminService = new AdminService(
    userRepository,
    jobRepository,
    postRepository
);
const aiService: IAIService = new AiService(
    aiRepository,
    userRepository,
    voiceInterviewRepository,
    interviewConversationRepository,
    voiceInterviewFeedbackRepository,
    candidateRepository,
    employeeRepository
);

// Controllers
const userController: IUserController = new UserController(userService);
const notificationsController: INotificationsController = new NotificationsController(notificationsService);
const connectionsController: IConnectionsController = new ConnectionsController(connectionsService);
const postController: IPostController = new PostController(postService);
const employeeController: IEmployeeController = new EmployeeController(employeeService);
const applicationsController: IApplicationsControllers = new ApplicationsController(applicationsService);
const candidateController: ICandidateControllers = new CandidateController(candidateService);
const followController: IFollowController = new FollowController(followService);
const adminController: IAdminControllers = new AdminController(adminService, userService, postService);
const aiController: IAIController = new AiController(aiService);

// Export
export {
    userController,
    candidateController,
    employeeController,
    adminController,
    aiController,
    postController,
    connectionsController,
    notificationsController,
    followController,
    applicationsController
};
