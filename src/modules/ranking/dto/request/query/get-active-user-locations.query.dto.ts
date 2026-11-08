import { IsInt, IsOptional, Max, Min } from 'class-validator';
import type { GetActiveUserLocationsQuery } from '@volontariapp/contracts-nest';

/** One day at most: older positions are not "active" and are kept only for ranking. */
export const MAX_ACTIVE_LOCATION_AGE_MINUTES = 1440;

export class GetActiveUserLocationsQueryDTO implements GetActiveUserLocationsQuery {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_ACTIVE_LOCATION_AGE_MINUTES)
  maxAgeMinutes!: number;
}
