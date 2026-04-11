import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
