import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../users/entities/social.entity';

export interface ModerationResult {
    isFlagged: boolean;
    score: number;
    tags: string[];
}

@Injectable()
export class ModerationService {
    private readonly logger = new Logger(ModerationService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Report)
        private readonly reportRepo: Repository<Report>,
    ) { }

    /**
     * Checks content against toxicity/profanity filters.
     * Can be integrated with Google Perspective API or OpenAI Moderation API.
     */
    async checkContent(content: string): Promise<ModerationResult> {
        // 1. Simple Keyword Filtering (Basic MVP)
        const bannedKeywords = ['spam', 'buy bitcoin', 'offensive_word1', 'offensive_word2'];
        const lowerContent = content.toLowerCase();

        const flaggedTags = bannedKeywords.filter(keyword => lowerContent.includes(keyword));

        if (flaggedTags.length > 0) {
            return {
                isFlagged: true,
                score: 0.9,
                tags: ['TOXICITY', 'SPAM'],
            };
        }

        // 2. Integration with External AI (Placeholder for OpenAI/Perspective)
        // const response = await axios.post('https://api.openai.com/v1/moderations', { input: content });

        return {
            isFlagged: false,
            score: 0.1,
            tags: [],
        };
    }

    /**
     * Automatically flag a user if they exceed toxicity thresholds
     */
    async flagUserForReview(userId: string, reason: string, evidence: string) {
        this.logger.warn(`AI FLAG: User ${userId} flagged for ${reason}`);

        const report = this.reportRepo.create({
            reportedId: userId,
            reporterId: '00000000-0000-0000-0000-000000000000', // System ID
            reason: 'AI_MODERATION',
            description: `Automatically flagged: ${reason}. Evidence: ${evidence}`,
            status: 'pending',
        });

        await this.reportRepo.save(report);
    }
}
