import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JobsOutboxEntity, JobsOutboxModel } from '@volontariapp/database';
import { RankingRequestService, type RankingListKind } from '@volontariapp/domain-ranking';
import { Logger } from '@volontariapp/logger';
import { RankingQueue, type RankingComputeReason } from '@volontariapp/messaging';
import { JobsOutboxRepository } from '@volontariapp/outbox';
import { AppConfigService } from '../../../config/app-config.service.js';
import {
  BACKGROUND_QUEUE,
  COMPUTE_JOB_TYPE,
  IMMEDIATE_REASONS,
  JOB_EMITTER,
} from '../constants/ranking-job.constants.js';

export interface RequestComputeInput {
  userId: string;
  listKind: RankingListKind;
  reason: RankingComputeReason;
}

@Injectable()
export class RankingJobService {
  private readonly logger = new Logger({ context: RankingJobService.name });

  constructor(
    private readonly dataSource: DataSource,
    private readonly requestService: RankingRequestService,
    private readonly appConfig: AppConfigService,
  ) {}

  /**
   * Writes the open request of the list and, when the request needs one, its job, in a single
   * transaction that is committed before this method returns.
   */
  async requestCompute(input: RequestComputeInput): Promise<void> {
    const { userId, listKind, reason } = input;
    const immediate = IMMEDIATE_REASONS.includes(reason);
    const { requestTtlSeconds, debounceSeconds } = this.appConfig.ranking;

    await this.dataSource.transaction(async (manager) => {
      const { requestedAt, needsJob } = await this.requestService.requestCompute(
        { userId, listKind, reason, force: immediate, ttlSeconds: requestTtlSeconds },
        manager,
      );
      if (!needsJob) {
        return;
      }

      const delayMs = immediate ? 0 : debounceSeconds * 1000;
      const job = JobsOutboxEntity.createJob({
        type: COMPUTE_JOB_TYPE[listKind],
        emitter: JOB_EMITTER,
        emitterId: userId,
        scheduledAt: new Date(Date.now() + delayMs),
        target: immediate ? RankingQueue.FALLBACK_RANKING : BACKGROUND_QUEUE[listKind],
        payload: { userId, reason, requestedAt },
      });
      await new JobsOutboxRepository(manager.getRepository(JobsOutboxModel)).create(job);
      this.logger.info(
        `Compute job ${job.id} queued for user ${userId} (${listKind}, ${reason}) on ${job.target}`,
      );
    });
  }
}
