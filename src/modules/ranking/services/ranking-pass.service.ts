import { Injectable } from '@nestjs/common';
import { RankingFeedbackService } from '@volontariapp/domain-ranking';
import { Logger } from '@volontariapp/logger';

@Injectable()
export class RankingPassService {
  private readonly logger = new Logger({ context: RankingPassService.name });

  constructor(private readonly feedbackService: RankingFeedbackService) {}

  async record(userId: string, eventIds: readonly string[]): Promise<number> {
    const recorded = await this.feedbackService.recordPasses(userId, [...new Set(eventIds)]);
    this.logger.info(`Recorded ${String(recorded)} pass(es) for user ${userId}`);
    return recorded;
  }
}
