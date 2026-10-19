import { createMock } from '@volontariapp/testing';
import type { jest } from '@jest/globals';
import type {
  RankingFeedbackService,
  RankingLocationService,
  RankingPostScoreService,
  RankingRateLimitService,
  RankingRunService,
  RankingScoreService,
} from '@volontariapp/domain-ranking';
import type { AppConfigService } from '../../../../config/app-config.service.js';
import type { RankingJobService } from '../../../../modules/ranking/services/ranking-job.service.js';
import type { RankingPassService } from '../../../../modules/ranking/services/ranking-pass.service.js';
import type { RankingPositionService } from '../../../../modules/ranking/services/ranking-position.service.js';
import type { RankingReadService } from '../../../../modules/ranking/services/ranking-read.service.js';
import type { RankingRefreshService } from '../../../../modules/ranking/services/ranking-refresh.service.js';
import { createTestRankingConfig } from './ranking.factory.js';

export function createMockRunService(): jest.Mocked<RankingRunService> {
  return createMock<RankingRunService>();
}

export function createMockScoreService(): jest.Mocked<RankingScoreService> {
  return createMock<RankingScoreService>();
}

export function createMockPostScoreService(): jest.Mocked<RankingPostScoreService> {
  return createMock<RankingPostScoreService>();
}

export function createMockFeedbackService(): jest.Mocked<RankingFeedbackService> {
  return createMock<RankingFeedbackService>();
}

export function createMockRateLimitService(): jest.Mocked<RankingRateLimitService> {
  return createMock<RankingRateLimitService>();
}

export function createMockLocationService(): jest.Mocked<RankingLocationService> {
  return createMock<RankingLocationService>();
}

export function createMockJobService(): jest.Mocked<RankingJobService> {
  return createMock<RankingJobService>();
}

export function createMockReadService(): jest.Mocked<RankingReadService> {
  return createMock<RankingReadService>();
}

export function createMockRefreshService(): jest.Mocked<RankingRefreshService> {
  return createMock<RankingRefreshService>();
}

export function createMockPositionService(): jest.Mocked<RankingPositionService> {
  return createMock<RankingPositionService>();
}

export function createMockPassService(): jest.Mocked<RankingPassService> {
  return createMock<RankingPassService>();
}

export function createMockAppConfigService(): jest.Mocked<AppConfigService> {
  const mock = createMock<AppConfigService>();
  Object.defineProperty(mock, 'ranking', { value: createTestRankingConfig(), writable: true });
  return mock;
}
