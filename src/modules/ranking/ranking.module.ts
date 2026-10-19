import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PostgresRankingEventFeedbackRepository,
  PostgresRankingLocationRepository,
  PostgresRankingPostScoreRepository,
  PostgresRankingRateBucketRepository,
  PostgresRankingRequestRepository,
  PostgresRankingRunRepository,
  PostgresRankingScoreRepository,
  RANKING_MODELS,
  RankingFeedbackService,
  RankingLocationService,
  RankingPostScoreService,
  RankingRateLimitService,
  RankingRequestService,
  RankingRunService,
  RankingScoreService,
} from '@volontariapp/domain-ranking';
import { RankingCommandController } from './controllers/commands/ranking.command.controller.js';
import { RankingQueryController } from './controllers/queries/ranking.query.controller.js';
import { RankingJobService } from './services/ranking-job.service.js';
import { RankingPassService } from './services/ranking-pass.service.js';
import { RankingPositionService } from './services/ranking-position.service.js';
import { RankingReadService } from './services/ranking-read.service.js';
import { RankingRefreshService } from './services/ranking-refresh.service.js';

@Module({
  imports: [TypeOrmModule.forFeature(RANKING_MODELS)],
  controllers: [RankingQueryController, RankingCommandController],
  providers: [
    PostgresRankingEventFeedbackRepository,
    PostgresRankingLocationRepository,
    PostgresRankingPostScoreRepository,
    PostgresRankingRateBucketRepository,
    PostgresRankingRequestRepository,
    PostgresRankingRunRepository,
    PostgresRankingScoreRepository,
    RankingFeedbackService,
    RankingLocationService,
    RankingPostScoreService,
    RankingRateLimitService,
    RankingRequestService,
    RankingRunService,
    RankingScoreService,
    RankingJobService,
    RankingPassService,
    RankingPositionService,
    RankingReadService,
    RankingRefreshService,
  ],
})
export class RankingModule {}
