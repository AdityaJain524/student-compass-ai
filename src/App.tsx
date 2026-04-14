import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import Dashboard from "./pages/Dashboard";
import CareerNavigator from "./pages/CareerNavigator";
import AdmissionPredictor from "./pages/AdmissionPredictor";
import ROICalculator from "./pages/ROICalculator";
import AIMentor from "./pages/AIMentor";
import Applications from "./pages/Applications";
import LoanAssistance from "./pages/LoanAssistance";
import Notifications from "./pages/Notifications";
import AdminPanel from "./pages/AdminPanel";
import SettingsPage from "./pages/SettingsPage";
import Gamification from "./pages/Gamification";
import SOPGenerator from "./pages/SOPGenerator";
import Timeline from "./pages/Timeline";
import AIContent from "./pages/AIContent";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  useActivityTracker();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/career" element={<CareerNavigator />} />
        <Route path="/admission" element={<AdmissionPredictor />} />
        <Route path="/roi" element={<ROICalculator />} />
        <Route path="/chat" element={<AIMentor />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/loans" element={<LoanAssistance />} />
        <Route path="/rewards" element={<Gamification />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/sop" element={<SOPGenerator />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/ai-content" element={<AIContent />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
