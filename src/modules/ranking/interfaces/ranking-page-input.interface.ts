import type { RankedRow } from './ranked-row.interface.js';

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
