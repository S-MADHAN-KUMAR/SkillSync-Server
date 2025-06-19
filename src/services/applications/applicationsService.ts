import { application } from "express";
import { IApplicationModel } from "../../interfaces/IApplicationModel";
import { IJobPost } from "../../interfaces/IJobPost";
import { IApplicationsRepository } from "../../repositories/interface/IApplicationsRepository";
import { ICandidateRepository } from "../../repositories/interface/ICandidateRepository";
import { IJobPostRepository } from "../../repositories/interface/IJobPostRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { StatusCode } from "../../utils/enums";
import { HttpError } from "../../utils/httpError";
import { IApplicationsService } from "../interface/IApplicationsService";
import mongoose, { FilterQuery, ObjectId } from "mongoose";
import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import { status } from "../../types/types";


export class ApplicationsService implements IApplicationsService {
    private _candidateRepository: ICandidateRepository;
    private _userRepository: IUserRepository;
    private _applicationRepository: IApplicationsRepository;
    private _jobPostRepository: IJobPostRepository;

    constructor(_candidateRepository: ICandidateRepository, _userRepository: IUserRepository, _applicationRepository: IApplicationsRepository, _jobPostRepository: IJobPostRepository) {
        this._candidateRepository = _candidateRepository;
        this._userRepository = _userRepository;
        this._applicationRepository = _applicationRepository;
        this._jobPostRepository = _jobPostRepository;
    }




    async apply(payload: {
        jobId: string,
        candidateId: string
    }): Promise<{ status: 'applied' | 'reviewed' | 'interview' | 'hired' | 'rejected' | null }> {
        const exist = await this._applicationRepository.findOne({
            jobId: payload?.jobId,
            candidateId: payload?.candidateId,
            status: "applied"
        });

        if (exist) {
            throw new HttpError('Already Applied. Please wait for a response.', StatusCode.OK);
        }

        const res = await this._applicationRepository.create({
            jobId: new mongoose.Types.ObjectId(payload?.jobId.toString()),
            candidateId: new mongoose.Types.ObjectId(payload?.candidateId.toString()),
            status: "applied",
            appliedAt: new Date(),
            isDeleted: false
        });

        if (res) {
            // Increment application count in JobPost
            await this._jobPostRepository.incrementField(res.jobId.toString(), "applications", 1);

            return { status: "applied" };
        } else {
            return { status: null };
        }
    }

    async updateApplicationStatus(payload: { id: string, status: "applied" | "reviewed" | "interview" | "hired" | "rejected" }): Promise<boolean | null> {
        const updated = await this._applicationRepository.update(payload?.id, { status: payload?.status })
        if (updated) {
            return true
        } else {
            return false
        }
    }

    async getAllApplications(payload: {
        page: number;
        pageSize: number;
        query: string;
        jobId: string;
    }): Promise<{
        applications: (IApplicationModel & { candidateProfile: ICandidateProfile })[];
        totalPages: number;
    } | null> {
        const { page, pageSize, query, jobId } = payload;

        const job = await this._jobPostRepository.findOne({ _id: jobId, status: true });
        if (!job) return null;

        const skip = (page - 1) * pageSize;

        const filter: FilterQuery<ICandidateProfile | IApplicationModel> = { jobId };

        // Get all matching candidateIds if a query is provided
        let matchedCandidateIds: string[] = [];
        if (query) {
            const matchingProfiles = await this._candidateRepository.findAll({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { bio: { $regex: query, $options: 'i' } }
                ]
            });

            matchedCandidateIds = matchingProfiles.map(profile => profile.userId.toString());

            // If no candidate matches the search, return empty results early
            if (matchedCandidateIds.length === 0) {
                return {
                    applications: [],
                    totalPages: 0
                };
            }

            filter.candidateId = { $in: matchedCandidateIds };
        }

        const [applications, totalApplications] = await Promise.all([
            this._applicationRepository.findAll(filter, skip, pageSize),
            this._applicationRepository.countDocuments(filter)
        ]);

        const applicationsWithProfiles = await Promise.all(
            applications.map(async (application) => {
                const candidateProfile = await this._candidateRepository.findOne({
                    userId: application.candidateId,
                });

                return {
                    ...application.toObject?.() ?? application,
                    candidateProfile,
                };
            })
        );

        const totalPages = Math.ceil(totalApplications / pageSize);

        return {
            applications: applicationsWithProfiles,
            totalPages,
        };
    }

    async getUserApplications(payload: {
        page: number;
        pageSize: number;
        query: string;
        userId: string;
    }): Promise<{
        applications: IApplicationModel[];
        totalPages: number;
    } | null> {
        const { page, pageSize, query, userId } = payload;

        // Step 1: Fetch all applications for the user
        const allApplications = await this._applicationRepository.findAll({
            candidateId: userId,
            isDeleted: false,
        });

        // Step 2: Attach job info to each application
        const applicationsWithJobs = await Promise.all(
            allApplications.map(async (app) => {
                const job = await this._jobPostRepository.findById(app?.jobId.toString());
                return {
                    ...app.toObject?.() || app,
                    job,
                };
            })
        );

        // Step 3: Filter by jobTitle or companyName if query exists
        const filteredApplications = query
            ? applicationsWithJobs.filter((app) => {
                const jobTitle = app?.job?.jobTitle?.toLowerCase() || '';
                const companyName = app?.job?.companyName?.toLowerCase() || '';
                const searchTerm = query.toLowerCase();
                return jobTitle.includes(searchTerm) || companyName.includes(searchTerm);
            })
            : applicationsWithJobs;

        // Step 4: Paginate
        const startIndex = (page - 1) * pageSize;
        const paginatedApplications = filteredApplications.slice(startIndex, startIndex + pageSize);

        // Step 5: Total pages from filtered results
        const totalPages = Math.ceil(filteredApplications.length / pageSize);

        return {
            applications: paginatedApplications,
            totalPages,
        };
    }



}