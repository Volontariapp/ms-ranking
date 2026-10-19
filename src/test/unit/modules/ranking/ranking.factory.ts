import type { AuthUser } from '@volontariapp/auth';
import {
  RankingRunEntity,
  RankingScoreEntity,
  RankingPostScoreEntity,
} from '@volontariapp/domain-ranking';
import type { RankingConfig } from '../../../../config/ranking-config.js';

export const TEST_USER_ID = '11111111-1111-4111-a111-111111111111';
export const TEST_LIST_VERSION = '22222222-2222-4222-a222-222222222222';

export function createTestAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: TEST_USER_ID,
    email: 'test@volontariapp.com',
    role: 'USER',
    permissions: [],
    ...overrides,
  };
}

export function createTestRankingConfig(overrides: Partial<RankingConfig> = {}): RankingConfig {
  return Object.assign(new RankingConfigStub(), overrides);
}

class RankingConfigStub implements RankingConfig {
  staleAfterHours = 24;
  feedStaleAfterHours = 2;
  requestTtlSeconds = 120;
  debounceSeconds = 30;
  locationRefreshKm = 10;
  passCooldownDays = 30;
  locationKey = 'test-only-location-key-32-bytes!';
}

export function createTestRun(overrides: Partial<RankingRunEntity> = {}): RankingRunEntity {
  return Object.assign(new RankingRunEntity(), {
    userId: TEST_USER_ID,
    listKind: 'EVENT',
    listVersion: TEST_LIST_VERSION,
    startedAt: new Date('2026-10-19T10:00:00Z'),
    computedAt: new Date('2026-10-19T10:00:05Z'),
    source: 'FULL',
    formulaVersion: 1,
    reason: 'ON_DEMAND',
    candidateCount: 100,
    jevScoredCount: 0,
    jevInputTokens: null,
    jevOutputTokens: null,
    durationMs: 5000,
    lastError: null,
    ...overrides,
  });
}

export function createTestScore(
  rank: number,
  overrides: Partial<RankingScoreEntity> = {},
): RankingScoreEntity {
  return Object.assign(new RankingScoreEntity(), {
    userId: TEST_USER_ID,
    eventId: `00000000-0000-4000-a000-${String(rank).padStart(12, '0')}`,
    score: 0.9,
    structuralScore: 0.8,
    semanticScore: null,
    rank,
    reasons: ['NEAR_YOU'],
    computedAt: new Date('2026-10-19T10:00:05Z'),
    ...overrides,
  });
}

export function createTestPostScore(
  rank: number,
  overrides: Partial<RankingPostScoreEntity> = {},
): RankingPostScoreEntity {
  return Object.assign(new RankingPostScoreEntity(), {
    userId: TEST_USER_ID,
    postId: `00000000-0000-4000-b000-${String(rank).padStart(12, '0')}`,
    authorId: '33333333-3333-4333-a333-333333333333',
    origin: 'FOLLOWED',
    score: 0.7,
    structuralScore: 0.7,
    semanticScore: null,
    rank,
    reasons: ['RECENT'],
    computedAt: new Date('2026-10-19T10:00:05Z'),
    ...overrides,
  });
}
