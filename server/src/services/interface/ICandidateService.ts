import { ICandidateProfile } from "../../interfaces/ICandidateProfile";

export interface ICandidateService {
    updateOrCreate(payload: ICandidateProfile, id: string): Promise<ICandidateProfile | null>;
    getCandidateProfile(id: string): Promise<ICandidateProfile | null>;
}