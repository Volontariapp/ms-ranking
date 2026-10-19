import { Injectable } from '@nestjs/common';
import { FALLBACK_ACTIVATED } from '@volontariapp/errors-nest';
import {
  FEED_FORMULA_VERSION,
  FORMULA_VERSION,
  RankingFeedbackService,
  RankingListKind,
  RankingPostScoreService,
  RankingRunService,
  RankingScoreService,
  buildPage,
  normalizeLimit,
  resolveCursor,
} from '@volontariapp/domain-ranking';
import { Logger } from '@volontariapp/logger';
import { AppConfigService } from '../../../config/app-config.service.js';
import { COMPUTE_JOB_TYPE, RANKING_NOT_READY } from '../constants/ranking-job.constants.js';
import type { RankingPageDTO } from '../dto/response/ranking-page.response.dto.js';
import { RankingTransformer, type RankedRow } from '../transformers/ranking.transformer.js';
import { RankingJobService } from './ranking-job.service.js';

export interface ReadRankingInput {
  userId: string;
  listKind: RankingListKind;
  cursor?: string;
  limit?: number;
}

@Injectable()
export class RankingReadService {
  private readonly logger = new Logger({ context: RankingReadService.name });

  constructor(
    private readonly runService: RankingRunService,
    private readonly scoreService: RankingScoreService,
    private readonly postScoreService: RankingPostScoreService,
    private readonly feedbackService: RankingFeedbackService,
    private readonly jobService: RankingJobService,
    private readonly appConfig: AppConfigService,
  ) {}

  /**
   * Serves one page of the precomputed list. It never calls another service: a missing list is a
   * cold start (a forced job, committed on its own, then FALLBACK_ACTIVATED) and an old list is
   * served as is while a refresh is requested.
   */
  async read(input: ReadRankingInput): Promise<RankingPageDTO> {
    const { userId, listKind } = input;

    const run = await this.runService.findByKey(userId, listKind);
    if (!run) {
      await this.jobService.requestCompute({ userId, listKind, reason: 'ON_DEMAND' });
      this.logger.info(`No ${listKind} list for user ${userId}: on-demand compute requested`);
      throw FALLBACK_ACTIVATED(COMPUTE_JOB_TYPE[listKind], RANKING_NOT_READY);
    }

    const limit = normalizeLimit(input.limit);
    const { lastRank, versionChanged } = resolveCursor(input.cursor, run.listVersion);

    const rows = await this.readRows(userId, listKind, lastRank, limit + 1);
    const page = buildPage(rows, limit, run.listVersion);
    const items = await this.withoutRecentPasses(userId, listKind, page.items);

    const stale = await this.refreshWhenStale(userId, listKind);

    return RankingTransformer.toRankingPage({
      items,
      source: run.source,
      computedAt: run.computedAt,
      listVersion: run.listVersion,
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
      stale,
      versionChanged,
      totalCount: run.candidateCount,
    });
  }

  private async readRows(
    userId: string,
    listKind: RankingListKind,
    afterRank: number,
    limit: number,
  ): Promise<RankedRow[]> {
    if (listKind === RankingListKind.EVENT) {
      const { items } = await this.scoreService.readPage({ userId, afterRank, limit });
      return items.map(({ eventId, rank, score, structuralScore, semanticScore, reasons }) => ({
        id: eventId,
        rank,
        score,
        structuralScore,
        semanticScore,
        reasons,
      }));
    }
    const { items } = await this.postScoreService.readPage({ userId, afterRank, limit });
    return items.map(({ postId, rank, score, structuralScore, semanticScore, reasons }) => ({
      id: postId,
      rank,
      score,
      structuralScore,
      semanticScore,
      reasons,
    }));
  }

  /** An event the user passed is excluded for the cooldown, even before the next compute. */
  private async withoutRecentPasses(
    userId: string,
    listKind: RankingListKind,
    items: readonly RankedRow[],
  ): Promise<RankedRow[]> {
    if (listKind !== RankingListKind.EVENT || items.length === 0) {
      return [...items];
    }
    const passed = new Set(
      await this.feedbackService.listRecentPassedEventIds(
        userId,
        this.appConfig.ranking.passCooldownDays,
      ),
    );
    return items.filter((item) => !passed.has(item.id));
  }

  /** A failed refresh request must not fail a read that has a list to serve. */
  private async refreshWhenStale(userId: string, listKind: RankingListKind): Promise<boolean> {
    const isStale = await this.isStale(userId, listKind);
    if (!isStale) {
      return false;
    }
    try {
      await this.jobService.requestCompute({ userId, listKind, reason: 'STALE_REFRESH' });
    } catch (error: unknown) {
      this.logger.warn(
        `Stale refresh not requested for user ${userId} (${listKind}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return true;
  }

  private async isStale(userId: string, listKind: RankingListKind): Promise<boolean> {
    const isEvent = listKind === RankingListKind.EVENT;
    const freshness = await this.runService.freshness({
      userId,
      listKind,
      maxAgeHours: isEvent
        ? this.appConfig.ranking.staleAfterHours
        : this.appConfig.ranking.feedStaleAfterHours,
      formulaVersion: isEvent ? FORMULA_VERSION : FEED_FORMULA_VERSION,
    });
    return freshness === 'STALE';
  }
}
