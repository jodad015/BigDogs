// Derive the displayed status from dates so the UI is correct even when
// the DB hasn't been transitioned yet (e.g., between scheduled runs of
// transition_challenge_statuses).
//
// Special statuses (onboarding / maintenance / complete) pass through —
// only spinup ↔ active is date-derived.
export function displayChallengeStatus(
  participantStatus: string,
  challengeStartDate: string | null,
  durationWeeks: number,
): string {
  if (participantStatus === 'onboarding') return 'onboarding';
  if (participantStatus === 'maintenance') return 'maintenance';
  if (participantStatus === 'complete') return 'complete';

  if (!challengeStartDate) return participantStatus;

  const today = new Date().toISOString().split('T')[0]!;
  const endDate = new Date(challengeStartDate + 'T12:00:00');
  endDate.setDate(endDate.getDate() + durationWeeks * 7);
  const end = endDate.toISOString().split('T')[0]!;

  if (today > end) return 'complete';
  if (today >= challengeStartDate) return 'active';
  return 'spinup';
}
