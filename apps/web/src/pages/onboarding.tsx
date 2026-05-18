import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useProfile } from '@/hooks/use-profile';
import { useWeighIns } from '@/hooks/use-weigh-ins';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ChevronLeft } from 'lucide-react';

type GoalMethod = 'target_weight' | 'percent_loss' | 'target_bmi' | 'weekly_pace' | 'suggested_default';

const GOAL_METHODS: { value: GoalMethod; label: string; desc: string }[] = [
  { value: 'target_weight', label: 'I want to reach ___ lb', desc: 'Set a specific target weight' },
  { value: 'percent_loss', label: 'I want to lose ___%', desc: 'Percentage of body weight' },
  { value: 'target_bmi', label: 'I want to hit BMI ___', desc: 'Target a specific BMI' },
  { value: 'weekly_pace', label: "I'll lose ___ lb/week", desc: 'Set your own weekly pace' },
  { value: 'suggested_default', label: 'Use the suggested pace', desc: '1.5 lb/week — steady and sustainable' },
];

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            i === current ? 'bg-primary' : 'bg-border'
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const { id: challengeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { entries, isLoading: weighInsLoading } = useWeighIns(1);

  // Wait for profile + weigh-ins to load before rendering
  if (profileLoading || weighInsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasHeight = !!profile?.height_inches;
  const latestWeight = entries.length > 0 ? entries[0]!.weight : null;
  const initialStep = hasHeight ? 1 : 0;

  return <OnboardingWizard
    challengeId={challengeId}
    navigate={navigate}
    user={user}
    profile={profile}
    updateProfile={updateProfile}
    hasHeight={hasHeight}
    initialStep={initialStep}
    latestWeight={latestWeight}
  />;
}

function OnboardingWizard({ challengeId, navigate, user, profile, updateProfile, hasHeight, initialStep, latestWeight }: {
  challengeId: string | undefined;
  navigate: ReturnType<typeof useNavigate>;
  user: ReturnType<typeof useAuth>['user'];
  profile: ReturnType<typeof useProfile>['profile'];
  updateProfile: ReturnType<typeof useProfile>['updateProfile'];
  hasHeight: boolean;
  initialStep: number;
  latestWeight: number | null;
}) {
  const [step, setStep] = useState(initialStep);
  const [feet, setFeet] = useState(profile?.height_inches ? String(Math.floor(profile.height_inches / 12)) : '');
  const [inches, setInches] = useState(profile?.height_inches ? String(profile.height_inches % 12) : '');
  const [currentWeight, setCurrentWeight] = useState(latestWeight ? String(latestWeight) : '');
  const [goalMethod, setGoalMethod] = useState<GoalMethod | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const startingWeight = parseFloat(currentWeight) || 0;
  const hasWeight = !!latestWeight;
  const heightInches = hasHeight ? profile!.height_inches! : (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);

  // Steps: height (0) → current weight (1) → goal method (2) → goal input (3) → review (4)
  // Skip height if profile has it, skip weight if they have weigh-ins
  const skippedSteps = (hasHeight ? 1 : 0) + (hasWeight ? 1 : 0);
  const totalSteps = 5 - skippedSteps;
  const displayStep = step - (hasHeight ? 1 : 0) - (hasWeight && step > 1 ? 1 : 0);
  const goalValue = parseFloat(goalInput) || 0;

  const computedValues = (() => {
    if (goalMethod === 'suggested_default') {
      return { weeklyPace: 1.5, totalLoss: 1.5 * 12, targetWeight: startingWeight - 1.5 * 12 };
    }
    if (goalMethod === 'target_weight' && goalValue > 0) {
      const totalLoss = startingWeight - goalValue;
      return { weeklyPace: Math.round((totalLoss / 12) * 10) / 10, totalLoss, targetWeight: goalValue };
    }
    if (goalMethod === 'percent_loss' && goalValue > 0) {
      const totalLoss = Math.round(startingWeight * (goalValue / 100) * 10) / 10;
      return { weeklyPace: Math.round((totalLoss / 12) * 10) / 10, totalLoss, targetWeight: startingWeight - totalLoss };
    }
    if (goalMethod === 'weekly_pace' && goalValue > 0) {
      const totalLoss = goalValue * 12;
      return { weeklyPace: goalValue, totalLoss, targetWeight: startingWeight - totalLoss };
    }
    if (goalMethod === 'target_bmi' && goalValue > 0 && heightInches > 0) {
      const targetWeight = Math.round(goalValue * (heightInches * heightInches) / 703);
      const totalLoss = startingWeight - targetWeight;
      return { weeklyPace: Math.round((totalLoss / 12) * 10) / 10, totalLoss, targetWeight };
    }
    return null;
  })();

  const paceWarning = computedValues && computedValues.weeklyPace > 2.0;

  const canNext = (() => {
    if (step === 0) return heightInches >= 48 && heightInches <= 96;
    if (step === 1) return startingWeight >= 50 && startingWeight <= 999;
    if (step === 2) return goalMethod !== null;
    if (step === 3) return goalMethod === 'suggested_default' || (computedValues !== null && goalValue > 0);
    return true;
  })();

  const handleNext = async () => {
    if (step === 0 && heightInches) {
      await updateProfile({ height_inches: heightInches });
    }
    if (step < 4) {
      // Skip weight step if we already have weigh-ins
      let nextStep = step + 1;
      if (nextStep === 1 && hasWeight) nextStep = 2;
      setStep(nextStep);
      return;
    }

    // Step 4: Confirm — save participant data
    if (!user || !challengeId || !computedValues) return;
    setSubmitting(true);
    setError('');

    const { error: err } = await supabase
      .from('participants')
      .update({
        starting_weight: startingWeight,
        goal_method: goalMethod,
        goal_input: goalMethod === 'suggested_default' ? 1.5 : goalValue,
        target_weight: computedValues.targetWeight,
        total_loss: computedValues.totalLoss,
        weekly_target: computedValues.weeklyPace,
        status: 'spinup',
      })
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id);

    if (err) {
      setError(err.message);
      setSubmitting(false);
    } else {
      navigate('/leaderboard');
    }
  };

  const handleBack = () => {
    const firstStep = hasHeight ? (hasWeight ? 2 : 1) : 0;
    if (step === firstStep) {
      navigate('/');
    } else {
      let prevStep = step - 1;
      // Skip weight step going back if we have weigh-ins
      if (prevStep === 1 && hasWeight) prevStep = 0;
      setStep(prevStep);
    }
  };

  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto min-h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={handleBack} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-lg font-bold">Set Up Your Challenge</h1>
      </div>

      <ProgressDots current={displayStep} total={totalSteps} />

      <div className="flex-1">
        {/* Step 1: Height */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">What's your height?</h2>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm text-muted-foreground mb-1">Feet</label>
                <input
                  type="number"
                  min="3"
                  max="8"
                  value={feet}
                  onChange={(e) => setFeet(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-muted-foreground mb-1">Inches</label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={inches}
                  onChange={(e) => setInches(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-4 py-3 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Used for safety checks only — never shared</p>
          </div>
        )}

        {/* Step 1: Current Weight */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">What's your current weight?</h2>
            <div className="flex items-center justify-center gap-3 mb-4">
              <input
                type="number"
                step="0.1"
                min="50"
                max="999"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                autoFocus
                className="w-32 rounded-lg border border-border bg-input px-4 py-3 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-muted-foreground text-lg">lb</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">Used to calculate your goal — you can update this later</p>
          </div>
        )}

        {/* Step 2: Goal Method */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">How do you want to set your goal?</h2>
            <div className="space-y-3">
              {GOAL_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setGoalMethod(m.value)}
                  className={`w-full text-left rounded-xl p-4 transition-colors ${
                    goalMethod === m.value
                      ? 'bg-card border-l-4 border-l-primary'
                      : 'bg-card border border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <p className="font-semibold text-sm">{m.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Goal Input */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Set your target</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {GOAL_METHODS.find((m) => m.value === goalMethod)?.label}
            </p>

            {goalMethod !== 'suggested_default' && (
              <input
                type="number"
                step="0.1"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder={goalMethod === 'target_weight' ? '175' : goalMethod === 'percent_loss' ? '10' : goalMethod === 'weekly_pace' ? '1.5' : '25'}
                className="w-full rounded-lg border border-border bg-input px-4 py-3 text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-ring mb-4"
              />
            )}

            {computedValues && (
              <div className="rounded-xl bg-card p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total loss</span>
                  <span className="font-bold">{computedValues.totalLoss.toFixed(1)} lb</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weekly pace</span>
                  <span className={`font-bold ${paceWarning ? 'text-warning' : ''}`}>
                    {computedValues.weeklyPace.toFixed(1)} lb/wk
                  </span>
                </div>
              </div>
            )}

            {paceWarning && (
              <div className="mt-4 rounded-xl border border-warning/30 bg-warning/10 p-4">
                <p className="text-sm text-warning font-medium">
                  That's {computedValues!.weeklyPace.toFixed(1)} lb/wk — above the 2.0 lb/wk sustainable limit.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Consider lowering your goal or extending the challenge duration.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && computedValues && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Review Your Goal</h2>
            <div className="rounded-xl bg-card p-5 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goal Method</span>
                <span className="font-medium capitalize">
                  {goalMethod?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target Weight</span>
                <span className="font-bold">{Math.round(computedValues.targetWeight)} lb</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Loss</span>
                <span className="font-bold">{computedValues.totalLoss.toFixed(1)} lb</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weekly Target</span>
                <span className="font-bold">{computedValues.weeklyPace.toFixed(1)} lb/wk</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mb-4">
              This goal is locked for the entire challenge.
            </p>
            {error && <p className="text-sm text-destructive text-center mb-4">{error}</p>}
          </div>
        )}
      </div>

      {/* Next/Confirm Button */}
      <button
        onClick={handleNext}
        disabled={!canNext || submitting}
        className="w-full rounded-xl bg-primary py-3.5 text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 mt-4"
      >
        {submitting ? 'Saving...' : step === 4 ? 'Confirm & Start' : 'Next'}
      </button>

      {step === 4 && (
        <button
          onClick={handleBack}
          className="w-full text-center text-sm text-muted-foreground mt-3 hover:text-foreground transition-colors"
        >
          Go Back
        </button>
      )}
    </div>
  );
}
