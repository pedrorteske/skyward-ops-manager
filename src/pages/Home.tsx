import { useMemo } from 'react';
import { format, isToday, isTomorrow, parseISO, startOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plane, Clock, FileText, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HomeKPICard } from '@/components/home/HomeKPICard';
import { UpcomingFlightsCard } from '@/components/home/UpcomingFlightsCard';
import { QuickActionsCard } from '@/components/home/QuickActionsCard';
import { RecentQuotationsCard } from '@/components/home/RecentQuotationsCard';
import { FinancialSummaryCard } from '@/components/home/FinancialSummaryCard';
import { useFlights } from '@/contexts/FlightsContext';
import { useClients } from '@/contexts/ClientsContext';
import { useQuotations } from '@/contexts/QuotationsContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const { flights } = useFlights();
  const { clients } = useClients();
  const { quotations } = useQuotations();
  const { documents } = useFinancial();

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);

    // Flights today
    const flightsToday = flights.filter((f) => {
      const arrivalDate = parseISO(f.arrivalDate);
      return isToday(arrivalDate);
    }).length;

    // Upcoming arrivals (next 24h)
    const upcomingArrivals = flights.filter((f) => {
      const arrivalDate = parseISO(f.arrivalDate);
      return (isToday(arrivalDate) || isTomorrow(arrivalDate)) && 
             (f.status === 'scheduled' || f.status === 'delayed');
    }).length;

    // Pending quotations
    const pendingQuotations = quotations.filter(
      (q) => q.status === 'created' || q.status === 'sent'
    ).length;

    // Pending quotations value
    const pendingValue = quotations
      .filter((q) => q.status === 'created' || q.status === 'sent')
      .reduce((sum, q) => sum + q.total, 0);

    // Active clients
    const activeClients = clients.filter((c) => c.status === 'active').length;

    return {
      flightsToday,
      upcomingArrivals,
      pendingQuotations,
      pendingValue,
      activeClients,
    };
  }, [flights, clients, quotations]);

  // Format greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {user?.name?.split(' ')[0] || 'Administrador'}!
        </h1>
        <p className="text-muted-foreground capitalize">{todayFormatted}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <HomeKPICard
          title="Voos Hoje"
          value={kpis.flightsToday}
          icon={Plane}
          href="/flights"
          variant="primary"
        />
        <HomeKPICard
          title="Próximas Chegadas"
          value={kpis.upcomingArrivals}
          subtitle="Próximas 24h"
          icon={Clock}
          href="/flights"
          variant="success"
        />
        <HomeKPICard
          title="Cotações Pendentes"
          value={kpis.pendingQuotations}
          subtitle={formatCurrency(kpis.pendingValue)}
          icon={FileText}
          href="/quotations"
          variant="warning"
        />
        <HomeKPICard
          title="Clientes Ativos"
          value={kpis.activeClients}
          icon={Users}
          href="/clients"
          variant="default"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Flights */}
        <div className="lg:col-span-2">
          <UpcomingFlightsCard flights={flights} />
        </div>

        {/* Right Column - Quick Actions */}
        <div>
          <QuickActionsCard />
        </div>

        {/* Bottom Row */}
        <div className="lg:col-span-2">
          <RecentQuotationsCard quotations={quotations} />
        </div>

        <div>
          <FinancialSummaryCard documents={documents} />
        </div>
      </div>
    </MainLayout>
  );
}
