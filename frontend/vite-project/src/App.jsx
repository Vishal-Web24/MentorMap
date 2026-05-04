import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/authStore";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import RoadmapPage from "./pages/RoadmapPage";
import InterviewPage from "./pages/InterviewPage";
import InterviewSessionPage from "./pages/InterviewSessionPage";
import CommunityPage from "./pages/CommunityPage";
import MentorsPage from "./pages/MentorsPage";
import ProfilePage from "./pages/ProfilePage";
import Layout from "./components/shared/Layout";

function PrivateRoute({ children }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isProfileComplete) return <Navigate to="/onboarding" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { user } = useAuthStore();
  if (user && user.isProfileComplete) return <Navigate to="/dashboard" replace />;
  return children;
}

function OnboardingRoute() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <OnboardingPage />;
}

export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#161b22", color: "#e6edf3", border: "1px solid #30363d" },
          success: { iconTheme: { primary: "#3fb950", secondary: "#080c12" } },
          error: { iconTheme: { primary: "#f85149", secondary: "#080c12" } },
        }}
      />
      <Routes>
        <Route path="/" element={<AuthRoute><LandingPage /></AuthRoute>} />
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
        <Route path="/onboarding" element={<OnboardingRoute />} />
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/interview/:id" element={<InterviewSessionPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/mentors" element={<MentorsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}