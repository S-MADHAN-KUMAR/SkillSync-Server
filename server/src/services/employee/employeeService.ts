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

export class EmployeeService implements IEmployeeService {
    private _employeeRepository: IEmployeeRepository;
    private _userRepository: IUserRepository;
    private _jobRepository: IJobPostRepository

    constructor(_employeeRepository: IEmployeeRepository, _userRepository: IUserRepository, _jobRepository: IJobPostRepository) {
        this._employeeRepository = _employeeRepository;
        this._userRepository = _userRepository;
        this._jobRepository = _jobRepository;
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
                updatedUser = await this._userRepository.update(id, { employeeProfileId: response?._id });
            }
        } else {
            response = await this._employeeRepository.update(employeeProfileExist?._id as string, updatedPayload);
            updatedUser = await this._userRepository.update(id, { employeeProfileId: response?._id });
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
        location?: string,
        jobType?: string,
        salary?: string,
        skill?: string,
        active?: boolean,
        expiredBefore?: Date
    ): Promise<{ jobs: IJobPost[] | null; totalJobs: number }> {

        const skip = (page - 1) * pageSize;
        const filter: any = {};

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

        if (
            expiredBefore &&
            expiredBefore instanceof Date) {
            filter.expiredAt = { $gte: expiredBefore };
        }


        const jobs = await this._jobRepository.findAll(filter, skip, pageSize);
        const totalJobs = await this._jobRepository.countDocuments(filter);

        if (jobs) {
            return { jobs, totalJobs };
        } else {
            throw new HttpError(JobPostErrorMessages.JOB_NOT_FOUND, StatusCode.NOT_FOUND);
        }
    }

    async getRecentJobs(): Promise<IJobPost[] | null> {
        const response = await this._jobRepository.findRecentJobs()
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

    async getJobs(id: string): Promise<IJobPost | null> {
        const response = await this._jobRepository.findById(id)
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

}