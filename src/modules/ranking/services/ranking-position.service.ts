import { Injectable } from '@nestjs/common';
import {
  InvalidLocationCipherException,
  RankingListKind,
  RankingLocationService,
  RankingRateLimitService,
  hasMovedFar,
  type GeoPoint,
} from '@volontariapp/domain-ranking';
import { Logger } from '@volontariapp/logger';
import { AppConfigService } from '../../../config/app-config.service.js';
import { RankingJobService } from './ranking-job.service.js';

@Injectable()
export class RankingPositionService {
  private readonly logger = new Logger({ context: RankingPositionService.name });

  constructor(
    private readonly rateLimitService: RankingRateLimitService,
    private readonly locationService: RankingLocationService,
    private readonly jobService: RankingJobService,
    private readonly appConfig: AppConfigService,
  ) {}

  /** The position itself is never logged: it is personal data. */
  async update(userId: string, point: GeoPoint): Promise<boolean> {
    if (!(await this.rateLimitService.allowLocationUpdate(userId))) {
      this.logger.info(`Location update ignored for user ${userId}: bucket empty`);
      return false;
    }

    const { locationKey, locationRefreshKm } = this.appConfig.ranking;
    const previous = await this.previousPosition(userId, locationKey);
    await this.locationService.savePosition(userId, point, locationKey);

    if (hasMovedFar(previous, point, locationRefreshKm)) {
      await this.jobService.requestCompute({
        userId,
        listKind: RankingListKind.EVENT,
        reason: 'STALE_REFRESH',
      });
    }
    return true;
  }

  /** An unreadable stored position (rotated key, other format) counts as no previous position. */
  private async previousPosition(userId: string, key: string): Promise<GeoPoint | null> {
    try {
      return await this.locationService.findPosition(userId, key);
    } catch (error: unknown) {
      if (error instanceof InvalidLocationCipherException) {
        this.logger.warn(`Stored position of user ${userId} is unreadable: ${error.message}`);
        return null;
      }
      throw error;
    }
  }
}
