import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { Logger } from '@volontariapp/logger';
import { CurrentUser, type AuthUser } from '@volontariapp/auth';
import { RANKING_QUERY_SERVICE_NAME } from '@volontariapp/contracts-nest';
import { RankingListKind } from '@volontariapp/domain-ranking';
import { GetActiveUserLocationsQueryDTO } from '../../dto/request/query/get-active-user-locations.query.dto.js';
import { GetRankingEventsQueryDTO } from '../../dto/request/query/get-ranking-events.query.dto.js';
import { GetRankingFeedQueryDTO } from '../../dto/request/query/get-ranking-feed.query.dto.js';
import { GetActiveUserLocationsResponseDTO } from '../../dto/response/get-active-user-locations.response.dto.js';
import { GetRankingEventsResponseDTO } from '../../dto/response/get-ranking-events.response.dto.js';
import { GetRankingFeedResponseDTO } from '../../dto/response/get-ranking-feed.response.dto.js';
import { RankingActiveLocationsService } from '../../services/ranking-active-locations.service.js';
import { RankingReadService } from '../../services/ranking-read.service.js';

@Controller()
export class RankingQueryController {
  private readonly logger = new Logger({ context: RankingQueryController.name });

  constructor(
    private readonly readService: RankingReadService,
    private readonly activeLocationsService: RankingActiveLocationsService,
  ) {}

  @GrpcMethod(RANKING_QUERY_SERVICE_NAME, 'GetRankingEvents')
  async getRankingEvents(
    @Payload() data: GetRankingEventsQueryDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<GetRankingEventsResponseDTO> {
    this.logger.info(`gRPC GetRankingEvents by user ${user.id}`);
    const response = new GetRankingEventsResponseDTO();
    response.page = await this.readService.read({
      userId: user.id,
      listKind: RankingListKind.EVENT,
      cursor: data.cursor,
      limit: data.limit,
    });
    return response;
  }

  @GrpcMethod(RANKING_QUERY_SERVICE_NAME, 'GetRankingFeed')
  async getRankingFeed(
    @Payload() data: GetRankingFeedQueryDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<GetRankingFeedResponseDTO> {
    this.logger.info(`gRPC GetRankingFeed by user ${user.id}`);
    const response = new GetRankingFeedResponseDTO();
    response.page = await this.readService.read({
      userId: user.id,
      listKind: RankingListKind.POST,
      cursor: data.cursor,
      limit: data.limit,
    });
    return response;
  }

  /** Admin only. Never logs a position: it is personal data. */
  @GrpcMethod(RANKING_QUERY_SERVICE_NAME, 'GetActiveUserLocations')
  async getActiveUserLocations(
    @Payload() data: GetActiveUserLocationsQueryDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<GetActiveUserLocationsResponseDTO> {
    this.logger.info(`gRPC GetActiveUserLocations by user ${user.id}`);
    const response = new GetActiveUserLocationsResponseDTO();
    response.cells = await this.activeLocationsService.list(user, data.maxAgeMinutes);
    return response;
  }
}
