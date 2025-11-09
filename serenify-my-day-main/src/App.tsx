import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Meditation from "./pages/Meditation";
import MeditationLibrary from "./pages/MeditationLibrary";
import Affirmations from "./pages/Affirmations";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Journal from "./pages/Journal";
import Breathing from "./pages/Breathing";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/meditation" element={<ProtectedRoute><Meditation /></ProtectedRoute>} />
              <Route path="/meditation-library" element={<ProtectedRoute><MeditationLibrary /></ProtectedRoute>} />
              <Route path="/affirmations" element={<ProtectedRoute><Affirmations /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
              <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
              <Route path="/breathing" element={<ProtectedRoute><Breathing /></ProtectedRoute>} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failure" element={<PaymentFailure />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
