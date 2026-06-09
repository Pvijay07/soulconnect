import { MatchingService } from './matching.service';
export declare class MatchingController {
    private readonly matchingService;
    constructor(matchingService: MatchingService);
    getRecommendations(req: any, limit?: number): Promise<{
        data: import("./matching.service").MatchScoreResult[];
    }>;
    searchByTags(tags: string, limit?: number): Promise<{
        data: {
            id: string;
            displayName: any;
            expertise: string[];
            rating: number;
            rate: number;
        }[];
    }>;
    randomConnect(req: any, language?: string): Promise<{
        data: null;
        message: string;
    } | {
        data: {
            listenerId: string;
            displayName: any;
            avatarUrl: any;
            headline: string;
            ratePerMin: number;
        };
        message?: undefined;
    }>;
}
