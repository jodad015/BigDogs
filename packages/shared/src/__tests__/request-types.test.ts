import { describe, it, expect } from 'vitest';
import { EntityRequestType } from '../types/entity/request-types';
import { TransactionRequestType } from '../types/transaction/request-types';

describe('EntityRequestType', () => {
  it('has expected request types', () => {
    expect(EntityRequestType.UserProfileLoad).toBe('userProfileLoadRequest');
    expect(EntityRequestType.WeighInStore).toBe('weighInStoreRequest');
    expect(EntityRequestType.ChallengeLoad).toBe('challengeLoadRequest');
  });
});

describe('TransactionRequestType', () => {
  it('has expected request types', () => {
    expect(TransactionRequestType.ComputeWeeklyScores).toBe('computeWeeklyScoresRequest');
    expect(TransactionRequestType.LeaderboardLoad).toBe('leaderboardLoadRequest');
    expect(TransactionRequestType.DetermineWinner).toBe('determineWinnerRequest');
  });
});
