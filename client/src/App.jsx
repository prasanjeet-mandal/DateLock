import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/common/Navbar';
import BottomDock from './components/common/BottomDock';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DiscoverPage from './pages/DiscoverPage';
import Campus3DPage from './pages/Campus3DPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import VerificationPage from './pages/VerificationPage';
import SettingsPage from './pages/SettingsPage';
import SecretAdminPortal from './pages/SecretAdminPortal';

// Protected Route wrapper: requires authenticated user
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0612] text-pink-400 font-bold">
        Loading DateLock...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/discover" replace />;
  }

  return children;
}

// Public-Only Route wrapper: logged-in users cannot see Landing, Login, or Register pages
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0612] text-pink-400 font-bold">
        Loading DateLock...
      </div>
    );
  }

  // If already logged in, redirect straight to user's campus dashboard
  if (isAuthenticated) {
    return <Navigate to="/discover" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
              {/* Main Navbar */}
              <Navbar />

              {/* Main Content Area */}
              <main className="flex-1">
                <Routes>
                  {/* Public-Only Routes: Hidden when logged in */}
                  <Route
                    path="/"
                    element={
                      <PublicOnlyRoute>
                        <LandingPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicOnlyRoute>
                        <RegisterPage />
                      </PublicOnlyRoute>
                    }
                  />

                  {/* Protected Student Routes */}
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <OnboardingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/discover"
                    element={
                      <ProtectedRoute>
                        <DiscoverPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campus-3d"
                    element={
                      <ProtectedRoute>
                        <Campus3DPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/matches"
                    element={
                      <ProtectedRoute>
                        <MatchesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/messages/:matchId"
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/verification"
                    element={
                      <ProtectedRoute>
                        <VerificationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Secluded Administrative Gateway (Special Secret URL) */}
                  <Route
                    path="/vault-panel-7729"
                    element={<SecretAdminPortal />}
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Mobile Thumb Dock */}
              <BottomDock />
            </div>
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}
