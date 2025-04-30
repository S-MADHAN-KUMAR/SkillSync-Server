import { login, status } from "../../types/types";

export interface IAdminService {
    adminLogin(payload: login): Promise<Boolean | null>;
}