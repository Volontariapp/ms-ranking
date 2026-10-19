import type { RankingListKind } from '@volontariapp/domain-ranking';
import type { RankingComputeReason } from '@volontariapp/messaging';

export interface RequestComputeInput {
  userId: string;
  listKind: RankingListKind;
  reason: RankingComputeReason;
}
