import { useAircraft } from '@/contexts/AircraftContext';
import { CircularOutlineKPI } from '@/components/dashboard/CircularOutlineKPI';
import { Plane, RotateCcw, FileCheck } from 'lucide-react';

export function AircraftDashboard() {
  const { aircraft } = useAircraft();

  const activeAircraft = aircraft.filter(a => a.status === 'active');
  const fixedWingCount = activeAircraft.filter(a => a.category === 'fixed_wing').length;
  const helicopterCount = activeAircraft.filter(a => a.category === 'helicopter').length;

  const withAllDocs = activeAircraft.filter(a => 
    a.hasAvanac && a.hasAvoem && a.hasTecat
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <CircularOutlineKPI
        title="Total Ativas"
        value={activeAircraft.length}
        icon={Plane}
        variant="primary"
      />
      <CircularOutlineKPI
        title="Asa Fixa"
        value={fixedWingCount}
        icon={Plane}
        variant="info"
      />
      <CircularOutlineKPI
        title="Helicópteros"
        value={helicopterCount}
        icon={RotateCcw}
        variant="warning"
      />
      <CircularOutlineKPI
        title="Docs Completos"
        value={withAllDocs}
        icon={FileCheck}
        variant="success"
      />
    </div>
  );
}
