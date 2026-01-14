import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FlightsProvider } from "@/contexts/FlightsContext";
import { ClientsProvider } from "@/contexts/ClientsContext";
import { QuotationsProvider } from "@/contexts/QuotationsContext";
import { FinancialProvider } from "@/contexts/FinancialContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Flights from "./pages/Flights";
import Clients from "./pages/Clients";
import Quotations from "./pages/Quotations";
import Financial from "./pages/Financial";
import Settings from "./pages/Settings";
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
            <QuotationsProvider>
              <FinancialProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route
                      path="/"
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
                      path="/quotations"
                      element={
                        <ProtectedRoute>
                          <Quotations />
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
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </FinancialProvider>
            </QuotationsProvider>
          </ClientsProvider>
        </FlightsProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
