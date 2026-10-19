import type { GetRankingFeedResponse } from '@volontariapp/contracts-nest';
import type { RankingPageDTO } from './ranking-page.response.dto.js';

export class GetRankingFeedResponseDTO implements GetRankingFeedResponse {
  page!: RankingPageDTO;
}
