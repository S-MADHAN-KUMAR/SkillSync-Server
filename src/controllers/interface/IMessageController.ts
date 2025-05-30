export interface IMessageController {
    getUserMessages(req: any, res: any): Promise<void>
}