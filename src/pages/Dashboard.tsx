import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { FlightCard } from '@/components/flights/FlightCard';
import { QuotationStatusBadge } from '@/components/quotations/QuotationStatusBadge';
import { ResourceTimeline } from '@/components/dashboard/ResourceTimeline';
import { useFlights } from '@/contexts/FlightsContext';
import { useClients } from '@/contexts/ClientsContext';
import { useQuotations } from '@/contexts/QuotationsContext';
import { Plane, PlaneLanding, FileText, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { flights } = useFlights();
  const { clients, getClientById } = useClients();
  const { quotations } = useQuotations();
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const todayFlights = flights.filter(f => f.arrivalDate === today || f.departureDate === today);
  const upcomingFlights = flights.filter(f => {
    // Check if flight has future arrival or departure
    const hasArrival = f.arrivalDate && f.arrivalDate >= today;
    const hasDeparture = f.departureDate && f.departureDate >= today;
    return f.status === 'scheduled' && (hasArrival || hasDeparture);
  }).slice(0, 5);
  
  // Calculate dynamic stats
  const activeClients = clients.filter(c => c.status === 'active').length;
  const openQuotations = quotations.filter(q => q.status === 'created' || q.status === 'sent').length;

  return (
    <MainLayout>
      <PageHeader 
        title="Dashboard" 
        description="Visão geral das operações aéreas"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Voos Hoje"
          value={todayFlights.length}
          description="Operações programadas"
          icon={Plane}
          variant="primary"
        />
        <StatsCard
          title="Próximas Chegadas"
          value={upcomingFlights.length}
          description="Voos agendados"
          icon={PlaneLanding}
          variant="success"
        />
        <StatsCard
          title="Cotações em Aberto"
          value={openQuotations}
          description="Aguardando resposta"
          icon={FileText}
          variant="warning"
        />
        <StatsCard
          title="Clientes Ativos"
          value={activeClients}
          description="Cadastros ativos"
          icon={Users}
          variant="info"
        />
      </div>

      {/* Resource Timeline / Scheduler */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Calendário Operacional</h2>
          <Link to="/flights">
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos os voos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <ResourceTimeline flights={flights} />
      </div>

      {/* Upcoming Arrivals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Próximas Chegadas</h2>
          <Link to="/flights">
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="aviation-card overflow-hidden">
          {upcomingFlights.length > 0 ? (
            <div className="divide-y divide-border">
              {upcomingFlights.map((flight) => (
                <div key={flight.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <PlaneLanding className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-callsign">{flight.aircraftPrefix}</p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">{flight.aircraftModel}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {flight.origin} → {flight.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(flight.arrivalDate).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short' 
                      })}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ETA {flight.arrivalTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <PlaneLanding className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum voo programado</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
