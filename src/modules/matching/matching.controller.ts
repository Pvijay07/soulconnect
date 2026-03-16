import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { MatchingService } from './matching.service';

@ApiTags('Matching')
@Controller('matching')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchingController {
    constructor(private readonly matchingService: MatchingService) { }

    @Get('recommendations')
    @ApiOperation({ summary: 'Get top matched listeners for the current user' })
    async getRecommendations(@Req() req: any, @Query('limit') limit = 10) {
        const results = await this.matchingService.getTopMatches(req.user.sub, +limit);
        return { data: results };
    }

    @Get('search-by-tags')
    @ApiOperation({ summary: 'Search for listeners by specific expertise tags' })
    async searchByTags(@Query('tags') tags: string, @Query('limit') limit = 10) {
        const tagList = tags.split(',').map(t => t.trim());
        const results = await this.matchingService.findByInterests(tagList, +limit);
        return { data: results };
    }

    @Get('random-connect')
    @ApiOperation({ summary: 'Randomly connect to an available listener (instant connect)' })
    async randomConnect(@Req() req: any, @Query('language') language?: string) {
        const result = await this.matchingService.randomConnect(req.user.sub, language);
        if (!result) return { data: null, message: 'No experts available right now. Please try again in a moment.' };
        return { data: result };
    }
}
