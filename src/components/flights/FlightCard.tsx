import { Flight, flightTypeLabels } from '@/types/aviation';
import { FlightStatusBadge } from './FlightStatusBadge';
import { Plane, ArrowRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlightCardProps {
  flight: Flight;
  onClick?: () => void;
  className?: string;
}

export function FlightCard({ flight, onClick, className }: FlightCardProps) {
  return (
    <div 
      className={cn(
        "flight-card cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Plane className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-callsign text-foreground">{flight.aircraftPrefix}</p>
            <p className="text-xs text-muted-foreground">{flight.aircraftModel}</p>
          </div>
        </div>
        <FlightStatusBadge status={flight.status} />
      </div>

      {/* Route */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <p className="text-icao text-foreground">{flight.origin}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Origem</p>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full h-px bg-border relative">
            <ArrowRight className="w-4 h-4 text-primary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-icao text-foreground">{flight.destination}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Destino</p>
        </div>
      </div>

      {/* Times */}
      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Chegada</p>
            <p className="text-sm font-medium">{flight.arrivalTime}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-info" />
          <div>
            <p className="text-xs text-muted-foreground">Saída</p>
            <p className="text-sm font-medium">{flight.departureTime}</p>
          </div>
        </div>
      </div>

      {/* Flight Type Badge */}
      <div className="mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          ({flight.flightType}) {flightTypeLabels[flight.flightType]}
        </span>
      </div>
    </div>
  );
}
