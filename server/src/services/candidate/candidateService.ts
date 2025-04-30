import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
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

    async updateOrCreate(payload: Partial<ICandidateProfile>, id: string): Promise<ICandidateProfile | null> {
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

        let response: ICandidateProfile | null;

        if (!candidateProfileExist) {
            response = await this._candidateRepository.create(updatedPayload);
            await this._userRepository.update(id, { candidateProfileId: response?._id })
        } else {
            response = await this._candidateRepository.update(candidateProfileExist?._id as string, updatedPayload);
        }

        return response;
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