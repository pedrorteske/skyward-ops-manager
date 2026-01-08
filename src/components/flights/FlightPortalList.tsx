import { Flight, flightStatusLabels } from '@/types/aviation';
import { cn } from '@/lib/utils';
import { Circle } from 'lucide-react';

interface FlightPortalListProps {
  flights: Flight[];
  onFlightClick?: (flight: Flight) => void;
}

const statusIndicator: Record<Flight['status'], string> = {
  scheduled: 'text-sky-500',
  arrived: 'text-emerald-500',
  departed: 'text-violet-500',
  cancelled: 'text-red-500',
  delayed: 'text-amber-500',
};

export function FlightPortalList({ flights, onFlightClick }: FlightPortalListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  if (flights.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground/60">
        <p className="text-xs font-medium tracking-wide uppercase">Nenhum voo registrado</p>
      </div>
    );
  }

  return (
    <div className="font-mono text-xs">
      {/* Header */}
      <div className="flex items-center gap-0 px-3 py-2 text-muted-foreground/70 uppercase tracking-widest border-b border-border/50 bg-muted/30">
        <div className="w-28 shrink-0">Aeronave</div>
        <div className="w-24 shrink-0">Rota</div>
        <div className="w-20 shrink-0 text-center">Data</div>
        <div className="w-16 shrink-0 text-center">ETA</div>
        <div className="w-16 shrink-0 text-center">ETD</div>
        <div className="flex-1 text-right pr-1">Status</div>
      </div>

      {/* Flight Rows */}
      <div>
        {flights.map((flight, index) => (
          <div
            key={flight.id}
            onClick={() => onFlightClick?.(flight)}
            className={cn(
              "flex items-center gap-0 px-3 py-2 cursor-pointer transition-colors",
              "hover:bg-muted/40",
              index % 2 === 0 ? "bg-transparent" : "bg-muted/20"
            )}
          >
            {/* Aircraft - Prefix + Model */}
            <div className="w-28 shrink-0 flex items-center gap-1.5">
              <span className="font-semibold text-foreground tracking-wide">
                {flight.aircraftPrefix}
              </span>
              <span className="text-muted-foreground/60 text-[10px]">
                {flight.aircraftModel}
              </span>
            </div>

            {/* Route */}
            <div className="w-24 shrink-0">
              <span className="text-foreground font-medium">{flight.origin}</span>
              <span className="text-muted-foreground/50 mx-1">→</span>
              <span className="text-foreground font-medium">{flight.destination}</span>
            </div>

            {/* Date */}
            <div className="w-20 shrink-0 text-center text-muted-foreground">
              {formatDate(flight.arrivalDate)}
            </div>

            {/* ETA */}
            <div className="w-16 shrink-0 text-center text-foreground font-medium">
              {flight.arrivalTime}
            </div>

            {/* ETD */}
            <div className="w-16 shrink-0 text-center text-foreground font-medium">
              {flight.departureTime}
            </div>

            {/* Status */}
            <div className="flex-1 flex items-center justify-end gap-1.5 pr-1">
              <Circle className={cn("w-2 h-2 fill-current", statusIndicator[flight.status])} />
              <span className={cn("text-[10px] uppercase tracking-wide", statusIndicator[flight.status])}>
                {flightStatusLabels[flight.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
