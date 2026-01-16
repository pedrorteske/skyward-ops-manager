import { useMemo } from 'react';
import { format, isToday, isTomorrow, parseISO, startOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plane, Clock, Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CircularOutlineKPI } from '@/components/dashboard/CircularOutlineKPI';
import { UpcomingFlightsCard } from '@/components/home/UpcomingFlightsCard';
import { ResourceTimeline } from '@/components/dashboard/ResourceTimeline';
import { Button } from '@/components/ui/button';
import { useFlights } from '@/contexts/FlightsContext';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const { flights } = useFlights();

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

    return {
      flightsToday,
      upcomingArrivals,
    };
  }, [flights]);

  // Format greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <MainLayout>
      {/* Header with New Flight Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {user?.name?.split(' ')[0] || 'Administrador'}!
          </h1>
          <p className="text-muted-foreground capitalize">{todayFormatted}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/flights">
              <Plus className="w-5 h-5 mr-2" />
              Novo Voo
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/clients">
              <Users className="w-5 h-5 mr-2" />
              Novo Cliente
            </Link>
          </Button>
        </div>
      </div>

      {/* Flight Timeline */}
      <div className="mb-8">
        <ResourceTimeline flights={flights} />
      </div>

      {/* Circular KPI Cards - Outline Style */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <CircularOutlineKPI
          title="Voos Hoje"
          value={kpis.flightsToday}
          icon={Plane}
          description="Operações do dia"
          variant="success"
        />
        <CircularOutlineKPI
          title="Próximas Chegadas"
          value={kpis.upcomingArrivals}
          icon={Clock}
          description="Próximas 24h"
          variant="success"
        />
      </div>

      {/* Upcoming Flights - Full Width */}
      <div>
        <UpcomingFlightsCard flights={flights} />
      </div>
    </MainLayout>
  );
}
