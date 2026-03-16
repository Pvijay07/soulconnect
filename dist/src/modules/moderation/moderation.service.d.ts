import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Report } from '../users/entities/social.entity';
export interface ModerationResult {
    isFlagged: boolean;
    score: number;
    tags: string[];
}
export declare class ModerationService {
    private readonly configService;
    private readonly reportRepo;
    private readonly logger;
    constructor(configService: ConfigService, reportRepo: Repository<Report>);
    checkContent(content: string): Promise<ModerationResult>;
    flagUserForReview(userId: string, reason: string, evidence: string): Promise<void>;
}
