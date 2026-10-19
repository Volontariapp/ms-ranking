import { describe, expect, it } from '@jest/globals';
import { RankingReason, RankingSource } from '@volontariapp/contracts-nest';
import { RankingTransformer } from '../../../../modules/ranking/transformers/ranking.transformer.js';

describe('RankingTransformer (Unit)', () => {
  it('maps the known reason codes and drops the unknown ones', () => {
    expect(RankingTransformer.toGrpcReasons(['TRENDING', 'SOMETHING_NEW', 'RECENT'])).toEqual([
      RankingReason.RANKING_REASON_TRENDING,
      RankingReason.RANKING_REASON_RECENT,
    ]);
  });

  it('maps the run sources', () => {
    expect(RankingTransformer.toGrpcSource('STRUCTURAL_ONLY')).toBe(
      RankingSource.RANKING_SOURCE_STRUCTURAL_ONLY,
    );
    expect(RankingTransformer.toGrpcSource('COLD_START')).toBe(
      RankingSource.RANKING_SOURCE_COLD_START,
    );
    expect(RankingTransformer.toGrpcSource('???')).toBe(RankingSource.RANKING_SOURCE_UNSPECIFIED);
  });

  it('omits the semantic score when there is none', () => {
    const item = RankingTransformer.toRankingItem({
      id: 'a',
      rank: 1,
      score: 0.5,
      structuralScore: 0.4,
      semanticScore: null,
      reasons: [],
    });

    expect(item.semanticScore).toBeUndefined();
  });
});
