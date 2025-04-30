import { login } from "../../types/types";
import { AdminErrorMessages } from "../../utils/constants";
import { StatusCode } from "../../utils/enums";
import { HttpError } from "../../utils/httpError";
import { IAdminService } from "../interface/IAdminService";

export class AdminService implements IAdminService {

    async adminLogin(payload: login): Promise<Boolean | null> {
        if (payload?.email === process.env.ADMIN_EMAIL && payload?.password === process.env.ADMIN_PASSWORD) {
            return true
        } else {
            throw new HttpError(AdminErrorMessages.ADMIN_INVALID_CRENDIALS, StatusCode.BAD_REQUEST)
        }
    }
}