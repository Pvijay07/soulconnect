import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getConversations(req: any): Promise<{
        status: string;
        data: import("./entities/conversation.entity").Conversation[];
    }>;
    getMessages(req: any, convId: string): Promise<{
        status: string;
        data: import("./entities/message.entity").Message[];
    }>;
}
