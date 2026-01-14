import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardKPICard } from '@/components/dashboard/DashboardKPICard';
import { DashboardFilters, DashboardFiltersState } from '@/components/dashboard/DashboardFilters';
import { OperationsColumnChart } from '@/components/dashboard/OperationsColumnChart';
import { BaseDistributionChart } from '@/components/dashboard/BaseDistributionChart';
import { FlightTypePieChart } from '@/components/dashboard/FlightTypePieChart';
import { AircraftRankingChart } from '@/components/dashboard/AircraftRankingChart';
import { RankingTable } from '@/components/dashboard/RankingTable';
import { useFlights } from '@/contexts/FlightsContext';
import { Flight, FlightType, flightTypeLabels } from '@/types/aviation';
import {
  Plane,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  PlaneTakeoff,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
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

  // Filter state
  const [filters, setFilters] = useState<DashboardFiltersState>({
    startDate: undefined,
    endDate: undefined,
    base: 'all',
    flightType: 'all',
    status: 'all',
  });

  // Extract unique bases from flights
  const uniqueBases = useMemo(() => {
    const bases = new Set<string>();
    flights.forEach((flight) => {
      if (flight.origin) bases.add(flight.origin);
      if (flight.destination) bases.add(flight.destination);
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

      // Base filter
      if (filters.base !== 'all') {
        if (flight.origin !== filters.base && flight.destination !== filters.base) {
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

    // Unique bases
    const activeBases = new Set<string>();
    filteredFlights.forEach((f) => {
      if (f.origin) activeBases.add(f.origin);
      if (f.destination) activeBases.add(f.destination);
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

  // Base distribution data
  const baseData = useMemo(() => {
    const baseMap = new Map<string, number>();

    filteredFlights.forEach((flight) => {
      if (flight.origin) {
        baseMap.set(flight.origin, (baseMap.get(flight.origin) || 0) + 1);
      }
      if (flight.destination) {
        baseMap.set(flight.destination, (baseMap.get(flight.destination) || 0) + 1);
      }
    });

    return Array.from(baseMap.entries())
      .map(([base, operations]) => ({ base, operations }))
      .sort((a, b) => b.operations - a.operations)
      .slice(0, 8);
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

  // Aircraft ranking
  const aircraftData = useMemo(() => {
    const aircraftMap = new Map<string, { operations: number; model: string }>();

    filteredFlights.forEach((flight) => {
      const prefix = flight.aircraftPrefix;
      const existing = aircraftMap.get(prefix);
      if (existing) {
        existing.operations++;
      } else {
        aircraftMap.set(prefix, { operations: 1, model: flight.aircraftModel });
      }
    });

    return Array.from(aircraftMap.entries())
      .map(([aircraft, data]) => ({
        aircraft,
        operations: data.operations,
        model: data.model,
      }))
      .sort((a, b) => b.operations - a.operations)
      .slice(0, 8);
  }, [filteredFlights]);

  // Aircraft ranking for table
  const aircraftRanking = useMemo(() => {
    return aircraftData.slice(0, 10).map((item, index) => ({
      position: index + 1,
      prefix: item.aircraft,
      model: item.model,
      operations: item.operations,
    }));
  }, [aircraftData]);

  // Base ranking for table
  const baseRanking = useMemo(() => {
    return baseData.slice(0, 10).map((item, index) => ({
      position: index + 1,
      icao: item.base,
      operations: item.operations,
    }));
  }, [baseData]);

  return (
    <MainLayout>
      <PageHeader
        title="Dashboard Operacional"
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <DashboardKPICard
          title="Total de Operações"
          value={kpis.total}
          icon={Plane}
          description="No período"
          variant="primary"
        />
        <DashboardKPICard
          title="Concluídas"
          value={kpis.completed}
          icon={CheckCircle2}
          description="Chegaram ou partiram"
          variant="success"
        />
        <DashboardKPICard
          title="Em Andamento"
          value={kpis.inProgress}
          icon={Clock}
          description="Programadas"
          variant="info"
        />
        <DashboardKPICard
          title="Canceladas"
          value={kpis.cancelled}
          icon={XCircle}
          description="No período"
          variant="danger"
        />
        <DashboardKPICard
          title="Bases Ativas"
          value={kpis.activeBases}
          icon={Building2}
          description="Aeroportos"
          variant="warning"
        />
        <DashboardKPICard
          title="Aeronaves Ativas"
          value={kpis.activeAircraft}
          icon={PlaneTakeoff}
          description="Com operações"
          variant="default"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <OperationsColumnChart data={monthlyData} />
        <BaseDistributionChart data={baseData} />
        <FlightTypePieChart data={flightTypeData} />
        <AircraftRankingChart data={aircraftData} />
      </div>

      {/* Rankings Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingTable type="aircraft" aircraftData={aircraftRanking} />
        <RankingTable type="base" baseData={baseRanking} />
      </div>
    </MainLayout>
  );
}
