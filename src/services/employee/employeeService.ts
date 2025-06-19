import { FilterQuery, Types, UpdateQuery } from "mongoose";
import { IEmployeeProfile } from "../../interfaces/IEmployeeProfile";
import { IJobPost } from "../../interfaces/IJobPost";
import { IUser } from "../../interfaces/IUser";
import { IEmployeeRepository } from "../../repositories/interface/IEmployeeRepository";
import { IJobPostRepository } from "../../repositories/interface/IJobPostRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { JobPostErrorMessages, UserErrorMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { HttpError } from "../../utils/httpError";
import { IEmployeeService } from "../interface/IEmployeeService";
import { IApplicationsRepository } from "../../repositories/interface/IApplicationsRepository";
import { ISaveJobsRepository } from "../../repositories/interface/ISaveJobsRepository";
import { ISaveCandidateRepository } from "../../repositories/interface/ISaveCandidateRepository";
import { IPostRepository } from "../../repositories/interface/IPostRepository";
import { ISavedJobs } from "../../interfaces/IISavedJobs";

export class EmployeeService implements IEmployeeService {
    private _employeeRepository: IEmployeeRepository;
    private _postRepository: IPostRepository;
    private _userRepository: IUserRepository;
    private _jobRepository: IJobPostRepository
    private _applicationRepository: IApplicationsRepository
    private _savedJobsRepository: ISaveJobsRepository
    private _savedCandidatesRepository: ISaveCandidateRepository

    constructor(_employeeRepository: IEmployeeRepository, _userRepository: IUserRepository, _jobRepository: IJobPostRepository, _applicationRepository: IApplicationsRepository, _savedJobsRepository: ISaveJobsRepository, _savedCandidatesRepository: ISaveCandidateRepository, _postRepository: IPostRepository

    ) {
        this._employeeRepository = _employeeRepository;
        this._userRepository = _userRepository;
        this._jobRepository = _jobRepository;
        this._applicationRepository = _applicationRepository;
        this._savedJobsRepository = _savedJobsRepository;
        this._savedCandidatesRepository = _savedCandidatesRepository;
        this._postRepository = _postRepository;
    }

    async updateOrCreate(payload: Partial<IEmployeeProfile>, id: string): Promise<{ response: IEmployeeProfile | null, userData: IUser | null }> {
        const userFound = await this._userRepository.findOne({
            _id: id,
            role: 'employee'
        });

        if (!userFound) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const updatedPayload = {
            ...payload,
            userId: id
        };

        const employeeProfileExist = await this._employeeRepository.findOne({ userId: id });

        let response: IEmployeeProfile | null;
        let updatedUser: IUser | null = null;

        if (!employeeProfileExist) {
            response = await this._employeeRepository.create(updatedPayload);
            if (response) {
                updatedUser = await this._userRepository.update(id, { employeeProfileId: response?._id, profile: response?.logo });
            }
        } else {
            response = await this._employeeRepository.update(employeeProfileExist?._id as string, updatedPayload);
            updatedUser = await this._userRepository.update(id, { employeeProfileId: response?._id, profile: response?.logo });
            await this._jobRepository.updateMany(
                { employeeId: updatedUser?._id },
                {
                    logo: response?.logo,
                    companyName: response?.companyName,
                } as UpdateQuery<IJobPost>
            );
        }

        return { response, userData: updatedUser };
    }

    async getEmployeeProfile(id: string): Promise<IEmployeeProfile | null> {
        const response = await this._employeeRepository.findById(id)
        if (response) {
            return response
        } else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async createJob(payload: IJobPost): Promise<IJobPost | null> {
        if (!payload.employeeId) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.BAD_REQUEST);
        }

        const found = await this._employeeRepository.findOne({ userId: payload.employeeId });

        if (!found) {
            throw new HttpError(JobPostErrorMessages.JOB_FAILD_TO_CREATE, StatusCode.NOT_FOUND);
        }

