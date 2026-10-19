import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  InvalidLocationCipherException,
  RankingListKind,
  type RankingLocationService,
} from '@volontariapp/domain-ranking';
import type { RankingJobService } from '../../../../modules/ranking/services/ranking-job.service.js';
import { RankingPositionService } from '../../../../modules/ranking/services/ranking-position.service.js';
import {
  createMockAppConfigService,
  createMockJobService,
  createMockLocationService,
  createMockRateLimitService,
} from './ranking.mock.js';
import { TEST_USER_ID } from './ranking.factory.js';

describe('RankingPositionService (Unit)', () => {
  const rateLimitService = createMockRateLimitService();
  const locationService = createMockLocationService();
  const jobService = createMockJobService();
  const paris = { lat: 48.8566, lng: 2.3522 };
  let service: RankingPositionService;
  let requestComputeSpy: jest.SpiedFunction<RankingJobService['requestCompute']>;
  let savePositionSpy: jest.SpiedFunction<RankingLocationService['savePosition']>;

  beforeEach(() => {
    service = new RankingPositionService(
      rateLimitService,
      locationService,
      jobService,
      createMockAppConfigService(),
    );
    jest.spyOn(rateLimitService, 'allowLocationUpdate').mockResolvedValue(true);
    savePositionSpy = jest.spyOn(locationService, 'savePosition').mockResolvedValue(undefined);
    requestComputeSpy = jest.spyOn(jobService, 'requestCompute').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('ignores the update when the location bucket is empty', async () => {
    jest.spyOn(rateLimitService, 'allowLocationUpdate').mockResolvedValue(false);

    expect(await service.update(TEST_USER_ID, paris)).toBe(false);
    expect(savePositionSpy).not.toHaveBeenCalled();
    expect(requestComputeSpy).not.toHaveBeenCalled();
  });

  it('requests a refresh of the events when there was no previous position', async () => {
    jest.spyOn(locationService, 'findPosition').mockResolvedValue(null);

    expect(await service.update(TEST_USER_ID, paris)).toBe(true);
    expect(savePositionSpy).toHaveBeenCalledWith(
      TEST_USER_ID,
      paris,
      'test-only-location-key-32-bytes!',
    );
    expect(requestComputeSpy).toHaveBeenCalledWith({
      userId: TEST_USER_ID,
      listKind: RankingListKind.EVENT,
      reason: 'STALE_REFRESH',
    });
  });

  it('requests a refresh after a move of more than 10 km', async () => {
    jest.spyOn(locationService, 'findPosition').mockResolvedValue({ lat: 48.8566, lng: 2.6 });

    await service.update(TEST_USER_ID, paris);

    expect(requestComputeSpy).toHaveBeenCalledTimes(1);
  });

  it('requests nothing after a move of less than 10 km', async () => {
    jest.spyOn(locationService, 'findPosition').mockResolvedValue({ lat: 48.86, lng: 2.35 });

    expect(await service.update(TEST_USER_ID, paris)).toBe(true);
    expect(savePositionSpy).toHaveBeenCalledTimes(1);
    expect(requestComputeSpy).not.toHaveBeenCalled();
  });

  it('treats an unreadable stored position as no previous position', async () => {
    jest
      .spyOn(locationService, 'findPosition')
      .mockRejectedValue(new InvalidLocationCipherException('unknown format'));

    expect(await service.update(TEST_USER_ID, paris)).toBe(true);
    expect(requestComputeSpy).toHaveBeenCalledTimes(1);
  });

  it('propagates any other storage error', async () => {
    jest.spyOn(locationService, 'findPosition').mockRejectedValue(new Error('boom'));

    await expect(service.update(TEST_USER_ID, paris)).rejects.toThrow('boom');
    expect(savePositionSpy).not.toHaveBeenCalled();
  });
});
