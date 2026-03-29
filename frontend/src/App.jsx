import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import Leaderboard from "./pages/Leaderboard";
import PublicProfile from "./pages/PublicProfile";
import RecruiterAuth from "./pages/RecruiterAuth";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import LandingPage from "./components/landing/LandingPage";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthCallback } from "./pages/AuthCallback";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile/:username" element={<PublicProfile />} />

            {/* Recruiter */}
            <Route path="/recruiter" element={<RecruiterAuth />} />
            <Route path="/recruiters" element={<RecruiterAuth />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />

            {/* Developer dashboard */}
            <Route path="/dashboard"
              element={
                <ProtectedRoute>
                  <DeveloperDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
