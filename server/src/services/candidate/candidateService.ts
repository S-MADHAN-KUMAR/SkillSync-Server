import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import { IUser } from "../../interfaces/IUser";
import { ICandidateRepository } from "../../repositories/interface/ICandidateRepository";
import { IUserRepository } from "../../repositories/interface/IUserRepository";
import { UserErrorMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { HttpError } from "../../utils/httpError";
import { ICandidateService } from "../interface/ICandidateService";

export class CandidateService implements ICandidateService {
    private _candidateRepository: ICandidateRepository;
    private _userRepository: IUserRepository;

    constructor(_candidateRepository: ICandidateRepository, _userRepository: IUserRepository) {
        this._candidateRepository = _candidateRepository;
        this._userRepository = _userRepository;
    }

    async updateOrCreate(payload: Partial<ICandidateProfile>, id: string): Promise<{ response: ICandidateProfile; user: IUser | null }> {
        const userFound = await this._userRepository.findOne({
            _id: id,
            role: 'candidate'
        });

        if (!userFound) {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND);
        }

        const updatedPayload = {
            ...payload,
            userId: id
        };

        const candidateProfileExist = await this._candidateRepository.findOne({ userId: id });

        let response: ICandidateProfile;

        if (!candidateProfileExist) {
            const created = await this._candidateRepository.create(updatedPayload);
            if (!created) {
                throw new HttpError("Failed to create candidate profile", StatusCode.INTERNAL_SERVER_ERROR);
            }
            response = created;
            const updatedUser = await this._userRepository.update(id, { candidateProfileId: response._id });

            return { response, user: updatedUser };
        } else {
            const updated = await this._candidateRepository.update(candidateProfileExist._id as string, updatedPayload);
            if (!updated) {
                throw new HttpError("Failed to update candidate profile", StatusCode.INTERNAL_SERVER_ERROR);
            }
            response = updated;

            return { response, user: userFound }; // already fetched user
        }
    }

    async getCandidateProfile(id: string): Promise<ICandidateProfile | null> {
        const response = await this._candidateRepository.findById(id)
        if (response) {
            return response
        } else {
            throw new HttpError(UserErrorMessages.USER_NOT_FOUND, StatusCode.NOT_FOUND)
        }
    }



}