import type { RankingReason as GrpcRankingReason } from '@volontariapp/contracts-nest';
import { RankingSource as GrpcRankingSource, type RankingItem } from '@volontariapp/contracts-nest';
import { REASONS, SOURCES } from '../constants/ranking-transformer.constants.js';
import type { RankedRow } from '../interfaces/ranked-row.interface.js';
import type { RankingPageInput } from '../interfaces/ranking-page-input.interface.js';
import { RankingPageDTO } from '../dto/response/ranking-page.response.dto.js';

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
