import type { GetRankingEventsResponse } from '@volontariapp/contracts-nest';
import type { RankingPageDTO } from './ranking-page.response.dto.js';

export class GetRankingEventsResponseDTO implements GetRankingEventsResponse {
  page!: RankingPageDTO;
}
