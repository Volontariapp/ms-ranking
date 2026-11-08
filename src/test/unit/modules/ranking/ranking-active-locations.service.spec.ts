import 'reflect-metadata';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { RankingLocationService } from '@volontariapp/domain-ranking';
import { INSUFFICIENT_PERMISSIONS } from '@volontariapp/errors-nest';
import { RankingActiveLocationsService } from '../../../../modules/ranking/services/ranking-active-locations.service.js';
import { createMockAppConfigService, createMockLocationService } from './ranking.mock.js';
import { createTestAuthUser } from './ranking.factory.js';

describe('RankingActiveLocationsService (Unit)', () => {
  const locationService = createMockLocationService();
  const cells = [
    { lat: 48.85, lng: 2.35 },
    { lat: 45.76, lng: 4.83 },
  ];
  let service: RankingActiveLocationsService;
  let listSpy: jest.SpiedFunction<RankingLocationService['listActiveCells']>;

  beforeEach(() => {
    service = new RankingActiveLocationsService(locationService, createMockAppConfigService());
    listSpy = jest.spyOn(locationService, 'listActiveCells').mockResolvedValue(cells);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('returns the active cells to an admin, with the configured key', async () => {
    const result = await service.list(createTestAuthUser({ role: 'ADMIN' }), 15);

    expect(result).toEqual(cells);
    expect(listSpy).toHaveBeenCalledWith(15, 'test-only-location-key-32-bytes!');
  });

  it.each(['USER', 'VOLUNTEER', 'ORGANIZER', ''])(
    'refuses the role "%s" without reading any position',
    async (role) => {
      await expect(service.list(createTestAuthUser({ role }), 30)).rejects.toThrow(
        INSUFFICIENT_PERMISSIONS().message,
      );
      expect(listSpy).not.toHaveBeenCalled();
    },
  );
});
