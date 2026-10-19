import { JobMessagingType, RankingQueue, type RankingComputeReason } from '@volontariapp/messaging';
import { RankingListKind } from '@volontariapp/domain-ranking';

export const COMPUTE_JOB_TYPE = {
  [RankingListKind.EVENT]: JobMessagingType.COMPUTE_USER_RANKING,
  [RankingListKind.POST]: JobMessagingType.COMPUTE_USER_FEED,
} as const;

export const BACKGROUND_QUEUE = {
  [RankingListKind.EVENT]: RankingQueue.RANKING,
  [RankingListKind.POST]: RankingQueue.FEED,
} as const;

/** Les demandes d'un utilisateur qui attend un ecran passent par la file de repli, sans delai. */
export const IMMEDIATE_REASONS: readonly RankingComputeReason[] = ['ON_DEMAND', 'MANUAL'];

export const JOB_EMITTER = 'ms-ranking';

export const RANKING_NOT_READY = 'RANKING_NOT_READY';
