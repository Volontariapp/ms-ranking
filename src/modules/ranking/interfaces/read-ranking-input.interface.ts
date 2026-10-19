import type { RankingListKind } from '@volontariapp/domain-ranking';

export interface ReadRankingInput {
  userId: string;
  listKind: RankingListKind;
  cursor?: string;
  limit?: number;
}
