import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@volontariapp/auth';
import { RankingLocationService, type GeoPoint } from '@volontariapp/domain-ranking';
import { INSUFFICIENT_PERMISSIONS } from '@volontariapp/errors-nest';
import { UserRoles } from '@volontariapp/shared';
import { AppConfigService } from '../../../config/app-config.service.js';

/**
 * Positions of the users who sent one recently, as distinct 1 km cells without any identifier.
 * Admin only, checked here as well as on the gateway: the gateway is not the only way in, and a
 * position is personal data.
 */
@Injectable()
export class RankingActiveLocationsService {
  constructor(
    private readonly locationService: RankingLocationService,
    private readonly appConfig: AppConfigService,
  ) {}

  async list(user: AuthUser, maxAgeMinutes: number): Promise<GeoPoint[]> {
    if (user.role !== String(UserRoles.ADMIN)) {
      throw INSUFFICIENT_PERMISSIONS();
    }
    return this.locationService.listActiveCells(maxAgeMinutes, this.appConfig.ranking.locationKey);
  }
}
