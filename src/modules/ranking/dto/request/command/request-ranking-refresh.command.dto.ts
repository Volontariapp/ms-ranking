import { IsIn } from 'class-validator';
import { RankingListKind, type RequestRankingRefreshCommand } from '@volontariapp/contracts-nest';

export class RequestRankingRefreshCommandDTO implements RequestRankingRefreshCommand {
  @IsIn([RankingListKind.RANKING_LIST_KIND_EVENT, RankingListKind.RANKING_LIST_KIND_POST])
  listKind!: RankingListKind;
}
