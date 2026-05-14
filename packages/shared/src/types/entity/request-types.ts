export const EntityRequestType = {
  UserProfileLoad: 'userProfileLoadRequest',
  UserProfileStore: 'userProfileStoreRequest',
  ChallengeLoad: 'challengeLoadRequest',
  ChallengeStore: 'challengeStoreRequest',
  ChallengeDelete: 'challengeDeleteRequest',
  ParticipantLoad: 'participantLoadRequest',
  ParticipantStore: 'participantStoreRequest',
  GoalStore: 'goalStoreRequest',
  WeighInLoad: 'weighInLoadRequest',
  WeighInStore: 'weighInStoreRequest',
  WeighInDelete: 'weighInDeleteRequest',
} as const;

export type EntityRequestType = (typeof EntityRequestType)[keyof typeof EntityRequestType];
