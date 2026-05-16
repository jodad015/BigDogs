import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { PublicOnlyRoute } from '@/components/layout/public-only-route';
import { AppLayout } from '@/components/layout/app-layout';
import { LoadingScreen } from '@/components/layout/loading-screen';

const LoginPage = lazy(() => import('@/pages/login'));
const SignupPage = lazy(() => import('@/pages/signup'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const WeighInPage = lazy(() => import('@/pages/weigh-in'));
const ProfilePage = lazy(() => import('@/pages/profile'));
const CreateChallengePage = lazy(() => import('@/pages/create-challenge'));
const JoinChallengePage = lazy(() => import('@/pages/join-challenge'));
const OnboardingPage = lazy(() => import('@/pages/onboarding'));
const LeaderboardPage = lazy(() => import('@/pages/leaderboard'));
const TrendPage = lazy(() => import('@/pages/trend'));
const WeeklyResultsPage = lazy(() => import('@/pages/weekly-results'));
const ParticipantPage = lazy(() => import('@/pages/participant'));
const PublicChallengePage = lazy(() => import('@/pages/public-challenge'));

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/weigh-in" element={<WeighInPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/trend" element={<TrendPage />} />
                <Route path="/challenge/create" element={<CreateChallengePage />} />
                <Route path="/join" element={<JoinChallengePage />} />
                <Route path="/challenge/:id/onboarding" element={<OnboardingPage />} />
                <Route path="/challenge/:id/week" element={<WeeklyResultsPage />} />
                <Route path="/challenge/:challengeId/participant/:userId" element={<ParticipantPage />} />
              </Route>
            </Route>

            {/* Public (no auth required) */}
            <Route path="/challenge/:id/public" element={<PublicChallengePage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
