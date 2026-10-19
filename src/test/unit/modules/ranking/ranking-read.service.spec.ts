import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  RankingListKind,
  encodeCursor,
  type RankingFeedbackService,
  type RankingScoreService,
} from '@volontariapp/domain-ranking';
import { RankingReason, RankingSource } from '@volontariapp/contracts-nest';
import { isBaseApiError } from '@volontariapp/errors';
import { RankingReadService } from '../../../../modules/ranking/services/ranking-read.service.js';
import type { RankingJobService } from '../../../../modules/ranking/services/ranking-job.service.js';
import {
  createMockAppConfigService,
  createMockFeedbackService,
  createMockJobService,
  createMockPostScoreService,
  createMockRunService,
  createMockScoreService,
} from './ranking.mock.js';
import {
  TEST_LIST_VERSION,
  TEST_USER_ID,
  createTestPostScore,
  createTestRun,
  createTestScore,
} from './ranking.factory.js';

describe('RankingReadService (Unit)', () => {
  const runService = createMockRunService();
  const scoreService = createMockScoreService();
  const postScoreService = createMockPostScoreService();
  const feedbackService = createMockFeedbackService();
  const jobService = createMockJobService();
  let service: RankingReadService;
  let requestComputeSpy: jest.SpiedFunction<RankingJobService['requestCompute']>;
  let readPageSpy: jest.SpiedFunction<RankingScoreService['readPage']>;
  let listPassesSpy: jest.SpiedFunction<RankingFeedbackService['listRecentPassedEventIds']>;

  beforeEach(() => {
    service = new RankingReadService(
      runService,
      scoreService,
      postScoreService,
      feedbackService,
      jobService,
      createMockAppConfigService(),
    );
    jest.spyOn(runService, 'freshness').mockResolvedValue('FRESH');
    listPassesSpy = jest.spyOn(feedbackService, 'listRecentPassedEventIds').mockResolvedValue([]);
    requestComputeSpy = jest.spyOn(jobService, 'requestCompute').mockResolvedValue(undefined);
    readPageSpy = jest.spyOn(scoreService, 'readPage');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('cold start', () => {
    it('writes the on-demand job before raising FALLBACK_ACTIVATED', async () => {
      jest.spyOn(runService, 'findByKey').mockResolvedValue(null);
      const order: string[] = [];
      requestComputeSpy.mockImplementation(() => {
        order.push('job committed');
        return Promise.resolve();
      });

      const error = await service
        .read({ userId: TEST_USER_ID, listKind: RankingListKind.EVENT })
        .then(
          () => null,
          (caught: unknown) => {
            order.push('error raised');
            return caught;
          },
        );

      expect(order).toEqual(['job committed', 'error raised']);
      expect(requestComputeSpy).toHaveBeenCalledWith({
        userId: TEST_USER_ID,
        listKind: RankingListKind.EVENT,
        reason: 'ON_DEMAND',
      });
      expect(isBaseApiError(error) && error.statusCode).toBe(206);
      expect(readPageSpy).not.toHaveBeenCalled();
    });

    it('uses the feed job type for the post list', async () => {
      jest.spyOn(runService, 'findByKey').mockResolvedValue(null);

      const error = await service
        .read({ userId: TEST_USER_ID, listKind: RankingListKind.POST })
        .catch((caught: unknown) => caught);

      expect(JSON.stringify(error)).toContain('ranking.compute_user_feed');
    });
  });

  describe('events page', () => {
    it('serves a page, keeps the cursor of the last served rank and flags more rows', async () => {
      jest.spyOn(runService, 'findByKey').mockResolvedValue(createTestRun());
      const rows = [1, 2, 3].map((rank) => createTestScore(rank));
      const readPage = jest
        .spyOn(scoreService, 'readPage')
        .mockResolvedValue({ run: createTestRun(), items: rows });

      const page = await service.read({
        userId: TEST_USER_ID,
        listKind: RankingListKind.EVENT,
        limit: 2,
      });

      expect(readPage).toHaveBeenCalledWith({ userId: TEST_USER_ID, afterRank: 0, limit: 3 });
      expect(page.items.map((item) => item.rank)).toEqual([1, 2]);
      expect(page.hasMore).toBe(true);
      expect(page.nextCursor).toBe(encodeCursor({ listVersion: TEST_LIST_VERSION, lastRank: 2 }));
      expect(page.totalCount).toBe(100);
      expect(page.source).toBe(RankingSource.RANKING_SOURCE_FULL);
      expect(page.stale).toBe(false);
      expect(page.versionChanged).toBe(false);
      expect(page.items[0]?.reasons).toEqual([RankingReason.RANKING_REASON_NEAR_YOU]);
      expect(requestComputeSpy).not.toHaveBeenCalled();
    });

    it('resumes after the cursor rank', async () => {
      jest.spyOn(runService, 'findByKey').mockResolvedValue(createTestRun());
      const readPage = jest
        .spyOn(scoreService, 'readPage')
        .mockResolvedValue({ run: createTestRun(), items: [createTestScore(21)] });

      const page = await service.read({
        userId: TEST_USER_ID,
        listKind: RankingListKind.EVENT,
        cursor: encodeCursor({ listVersion: TEST_LIST_VERSION, lastRank: 20 }),
        limit: 20,
      });

      expect(readPage).toHaveBeenCalledWith({ userId: TEST_USER_ID, afterRank: 20, limit: 21 });
      expect(page.hasMore).toBe(false);
      expect(page.nextCursor).toBe('');
    });

    it('restarts from the first rank when the list version changed', async () => {
      jest.spyOn(runService, 'findByKey').mockResolvedValue(createTestRun());
      const readPage = jest
        .spyOn(scoreService, 'readPage')
        .mockResolvedValue({ run: createTestRun(), items: [createTestScore(1)] });

      const page = await service.read({
        userId: TEST_USER_ID,
        listKind: RankingListKind.EVENT,
        cursor: encodeCursor({ listVersion: 'another-version', lastRank: 40 }),
      });

      expect(readPage).toHaveBeenCalledWith({ userId: TEST_USER_ID, afterRank: 0, limit: 21 });
      expect(page.versionChanged).toBe(true);
    });

    it('excludes the events passed during the cooldown', async () => {
      jest.spyOn(runService, 'findByKey').mockResolvedValue(createTestRun());
      const rows = [1, 2].map((rank) => createTestScore(rank));
      jest.spyOn(scoreService, 'readPage').mockResolvedValue({ run: createTestRun(), items: rows });
      jest
        .spyOn(feedbackService, 'listRecentPassedEventIds')
        .mockResolvedValue([rows[0]?.eventId ?? '']);

      const page = await service.read({ userId: TEST_USER_ID, listKind: RankingListKind.EVENT });

      expect(page.items.map((item) => item.rank)).toEqual([2]);
      expect(listPassesSpy).toHaveBeenCalledWith(TEST_USER_ID, 30);
    });

    it('serves an old list and requests a delayed refresh', async () => {
      jest.spyOn(runService, 'findByKey').mockResolvedValue(createTestRun());
      jest.spyOn(runService, 'freshness').mockResolvedValue('STALE');
      jest
        .spyOn(scoreService, 'readPage')
        .mockResolvedValue({ run: createTestRun(), items: [createTestScore(1)] });

      const page = await service.read({ userId: TEST_USER_ID, listKind: RankingListKind.EVENT });

      expect(page.stale).toBe(true);
      expect(page.items).toHaveLength(1);
      expect(requestComputeSpy).toHaveBeenCalledWith({
        userId: TEST_USER_ID,
        listKind: RankingListKind.EVENT,
        reason: 'STALE_REFRESH',
      });
    });

    it('still serves the list when the refresh request fails', async () => {
      jest.spyOn(runService, 'findByKey').mockResolvedValue(createTestRun());
      jest.spyOn(runService, 'freshness').mockResolvedValue('STALE');
      requestComputeSpy.mockRejectedValue(new Error('database down'));
      jest
        .spyOn(scoreService, 'readPage')
        .mockResolvedValue({ run: createTestRun(), items: [createTestScore(1)] });

      const page = await service.read({ userId: TEST_USER_ID, listKind: RankingListKind.EVENT });

      expect(page.items).toHaveLength(1);
      expect(page.stale).toBe(true);
    });
  });

  describe('posts page', () => {
    it('reads the post scores and never consults the passes', async () => {
      jest.spyOn(runService, 'findByKey').mockResolvedValue(createTestRun({ listKind: 'POST' }));
      jest
        .spyOn(postScoreService, 'readPage')
        .mockResolvedValue({ run: createTestRun(), items: [createTestPostScore(1)] });

      const page = await service.read({ userId: TEST_USER_ID, listKind: RankingListKind.POST });

      expect(page.items[0]?.id).toBe('00000000-0000-4000-b000-000000000001');
      expect(page.items[0]?.reasons).toEqual([RankingReason.RANKING_REASON_RECENT]);
      expect(listPassesSpy).not.toHaveBeenCalled();
    });
  });
});
