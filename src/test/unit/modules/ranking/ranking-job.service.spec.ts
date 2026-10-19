import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { DataSource, EntityManager, Repository } from 'typeorm';
import { JobsOutboxEntity, type JobsOutboxModel } from '@volontariapp/database';
import { JobsOutboxRepository } from '@volontariapp/outbox';
import { RankingListKind, type RankingRequestService } from '@volontariapp/domain-ranking';
import { createMock } from '@volontariapp/testing';
import { RankingJobService } from '../../../../modules/ranking/services/ranking-job.service.js';
import { createMockAppConfigService } from './ranking.mock.js';
import { TEST_USER_ID } from './ranking.factory.js';

describe('RankingJobService (Unit)', () => {
  const requestedAt = '2026-10-19 10:00:00.123456+00';
  let manager: jest.Mocked<EntityManager>;
  let dataSource: jest.Mocked<DataSource>;
  let requestService: jest.Mocked<RankingRequestService>;
  let service: RankingJobService;
  let createJob: jest.SpiedFunction<JobsOutboxRepository['create']>;

  beforeEach(() => {
    manager = createMock<EntityManager>();
    dataSource = createMock<DataSource>();
    requestService = createMock<RankingRequestService>();
    jest
      .spyOn(dataSource, 'transaction')
      .mockImplementation((work: unknown) =>
        (work as (entityManager: EntityManager) => Promise<unknown>)(manager),
      );
    jest.spyOn(manager, 'getRepository').mockReturnValue(createMock<Repository<JobsOutboxModel>>());
    createJob = jest.spyOn(JobsOutboxRepository.prototype, 'create').mockResolvedValue(
      JobsOutboxEntity.createJob({
        type: 'ranking.compute_user_ranking',
        emitter: 'ms-ranking',
        emitterId: TEST_USER_ID,
        target: 'fallback-ranking-queue',
        payload: { userId: TEST_USER_ID, reason: 'ON_DEMAND', requestedAt: '' },
      }),
    );
    service = new RankingJobService(dataSource, requestService, createMockAppConfigService());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('forces a job on the fallback queue, due immediately, for an on-demand request', async () => {
    const requestCompute = jest
      .spyOn(requestService, 'requestCompute')
      .mockResolvedValue({ requestedAt, needsJob: true });
    const before = Date.now();

    await service.requestCompute({
      userId: TEST_USER_ID,
      listKind: RankingListKind.EVENT,
      reason: 'ON_DEMAND',
    });

    expect(requestCompute.mock.calls[0]?.[0]).toEqual({
      userId: TEST_USER_ID,
      listKind: 'EVENT',
      reason: 'ON_DEMAND',
      force: true,
      ttlSeconds: 120,
    });
    expect(requestCompute.mock.calls[0]?.[1]).toBe(manager);
    const job = createJob.mock.calls[0]?.[0];
    expect(job.type).toBe('ranking.compute_user_ranking');
    expect(job.target).toBe('fallback-ranking-queue');
    expect(job.emitter).toBe('ms-ranking');
    expect(job.payload).toEqual({ userId: TEST_USER_ID, reason: 'ON_DEMAND', requestedAt });
    expect(job.scheduledAt?.getTime()).toBeLessThan(before + 1000);
  });

  it('delays a background post refresh by the debounce on the feed queue', async () => {
    jest.spyOn(requestService, 'requestCompute').mockResolvedValue({ requestedAt, needsJob: true });
    const before = Date.now();

    await service.requestCompute({
      userId: TEST_USER_ID,
      listKind: RankingListKind.POST,
      reason: 'STALE_REFRESH',
    });

    const job = createJob.mock.calls[0]?.[0];
    expect(job.type).toBe('ranking.compute_user_feed');
    expect(job.target).toBe('ranking-feed-queue');
    expect(job.scheduledAt?.getTime()).toBeGreaterThanOrEqual(before + 30_000);
  });

  it('writes no job when a recent one already covers the request', async () => {
    const requestCompute = jest
      .spyOn(requestService, 'requestCompute')
      .mockResolvedValue({ requestedAt, needsJob: false });

    await service.requestCompute({
      userId: TEST_USER_ID,
      listKind: RankingListKind.EVENT,
      reason: 'STALE_REFRESH',
    });

    expect(requestCompute.mock.calls[0]?.[0].force).toBe(false);
    expect(createJob).not.toHaveBeenCalled();
  });
});
