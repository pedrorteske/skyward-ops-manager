import { useMemo, useState, useEffect } from 'react';
import { format, isToday, isTomorrow, parseISO, startOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plane, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CircularOutlineKPI } from '@/components/dashboard/CircularOutlineKPI';
import { FlightPortalList } from '@/components/flights/FlightPortalList';
import { ResourceTimeline } from '@/components/dashboard/ResourceTimeline';
import { Button } from '@/components/ui/button';
import { useFlights } from '@/contexts/FlightsContext';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const { flights } = useFlights();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Filter and sort upcoming flights
  const upcomingFlights = useMemo(() => {
    return flights
      .filter((f) => f.status === 'scheduled' || f.status === 'delayed')
      .sort((a, b) => {
        const dateA = new Date(`${a.arrivalDate}T${a.arrivalTime}`);
        const dateB = new Date(`${b.arrivalDate}T${b.arrivalTime}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 10);
  }, [flights]);

  // Format greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const todayFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const localTime = format(currentTime, 'HH:mm:ss', { locale: ptBR });
  const utcTime = format(new Date(currentTime.toUTCString().slice(0, -4)), 'HH:mm:ss');

  return (
    <MainLayout>
      {/* Header with Clock */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {user?.name?.split(' ')[0] || 'Administrador'}!
          </h1>
          <p className="text-muted-foreground capitalize">{todayFormatted}</p>
        </div>
        
        {/* Clock Display */}
        <div className="flex items-center gap-4 bg-card border rounded-lg px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Local</p>
              <p className="font-mono text-sm font-semibold">{localTime}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">UTC</p>
            <p className="font-mono text-sm font-semibold">{utcTime}</p>
          </div>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Próximos Voos</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/flights" className="text-primary hover:text-primary/80">
              Ver todos →
            </Link>
          </Button>
        </div>
        <FlightPortalList flights={upcomingFlights} />
      </div>
    </MainLayout>
  );
}
