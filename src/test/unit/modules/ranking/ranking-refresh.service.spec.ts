import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { RankingListKind } from '@volontariapp/domain-ranking';
import { RankingRefreshService } from '../../../../modules/ranking/services/ranking-refresh.service.js';
import type { RankingJobService } from '../../../../modules/ranking/services/ranking-job.service.js';
import { createMockJobService, createMockRateLimitService } from './ranking.mock.js';
import { TEST_USER_ID } from './ranking.factory.js';

describe('RankingRefreshService (Unit)', () => {
  const rateLimitService = createMockRateLimitService();
  const jobService = createMockJobService();
  let service: RankingRefreshService;
  let requestComputeSpy: jest.SpiedFunction<RankingJobService['requestCompute']>;

  beforeEach(() => {
    service = new RankingRefreshService(rateLimitService, jobService);
    requestComputeSpy = jest.spyOn(jobService, 'requestCompute').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('requests a manual compute while the bucket has tokens', async () => {
    jest.spyOn(rateLimitService, 'allowRefresh').mockResolvedValue(true);

    const outcome = await service.refresh(TEST_USER_ID, RankingListKind.POST);

    expect(outcome).toEqual({ accepted: true, refreshThrottled: false });
    expect(requestComputeSpy).toHaveBeenCalledWith({
      userId: TEST_USER_ID,
      listKind: RankingListKind.POST,
      reason: 'MANUAL',
    });
  });

  it('answers refreshThrottled without any job once the bucket is empty', async () => {
    jest.spyOn(rateLimitService, 'allowRefresh').mockResolvedValue(false);

    const outcome = await service.refresh(TEST_USER_ID, RankingListKind.EVENT);

    expect(outcome).toEqual({ accepted: false, refreshThrottled: true });
    expect(requestComputeSpy).not.toHaveBeenCalled();
  });

  it('refuses the sixth refresh of the minute with the real bucket rule', async () => {
    let tokens = 5;
    jest.spyOn(rateLimitService, 'allowRefresh').mockImplementation(() => {
      tokens -= 1;
      return Promise.resolve(tokens >= 0);
    });

    const outcomes = [];
    for (let call = 0; call < 6; call += 1) {
      outcomes.push(await service.refresh(TEST_USER_ID, RankingListKind.EVENT));
    }

    expect(outcomes.map((outcome) => outcome.refreshThrottled)).toEqual([
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
    expect(requestComputeSpy).toHaveBeenCalledTimes(5);
  });
});
