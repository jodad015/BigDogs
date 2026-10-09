import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { PublicOnlyRoute } from '@/components/layout/public-only-route';
import { AppLayout } from '@/components/layout/app-layout';
import { OrgLayout } from '@/components/layout/org-layout';
import { LoadingScreen } from '@/components/layout/loading-screen';

const LoginPage = lazy(() => import('@/pages/login'));
const SignupPage = lazy(() => import('@/pages/signup'));
const OrgIndexPage = lazy(() => import('@/pages/org-index'));
const OrgsPage = lazy(() => import('@/pages/orgs'));
const JoinPage = lazy(() => import('@/pages/join'));
const ProfilePage = lazy(() => import('@/pages/profile'));
const BoardsPage = lazy(() => import('@/pages/org/boards'));
const PeoplePage = lazy(() => import('@/pages/org/people'));
const InvitesPage = lazy(() => import('@/pages/org/invites'));
const OrgSettingsPage = lazy(() => import('@/pages/org/settings'));
const NewBoardPage = lazy(() => import('@/pages/org/new-board'));
const BoardPage = lazy(() => import('@/pages/org/board'));
const EditBoardPage = lazy(() => import('@/pages/org/edit-board'));
const LogEntryPage = lazy(() => import('@/pages/org/log-entry'));

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
                <Route path="/" element={<OrgIndexPage />} />
                <Route element={<AppLayout />}>
                  <Route path="/orgs" element={<OrgsPage />} />
                  <Route path="/join/:code" element={<JoinPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/o/:slug" element={<OrgLayout />}>
                    <Route index element={<BoardsPage />} />
                    <Route path="people" element={<PeoplePage />} />
                    <Route path="invites" element={<InvitesPage />} />
                    <Route path="settings" element={<OrgSettingsPage />} />
                    <Route path="new" element={<NewBoardPage />} />
                    <Route path="b/:boardId" element={<BoardPage />} />
                    <Route path="b/:boardId/edit" element={<EditBoardPage />} />
                    <Route path="b/:boardId/log" element={<LogEntryPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