        const response = await this._jobRepository.create({
            ...payload,
            logo: found.logo,
            companyName: found.companyName,
        });

        if (!response) {
            throw new HttpError(JobPostErrorMessages.JOB_FAILD_TO_CREATE, StatusCode.BAD_REQUEST);
        }

        await this._employeeRepository.updateMany(
            { userId: payload.employeeId },
            { $push: { jobPosts: response._id } }
        );

        return response;
    }

    async updateJob(payload: IJobPost, id: string): Promise<IJobPost | null> {
        const response = await this._jobRepository.update(id, payload)
        if (response) {
            return response
        } else {
            throw new HttpError(JobPostErrorMessages.JOB_FAILD_TO_CREATE, StatusCode.BAD_REQUEST)
        }
    }

    async getAllJobs(
        page: number,
        pageSize: number,
        querys?: string,
        id?: string,              // <- 4th param
        location?: string,
        jobType?: string,
        salary?: string,
        skill?: string,
        active?: boolean,         // <- 9th param
        expiredBefore?: Date,
    ): Promise<{ jobs: (IJobPost & { isSavedJob: boolean; savedJobId?: string })[] | null; totalJobs: number }> {

        const skip = (page - 1) * pageSize;
        const filter: FilterQuery<IJobPost> = {};

        if (querys) {
            filter.jobTitle = { $regex: querys, $options: 'i' };
        }

        if (location) {
            filter.state = { $regex: location, $options: 'i' };
        }

        if (jobType) {
            filter.jobType = jobType;
        }

        if (salary) {
            const salaryValue = Number(salary);
            if (!isNaN(salaryValue)) {
                filter.$or = [
                    { minSalary: { $lte: salaryValue } },
                    { maxSalary: { $gte: salaryValue } }
                ];
            }
        }

        if (skill) {
            filter.tags = { $in: [skill] };
        }

        if (active && typeof active === 'boolean') {
            filter.status = active;
        }

        if (expiredBefore && expiredBefore instanceof Date) {
            filter.expiredAt = { $gte: expiredBefore };
        }

        // Step 1: Fetch jobs and total count
        const jobs = await this._jobRepository.findAll(filter, skip, pageSize);
        const totalJobs = await this._jobRepository.countDocuments(filter);

        // Step 2: Enrich jobs with isSavedJob if user id provided
        if (id && jobs && jobs.length > 0) {
            const objectUserId = new Types.ObjectId(id);

            // Get all saved jobs for the user
            const savedJobs = await this._savedJobsRepository.findAll({
                userId: objectUserId,
                isDeleted: false,
            });

            const savedJobMap = new Map<string, { _id: string }>();
            savedJobs.forEach((saved: ISavedJobs) => {
                savedJobMap.set(saved.jobId.toString(), { _id: saved?._id.toString() });
            });

            // Attach isSavedJob & savedJobId to each job
            const enrichedJobs = jobs.map((job: IJobPost) => {
                const jobId = job?._id.toString();
                const savedEntry = savedJobMap.get(jobId);

                return {
                    ...job.toObject?.() ?? job,
                    isSavedJob: !!savedEntry,
                    savedJobId: savedEntry?._id,
                };
            });

            return { jobs: enrichedJobs, totalJobs };
        }

        if (jobs) {
            // If no user ID, return jobs without isSavedJob
            const enrichedJobs = jobs.map(job => ({
                ...job.toObject?.() ?? job,
                isSavedJob: false,
            }));
            return { jobs: enrichedJobs, totalJobs };
        } else {
            throw new HttpError(JobPostErrorMessages.JOB_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async getRecentJobs(id: string): Promise<IJobPost[] | null> {
        const response = await this._jobRepository.findRecentJobs(id)
        if (response) {
            return response
        } else {
            throw new HttpError(JobPostErrorMessages.JOB_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async editJob(id: string, payload: IJobPost): Promise<IJobPost | null> {
        const response = await this._jobRepository.update(id, payload)
        if (response) {
            return response
        } else {
            throw new HttpError(JobPostErrorMessages.JOB_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }

    async toggleStatus(id: string, currentStatus: boolean): Promise<boolean> {

        const updatedStatus = !currentStatus;
        console.log("Updated Status:", updatedStatus);

        const response = await this._jobRepository.update(id, { status: updatedStatus });
        if (!response) {
            throw new HttpError(JobPostErrorMessages.JOB_NOT_FOUND, StatusCode.NOT_FOUND);
        }
        return true;
    }

    async getJobs(
        id: string,
        page: number,
        pageSize: number,
        querys?: string,
        location?: string,
        jobType?: string,
        salary?: string
    ): Promise<{ jobs: IJobPost[]; totalJobs: number }> {

        const skip = (page - 1) * pageSize;

        const filter: FilterQuery<IJobPost> = {
            employeeId: id
        };

        if (querys) {
            filter.jobTitle = { $regex: querys, $options: 'i' };
        }

        if (location) {
            filter.state = { $regex: location, $options: 'i' };
        }

        if (jobType) {
            filter.jobType = jobType;
        }

        if (salary) {
            const salaryValue = Number(salary);
            if (!isNaN(salaryValue)) {
                filter.$or = [
                    { minSalary: { $lte: salaryValue } },
                    { maxSalary: { $gte: salaryValue } }
                ];
            }
        }

        const jobs = await this._jobRepository.findAll(filter, skip, pageSize);
        const totalJobs = await this._jobRepository.countDocuments(filter);

        if (jobs && jobs.length > 0) {
            return { jobs, totalJobs };
        } else {
            throw new HttpError(JobPostErrorMessages.JOB_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }


    async getJob(payload: { id: string, userId: string }): Promise<IJobPost[] | IJobPost> {
        try {
            const id = payload?.id
            const userId = payload?.userId
            // 1. Find the job by ID
            const job = await this._jobRepository.findById(id);
            if (!job) {
                throw new HttpError("Job not found", StatusCode.BAD_REQUEST);
            }

            // 2. Check if the user has an application for this job
            const application = await this._applicationRepository.findOne({
                jobId: id,
                candidateId: userId,
                isDeleted: false
            });

            // 3. Return job with application if exists
            return application
                ? { ...job.toObject(), application }
                : job;
        } catch (error) {
            console.error("Error in getJob:", error);
            throw new HttpError("Failed to fetch job details", StatusCode.BAD_REQUEST);
        }
    }

    async getEmployeeDetail(id: string): Promise<IEmployeeProfile> {

        const response = await this._employeeRepository.findById(id);

        if (response) {
            return response
        } else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async getAllEmployees(
        page: number,
        pageSize: number,
        querys?: string,
        location?: string,
        omit?: string
    ): Promise<{ employees: IEmployeeProfile[]; totalEmployees: number }> {

        const { employees, totalEmployees } = await this._employeeRepository.findAllEmployees(page,
            pageSize,
            querys,
            location,
            omit)

        return { employees, totalEmployees }

    }

    async getStatistics(id: string): Promise<{
        totalJobs: number,
        savedPosts: number,
        savedCandidates: number
    } | null> {
        const totalJobs = await this._jobRepository.countDocuments({ employeeId: id })
        const savedPosts = await this._postRepository.countDocuments({ userId: id, isDeleted: false })
        const savedCandidates = await this._savedCandidatesRepository.countDocuments({
            userId: id,
            isDeleted: false
        })
        console.log(totalJobs,
            savedPosts,
            savedCandidates
        )
        if (totalJobs &&
            savedPosts &&
            savedCandidates) {
            return {
                totalJobs,
                savedPosts,
                savedCandidates
            }
        } else {
            throw new HttpError(JobPostErrorMessages.JOB_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }
}