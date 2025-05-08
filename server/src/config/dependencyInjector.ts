import { AdminController } from "../controllers/admin/adminController";
import { AiController } from "../controllers/ai/aiController";
import { CandidateController } from "../controllers/candidate/candidateController";
import { EmployeeController } from "../controllers/employee/employeeController";
import { IAdminControllers } from "../controllers/interface/IAdminController";
import { IAIController } from "../controllers/interface/IAIController";
import { ICandidateControllers } from "../controllers/interface/ICandidateController";
import { IEmployeeController } from "../controllers/interface/IEmployeeController";
import { IUserController } from "../controllers/interface/IUserController";
import { UserController } from "../controllers/user/userController";
import { AdminRepository } from "../repositories/admin/adminRepository";
import { AiRepository } from "../repositories/ai/aiRepository";
import { CandidateRepository } from "../repositories/candidate/candidateRepository";
import { EmployeeRepository } from "../repositories/employee/employeeRepository";
import { IAdminRepository } from "../repositories/interface/IAdminRepository";
import { IAIRepository } from "../repositories/interface/IAIRepository";
import { ICandidateRepository } from "../repositories/interface/ICandidateRepository";
import { IEmployeeRepository } from "../repositories/interface/IEmployeeRepository";
import { IJobPostRepository } from "../repositories/interface/IJobPostRepository";
import { IUserRepository } from "../repositories/interface/IUserRepository";
import { JobRepository } from "../repositories/jobPost/jobPostRepository";
import { UserRepository } from "../repositories/user/userRepository";
import { AdminService } from "../services/admin/adminService";
import { AiService } from "../services/ai/aiService";
import { CandidateService } from "../services/candidate/candidateService";
import { EmployeeService } from "../services/employee/employeeService";
import { IAdminService } from "../services/interface/IAdminService";
import { IAIService } from "../services/interface/IAIService";
import { ICandidateService } from "../services/interface/ICandidateService";
import { IEmployeeService } from "../services/interface/IEmployeeService";
import { IUserService } from "../services/interface/IUserService";
import { UserService } from "../services/user/userService";


const userRepository: IUserRepository = new UserRepository();
const userService: IUserService = new UserService(
    userRepository
);
const userController: IUserController = new UserController(userService);


const aiRepository: IAIRepository = new AiRepository();
const aiService: IAIService = new AiService(
    aiRepository, userRepository
);
const aiController: IAIController = new AiController(aiService);

const candidateRepository: ICandidateRepository = new CandidateRepository();
const candidateService: ICandidateService = new CandidateService(
    candidateRepository, userRepository
);
const candidateController: ICandidateControllers = new CandidateController(candidateService);


const jobRepository: IJobPostRepository = new JobRepository();
const employeeRepository: IEmployeeRepository = new EmployeeRepository();
const employeeService: IEmployeeService = new EmployeeService(
    employeeRepository, userRepository, jobRepository
);
const employeeController: IEmployeeController = new EmployeeController(employeeService);


const adminRepository: IAdminRepository = new AdminRepository();
const adminService: IAdminService = new AdminService();
const adminController: IAdminControllers = new AdminController(adminService, userService);


export {
    userController,
    candidateController,
    employeeController,
    adminController,
    aiController
}