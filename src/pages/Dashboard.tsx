import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { FlightCard } from '@/components/flights/FlightCard';
import { QuotationStatusBadge } from '@/components/quotations/QuotationStatusBadge';
import { mockFlights, mockQuotations, mockDashboardStats, getClientById } from '@/data/mockData';
import { Plane, PlaneLanding, FileText, Users, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const todayFlights = mockFlights.filter(f => f.arrivalDate === '2026-01-08' || f.departureDate === '2026-01-08');
  const upcomingFlights = mockFlights.filter(f => f.status === 'scheduled').slice(0, 3);
  const recentQuotations = mockQuotations.slice(0, 3);

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
          value={mockDashboardStats.flightsToday}
          description="Operações programadas"
          icon={Plane}
          variant="primary"
        />
        <StatsCard
          title="Próximas Chegadas"
          value={mockDashboardStats.upcomingArrivals}
          description="Nas próximas 24h"
          icon={PlaneLanding}
          variant="success"
        />
        <StatsCard
          title="Cotações em Aberto"
          value={mockDashboardStats.openQuotations}
          description="Aguardando resposta"
          icon={FileText}
          variant="warning"
        />
        <StatsCard
          title="Clientes Ativos"
          value={mockDashboardStats.activeClients}
          description="Cadastros ativos"
          icon={Users}
          variant="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Flights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Voos de Hoje</h2>
            <Link to="/flights">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {todayFlights.length > 0 ? (
              todayFlights.map((flight) => (
                <FlightCard key={flight.id} flight={flight} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg">
                <Plane className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum voo programado para hoje</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Cotações Recentes</h2>
            <Link to="/quotations">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todas <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentQuotations.map((quotation) => {
              const client = getClientById(quotation.clientId);
              const clientName = client?.type === 'PF' ? client.fullName : client?.operator;
              
              return (
                <div 
                  key={quotation.id} 
                  className="aviation-card p-4 hover:border-primary/50 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm font-semibold text-foreground">
                        {quotation.number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {clientName}
                      </p>
                    </div>
                    <QuotationStatusBadge status={quotation.status} />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">
                        Válida até {new Date(quotation.validUntil).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {quotation.currency === 'BRL' ? 'R$' : 'US$'}{' '}
                      {quotation.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Arrivals Timeline */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Próximas Chegadas</h2>
        </div>
        <div className="aviation-card overflow-hidden">
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
                  <p className="text-lg font-bold text-primary">{flight.arrivalTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
