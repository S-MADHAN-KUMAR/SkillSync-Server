import { ICandidateProfile } from "../../interfaces/ICandidateProfile";
import { IUser } from "../../interfaces/IUser";

export interface ICandidateService {
    updateOrCreate(payload: Partial<ICandidateProfile>, id: string): Promise<{ response: ICandidateProfile, user: IUser | null }>
    getCandidateProfile(id: string): Promise<ICandidateProfile | null>;
}