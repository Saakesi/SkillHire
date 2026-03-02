import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { DeveloperDashboard } from './pages/DeveloperDashboard';
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
            <Route path="/dashboard"
              element={
                <ProtectedRoute>
                  <DeveloperDashboard />
                </ProtectedRoute>
              }
            />
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
