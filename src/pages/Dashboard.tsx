import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { CircularOutlineKPI } from '@/components/dashboard/CircularOutlineKPI';
import { DashboardFilters, DashboardFiltersState } from '@/components/dashboard/DashboardFilters';
import { OperationsColumnChart } from '@/components/dashboard/OperationsColumnChart';
import { FlightTypePieChart } from '@/components/dashboard/FlightTypePieChart';
import { AircraftRankingChart } from '@/components/dashboard/AircraftRankingChart';
import { useFlights } from '@/contexts/FlightsContext';
import { Flight, FlightType, flightTypeLabels } from '@/types/aviation';
import {
  Plane,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  PlaneTakeoff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Extended flight types for ANAC classification - Cores saturadas
const flightTypeColors: Record<string, string> = {
  S: 'hsl(217, 95%, 55%)',
  N: 'hsl(199, 95%, 50%)',
  G: 'hsl(142, 90%, 42%)',
  M: 'hsl(38, 95%, 50%)',
  executive: 'hsl(262, 90%, 58%)',
  taxi: 'hsl(142, 90%, 45%)',
  commercial_regular: 'hsl(280, 90%, 55%)',
  commercial_non_regular: 'hsl(326, 90%, 55%)',
  cargo: 'hsl(25, 95%, 55%)',
  aeromedical: 'hsl(0, 90%, 55%)',
  domestic: 'hsl(199, 95%, 50%)',
  international: 'hsl(45, 95%, 50%)',
  instruction: 'hsl(173, 85%, 45%)',
};

export default function Dashboard() {
  const { flights } = useFlights();
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState<DashboardFiltersState>({
    startDate: undefined,
    endDate: undefined,
    base: 'all',
    flightType: 'all',
    status: 'all',
  });

  // Extract unique bases from flights (only from base field)
  const uniqueBases = useMemo(() => {
    const bases = new Set<string>();
    flights.forEach((flight) => {
      if (flight.base) bases.add(flight.base);
    });
    return Array.from(bases).sort();
  }, [flights]);

  // Flight types for filter
  const flightTypes = [
    { value: 'S', label: 'Transporte Regular' },
    { value: 'N', label: 'Transporte Não Regular' },
    { value: 'G', label: 'Aviação Geral' },
    { value: 'M', label: 'Aeronave Militar' },
  ];

  // Filter flights based on current filters
  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      // Date range filter
      if (filters.startDate || filters.endDate) {
        const dateStr = flight.arrivalDate || flight.departureDate;
        if (!dateStr) return false;
        
        try {
          const flightDate = parseISO(dateStr);
          if (isNaN(flightDate.getTime())) return false;
          if (filters.startDate && flightDate < filters.startDate) return false;
          if (filters.endDate && flightDate > filters.endDate) return false;
        } catch {
          return false;
        }
      }

      // Base filter (using base field only)
      if (filters.base !== 'all') {
        if (flight.base !== filters.base) {
          return false;
        }
      }

      // Flight type filter
      if (filters.flightType !== 'all' && flight.flightType !== filters.flightType) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && flight.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [flights, filters]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = filteredFlights.length;
    const completed = filteredFlights.filter(
      (f) => f.status === 'arrived' || f.status === 'departed'
    ).length;
    const inProgress = filteredFlights.filter((f) => f.status === 'scheduled').length;
    const cancelled = filteredFlights.filter((f) => f.status === 'cancelled').length;

    // Unique bases (only from base field)
    const activeBases = new Set<string>();
    filteredFlights.forEach((f) => {
      if (f.base) activeBases.add(f.base);
    });

    // Unique aircraft
    const activeAircraft = new Set<string>();
    filteredFlights.forEach((f) => {
      if (f.aircraftPrefix) activeAircraft.add(f.aircraftPrefix);
    });

    return {
      total,
      completed,
      inProgress,
      cancelled,
      activeBases: activeBases.size,
      activeAircraft: activeAircraft.size,
    };
  }, [filteredFlights]);

  // Monthly operations data
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, number>();
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = format(date, 'MMM/yy', { locale: ptBR });
      monthMap.set(key, 0);
    }

    filteredFlights.forEach((flight) => {
      const dateStr = flight.arrivalDate || flight.departureDate;
      if (!dateStr) return;
      
      try {
        const date = parseISO(dateStr);
        if (isNaN(date.getTime())) return;
        
        const key = format(date, 'MMM/yy', { locale: ptBR });
        if (monthMap.has(key)) {
          monthMap.set(key, (monthMap.get(key) || 0) + 1);
        }
      } catch {
        // Skip invalid dates
      }
    });

    return Array.from(monthMap.entries()).map(([month, operations]) => ({
      month,
      operations,
    }));
  }, [filteredFlights]);

  // Flight type distribution (ANAC classification)
  const flightTypeData = useMemo(() => {
    const typeMap = new Map<FlightType, number>();

    filteredFlights.forEach((flight) => {
      const type = flight.flightType;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    return Array.from(typeMap.entries()).map(([type, value]) => ({
      name: flightTypeLabels[type],
      value,
      color: flightTypeColors[type] || 'hsl(var(--muted-foreground))',
    }));
  }, [filteredFlights]);

  // Aircraft ranking (grouped by model only)
  const aircraftData = useMemo(() => {
    const modelMap = new Map<string, number>();

    filteredFlights.forEach((flight) => {
      const model = flight.aircraftModel;
      if (model) {
        modelMap.set(model, (modelMap.get(model) || 0) + 1);
      }
    });

    return Array.from(modelMap.entries())
      .map(([model, operations]) => ({
        model,
        operations,
      }))
      .sort((a, b) => b.operations - a.operations)
      .slice(0, 8);
  }, [filteredFlights]);

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard Analítico"
        description="Visão consolidada das operações aéreas"
      />

      {/* Filters */}
      <div className="mb-6">
        <DashboardFilters
          filters={filters}
          onFiltersChange={setFilters}
          bases={uniqueBases}
          flightTypes={flightTypes}
        />
      </div>

      {/* Circular KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <CircularOutlineKPI
          title="Total de Operações"
          value={kpis.total}
          icon={Plane}
          description="No período"
          variant="primary"
        />
        <CircularOutlineKPI
          title="Concluídas"
          value={kpis.completed}
          icon={CheckCircle2}
          description="Chegaram ou partiram"
          variant="success"
        />
        <CircularOutlineKPI
          title="Em Andamento"
          value={kpis.inProgress}
          icon={Clock}
          description="Programadas"
          variant="info"
        />
        <CircularOutlineKPI
          title="Canceladas"
          value={kpis.cancelled}
          icon={XCircle}
          description="No período"
          variant="danger"
        />
        <CircularOutlineKPI
          title="Bases Ativas"
          value={kpis.activeBases}
          icon={Building2}
          description="Aeroportos"
          variant="warning"
        />
        <CircularOutlineKPI
          title="Aeronaves Ativas"
          value={kpis.activeAircraft}
          icon={PlaneTakeoff}
          description="Com operações"
          variant="default"
        />
      </div>

      {/* Charts Grid - Clean layout with only essential charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OperationsColumnChart 
          data={monthlyData} 
          onClick={() => navigate('/dashboard/chart/operations-month')}
        />
        <FlightTypePieChart 
          data={flightTypeData}
          onClick={() => navigate('/dashboard/chart/flight-type')}
        />
        <div className="lg:col-span-2">
          <AircraftRankingChart 
            data={aircraftData}
            onClick={() => navigate('/dashboard/chart/aircraft-ranking')}
            title="Modelos de Aeronaves Atendidas"
          />
        </div>
      </div>
    </MainLayout>
  );
}
