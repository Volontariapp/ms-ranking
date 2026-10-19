import {
  RankingReason as GrpcRankingReason,
  RankingSource as GrpcRankingSource,
} from '@volontariapp/contracts-nest';
import { RankingRunSource } from '@volontariapp/domain-ranking';

export const REASONS: Readonly<Partial<Record<string, GrpcRankingReason>>> = {
  FRIEND_INVOLVED: GrpcRankingReason.RANKING_REASON_FRIEND_INVOLVED,
  NEAR_YOU: GrpcRankingReason.RANKING_REASON_NEAR_YOU,
  MATCHES_INTERESTS: GrpcRankingReason.RANKING_REASON_MATCHES_INTERESTS,
  STARTING_SOON: GrpcRankingReason.RANKING_REASON_STARTING_SOON,
  TRENDING: GrpcRankingReason.RANKING_REASON_TRENDING,
  FOLLOWED_AUTHOR: GrpcRankingReason.RANKING_REASON_FOLLOWED_AUTHOR,
  FRIEND_AUTHOR: GrpcRankingReason.RANKING_REASON_FRIEND_AUTHOR,
  ENGAGED_AUTHOR: GrpcRankingReason.RANKING_REASON_ENGAGED_AUTHOR,
  LINKED_EVENT_WISHED: GrpcRankingReason.RANKING_REASON_LINKED_EVENT_WISHED,
  LINKED_EVENT_JOINED: GrpcRankingReason.RANKING_REASON_LINKED_EVENT_JOINED,
  RECENT: GrpcRankingReason.RANKING_REASON_RECENT,
};

export const SOURCES: Readonly<Partial<Record<string, GrpcRankingSource>>> = {
  [RankingRunSource.FULL]: GrpcRankingSource.RANKING_SOURCE_FULL,
  [RankingRunSource.STRUCTURAL_ONLY]: GrpcRankingSource.RANKING_SOURCE_STRUCTURAL_ONLY,
  [RankingRunSource.COLD_START]: GrpcRankingSource.RANKING_SOURCE_COLD_START,
};
