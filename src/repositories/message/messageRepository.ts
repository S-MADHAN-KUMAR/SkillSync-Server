import { IMessage } from "../../interfaces/IMessage";
import messageModel from "../../models/messageModel";
import { GenericRepository } from "../genericRepository";
import { IMessageRepository } from "../interface/IMessageRepository";

export class MessageRepository
    extends GenericRepository<IMessage>
    implements IMessageRepository {
    constructor() {
        super(messageModel);
    }
}
