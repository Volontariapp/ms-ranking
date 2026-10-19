import { Injectable } from '@nestjs/common';
import { RankingRateLimitService, type RankingListKind } from '@volontariapp/domain-ranking';
import { Logger } from '@volontariapp/logger';
import { RankingJobService } from './ranking-job.service.js';

export interface RefreshOutcome {
  accepted: boolean;
  refreshThrottled: boolean;
}

@Injectable()
export class RankingRefreshService {
  private readonly logger = new Logger({ context: RankingRefreshService.name });

  constructor(
    private readonly rateLimitService: RankingRateLimitService,
    private readonly jobService: RankingJobService,
  ) {}

  /** Beyond the REFRESH bucket the current list keeps being served: no job, no error. */
  async refresh(userId: string, listKind: RankingListKind): Promise<RefreshOutcome> {
    if (!(await this.rateLimitService.allowRefresh(userId))) {
      this.logger.info(`Refresh throttled for user ${userId} (${listKind})`);
      return { accepted: false, refreshThrottled: true };
    }
    await this.jobService.requestCompute({ userId, listKind, reason: 'MANUAL' });
    return { accepted: true, refreshThrottled: false };
  }
}
