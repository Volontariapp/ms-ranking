import type { RankingItem, RankingPage, RankingSource } from '@volontariapp/contracts-nest';

export class RankingPageDTO implements RankingPage {
  items!: RankingItem[];
  source!: RankingSource;
  computedAt!: string;
  listVersion!: string;
  nextCursor!: string;
  hasMore!: boolean;
  stale!: boolean;
  versionChanged!: boolean;
  totalCount!: number;
}
