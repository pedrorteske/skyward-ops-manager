import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FlightsProvider } from "@/contexts/FlightsContext";
import { ClientsProvider } from "@/contexts/ClientsContext";
import { QuotationsProvider } from "@/contexts/QuotationsContext";
import Dashboard from "./pages/Dashboard";
import Flights from "./pages/Flights";
import Clients from "./pages/Clients";
import Quotations from "./pages/Quotations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FlightsProvider>
        <ClientsProvider>
          <QuotationsProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/flights" element={<Flights />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/quotations" element={<Quotations />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QuotationsProvider>
        </ClientsProvider>
      </FlightsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
