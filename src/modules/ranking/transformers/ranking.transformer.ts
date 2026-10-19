import {
  RankingReason as GrpcRankingReason,
  RankingSource as GrpcRankingSource,
  type RankingItem,
} from '@volontariapp/contracts-nest';
import { RankingRunSource } from '@volontariapp/domain-ranking';
import { RankingPageDTO } from '../dto/response/ranking-page.response.dto.js';

export interface RankedRow {
  id: string;
  rank: number;
  score: number;
  structuralScore: number;
  semanticScore: number | null;
  reasons: readonly string[];
}

export interface RankingPageInput {
  items: readonly RankedRow[];
  source: string;
  computedAt: Date;
  listVersion: string;
  nextCursor: string;
  hasMore: boolean;
  stale: boolean;
  versionChanged: boolean;
  totalCount: number;
}

const REASONS: Readonly<Partial<Record<string, GrpcRankingReason>>> = {
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

const SOURCES: Readonly<Partial<Record<string, GrpcRankingSource>>> = {
  [RankingRunSource.FULL]: GrpcRankingSource.RANKING_SOURCE_FULL,
  [RankingRunSource.STRUCTURAL_ONLY]: GrpcRankingSource.RANKING_SOURCE_STRUCTURAL_ONLY,
  [RankingRunSource.COLD_START]: GrpcRankingSource.RANKING_SOURCE_COLD_START,
};

export class RankingTransformer {
  /** Unknown codes are dropped: the client only receives codes it can translate. */
  static toGrpcReasons(reasons: readonly string[]): GrpcRankingReason[] {
    return reasons.flatMap((reason) => {
      const mapped = REASONS[reason];
      return mapped === undefined ? [] : [mapped];
    });
  }

  static toGrpcSource(source: string): GrpcRankingSource {
    return SOURCES[source] ?? GrpcRankingSource.RANKING_SOURCE_UNSPECIFIED;
  }

  static toRankingItem(row: RankedRow): RankingItem {
    return {
      id: row.id,
      score: row.score,
      rank: row.rank,
      reasons: this.toGrpcReasons(row.reasons),
      structuralScore: row.structuralScore,
      semanticScore: row.semanticScore ?? undefined,
    };
  }

  static toRankingPage(input: RankingPageInput): RankingPageDTO {
    const page = new RankingPageDTO();
    page.items = input.items.map((row) => this.toRankingItem(row));
    page.source = this.toGrpcSource(input.source);
    page.computedAt = input.computedAt.toISOString();
    page.listVersion = input.listVersion;
    page.nextCursor = input.nextCursor;
    page.hasMore = input.hasMore;
    page.stale = input.stale;
    page.versionChanged = input.versionChanged;
    page.totalCount = input.totalCount;
    return page;
  }
}
