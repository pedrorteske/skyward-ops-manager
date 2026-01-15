import { Flight, flightStatusLabels } from '@/types/aviation';
import { cn } from '@/lib/utils';
import { Plane, ArrowRight } from 'lucide-react';

interface FlightPortalListProps {
  flights: Flight[];
  onFlightClick?: (flight: Flight) => void;
}

const statusColors: Record<Flight['status'], string> = {
  scheduled: 'text-info',
  arrived: 'text-success',
  departed: 'text-primary',
  cancelled: 'text-destructive',
  delayed: 'text-warning',
};

const statusBgColors: Record<Flight['status'], string> = {
  scheduled: 'bg-info/10',
  arrived: 'bg-success/10',
  departed: 'bg-primary/10',
  cancelled: 'bg-destructive/10',
  delayed: 'bg-warning/10',
};

export function FlightPortalList({ flights, onFlightClick }: FlightPortalListProps) {
  const formatTime = (time: string) => time;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).toUpperCase();
  };

  if (flights.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border border-border">
        <Plane className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm font-medium">Nenhum voo encontrado</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
        <div className="col-span-1">Aeronave</div>
        <div className="col-span-2">Modelo</div>
        <div className="col-span-2">Rota</div>
        <div className="col-span-1">Data</div>
        <div className="col-span-1">Chegada</div>
        <div className="col-span-1">Data</div>
        <div className="col-span-1">Saída</div>
        <div className="col-span-3 text-right">Status</div>
      </div>

      {/* Flight Rows */}
      <div className="divide-y divide-border">
        {flights.map((flight) => (
          <div
            key={flight.id}
            onClick={() => onFlightClick?.(flight)}
            className={cn(
              "grid grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer transition-colors",
              "hover:bg-muted/30"
            )}
          >
            {/* Aircraft Prefix */}
            <div className="col-span-1 flex items-center gap-1">
              <Plane className="w-3 h-3 text-primary shrink-0" />
              <span className="text-sm font-mono font-semibold text-foreground truncate">
                {flight.aircraftPrefix}
              </span>
            </div>

            {/* Aircraft Model */}
            <div className="col-span-2">
              <span className="text-sm text-foreground truncate block">
                {flight.aircraftModel}
              </span>
            </div>

            {/* Route */}
            <div className="col-span-2 flex items-center gap-1">
              <span className="text-sm font-mono font-bold text-foreground">
                {flight.origin}
              </span>
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-sm font-mono font-bold text-foreground">
                {flight.destination}
              </span>
            </div>

            {/* Arrival Date */}
            <div className="col-span-1">
              <span className="text-xs text-muted-foreground">
                {formatDate(flight.arrivalDate)}
              </span>
            </div>

            {/* Arrival Time */}
            <div className="col-span-1">
              <span className="text-sm font-mono font-semibold text-foreground">
                {formatTime(flight.arrivalTime)}
              </span>
            </div>

            {/* Departure Date */}
            <div className="col-span-1">
              <span className="text-xs text-muted-foreground">
                {formatDate(flight.departureDate)}
              </span>
            </div>

            {/* Departure Time */}
            <div className="col-span-1">
              <span className="text-sm font-mono font-semibold text-foreground">
                {formatTime(flight.departureTime)}
              </span>
            </div>

            {/* Status */}
            <div className="col-span-3 flex justify-end">
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                statusColors[flight.status],
                statusBgColors[flight.status]
              )}>
                {flightStatusLabels[flight.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
