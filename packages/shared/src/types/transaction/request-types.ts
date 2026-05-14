export const TransactionRequestType = {
  WeeklyResultLoad: 'weeklyResultLoadRequest',
  LeaderboardLoad: 'leaderboardLoadRequest',
  StandingsLoad: 'standingsLoadRequest',
  PublicChallengeLoad: 'publicChallengeLoadRequest',
  ComputeWeeklyScores: 'computeWeeklyScoresRequest',
  ComputeTrendWeight: 'computeTrendWeightRequest',
  TransitionChallengeStatus: 'transitionChallengeStatusRequest',
  DetermineWinner: 'determineWinnerRequest',
  EnterMaintenance: 'enterMaintenanceRequest',
} as const;

export type TransactionRequestType =
  (typeof TransactionRequestType)[keyof typeof TransactionRequestType];
