import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import { DeveloperDashboard } from './pages/DeveloperDashboard';
import Leaderboard from "./pages/Leaderboard";
import PublicProfile from "./pages/PublicProfile";
import RecruiterAuth from "./pages/RecruiterAuth";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Engineering from "./pages/Engineering";
import LandingPage from "./components/landing/LandingPage";
import Referrals from "./pages/Referrals";
import Messages from "./pages/Messages";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { AuthCallback } from "./pages/AuthCallback";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import axios from "axios";

axios.defaults.withCredentials = true;

function HomeRoute() {
  const { loading, isAuthenticated, role } = useAuth();

  if (loading) return null;
  if (isAuthenticated && role === "recruiter") {
    return <Navigate to="/recruiter/dashboard" replace />;
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile/:username" element={<PublicProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/engineering" element={<Engineering />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

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

            <Route
              path="/referrals"
              element={
                <ProtectedRoute>
                  <Referrals />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages/:username"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
