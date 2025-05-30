import { IUser } from "../../interfaces/IUser";
import userModel from "../../models/userModel";
import { GenericRepository } from "../genericRepository";
import { IUserRepository } from "../interface/IUserRepository";

export class UserRepository
    extends GenericRepository<IUser>
    implements IUserRepository {
    constructor() {
        super(userModel);
    }
}
