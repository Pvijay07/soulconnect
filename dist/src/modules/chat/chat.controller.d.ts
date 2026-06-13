import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getConversations(req: any): Promise<{
        status: string;
        data: import("./entities/conversation.entity").Conversation[];
    }>;
    getOrCreateConversation(req: any, recipientId: string): Promise<{
        status: string;
        data: import("./entities/conversation.entity").Conversation;
    }>;
    getMessages(req: any, convId: string): Promise<{
        status: string;
        data: import("./entities/message.entity").Message[];
    }>;
    updateStatus(req: any, convId: string, status: string): Promise<{
        status: string;
        message: string;
    }>;
}
