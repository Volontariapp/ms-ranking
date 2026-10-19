import type { RequestRankingRefreshResponse } from '@volontariapp/contracts-nest';

export class RequestRankingRefreshResponseDTO implements RequestRankingRefreshResponse {
  accepted!: boolean;
  refreshThrottled!: boolean;
}
