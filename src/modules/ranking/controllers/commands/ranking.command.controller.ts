import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { Logger } from '@volontariapp/logger';
import { CurrentUser, type AuthUser } from '@volontariapp/auth';
import {
  RANKING_COMMAND_SERVICE_NAME,
  RankingListKind as GrpcRankingListKind,
} from '@volontariapp/contracts-nest';
import { RankingListKind } from '@volontariapp/domain-ranking';
import { RequestRankingRefreshCommandDTO } from '../../dto/request/command/request-ranking-refresh.command.dto.js';
import { UpdateUserLocationCommandDTO } from '../../dto/request/command/update-user-location.command.dto.js';
import { RecordEventFeedbackCommandDTO } from '../../dto/request/command/record-event-feedback.command.dto.js';
import { RequestRankingRefreshResponseDTO } from '../../dto/response/request-ranking-refresh.response.dto.js';
import { UpdateUserLocationResponseDTO } from '../../dto/response/update-user-location.response.dto.js';
import { RecordEventFeedbackResponseDTO } from '../../dto/response/record-event-feedback.response.dto.js';
import { RankingPassService } from '../../services/ranking-pass.service.js';
import { RankingPositionService } from '../../services/ranking-position.service.js';
import { RankingRefreshService } from '../../services/ranking-refresh.service.js';

@Controller()
export class RankingCommandController {
  private readonly logger = new Logger({ context: RankingCommandController.name });

  constructor(
    private readonly refreshService: RankingRefreshService,
    private readonly positionService: RankingPositionService,
    private readonly passService: RankingPassService,
  ) {}

  @GrpcMethod(RANKING_COMMAND_SERVICE_NAME, 'RequestRankingRefresh')
  async requestRankingRefresh(
    @Payload() data: RequestRankingRefreshCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<RequestRankingRefreshResponseDTO> {
    this.logger.info(`gRPC RequestRankingRefresh by user ${user.id}`);
    const listKind =
      data.listKind === GrpcRankingListKind.RANKING_LIST_KIND_POST
        ? RankingListKind.POST
        : RankingListKind.EVENT;
    const outcome = await this.refreshService.refresh(user.id, listKind);
    const response = new RequestRankingRefreshResponseDTO();
    response.accepted = outcome.accepted;
    response.refreshThrottled = outcome.refreshThrottled;
    return response;
  }

  @GrpcMethod(RANKING_COMMAND_SERVICE_NAME, 'UpdateUserLocation')
  async updateUserLocation(
    @Payload() data: UpdateUserLocationCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<UpdateUserLocationResponseDTO> {
    this.logger.info(`gRPC UpdateUserLocation by user ${user.id}`);
    const response = new UpdateUserLocationResponseDTO();
    response.accepted = await this.positionService.update(user.id, {
      lat: data.lat,
      lng: data.lng,
    });
    return response;
  }

  @GrpcMethod(RANKING_COMMAND_SERVICE_NAME, 'RecordEventFeedback')
  async recordEventFeedback(
    @Payload() data: RecordEventFeedbackCommandDTO,
    @CurrentUser() user: AuthUser,
  ): Promise<RecordEventFeedbackResponseDTO> {
    this.logger.info(
      `gRPC RecordEventFeedback by user ${user.id} with ${String(data.items.length)} item(s)`,
    );
    const response = new RecordEventFeedbackResponseDTO();
    response.recorded = await this.passService.record(
      user.id,
      data.items.map((item) => item.eventId),
    );
    return response;
  }
}
