import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FlightsProvider } from "@/contexts/FlightsContext";
import { ClientsProvider } from "@/contexts/ClientsContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { GenDecProvider } from "@/contexts/GenDecContext";
import { ServicesProvider } from "@/contexts/ServicesContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ChartDetail from "./pages/ChartDetail";
import Flights from "./pages/Flights";
import Clients from "./pages/Clients";
import Financial from "./pages/Financial";
import GenDec from "./pages/GenDec";
import Settings from "./pages/Settings";
import PublicPortalSettings from "./pages/PublicPortalSettings";
import PublicPortal from "./pages/PublicPortal";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// App component with all providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <FlightsProvider>
          <ClientsProvider>
            <FinancialProvider>
              <ServicesProvider>
                <GenDecProvider>
                  <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/portal/:slug" element={<PublicPortal />} />
                    <Route
                      path="/home"
                      element={
                        <ProtectedRoute>
                          <Home />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/chart/:chartType"
                      element={
                        <ProtectedRoute>
                          <ChartDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/flights"
                      element={
                        <ProtectedRoute>
                          <Flights />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/clients"
                      element={
                        <ProtectedRoute>
                          <Clients />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/financial"
                      element={
                        <ProtectedRoute>
                          <Financial />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/gendec"
                      element={
                        <ProtectedRoute>
                          <GenDec />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/public-portal"
                      element={
                        <ProtectedRoute>
                          <PublicPortalSettings />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </TooltipProvider>
                </GenDecProvider>
              </ServicesProvider>
            </FinancialProvider>
          </ClientsProvider>
        </FlightsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;