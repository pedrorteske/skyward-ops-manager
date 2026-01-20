import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FlightStatusBadge } from '@/components/flights/FlightStatusBadge';
import { Flight, flightTypeLabels } from '@/types/aviation';
import { Plane, ArrowRight } from 'lucide-react';

interface FlightDetailDialogProps {
  flight: Flight | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlightDetailDialog({ flight, open, onOpenChange }: FlightDetailDialogProps) {
  // Format date for display
  const formatFlightDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!flight) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              <span className="font-mono">{flight.aircraftPrefix}</span>
            </div>
            <FlightStatusBadge status={flight.status} />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Aeronave</p>
            <p className="font-medium">{flight.aircraftModel}</p>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Origem</p>
              <p className="font-mono text-xl font-bold">{flight.origin}</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Destino</p>
              <p className="font-mono text-xl font-bold">{flight.destination}</p>
            </div>
          </div>

          {flight.base && (
            <div>
              <p className="text-sm text-muted-foreground">Base de Atendimento</p>
              <p className="font-mono font-medium">{flight.base}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Chegada</p>
              <p className="font-medium">{formatFlightDate(flight.arrivalDate)}</p>
              <p className="font-mono">{flight.arrivalTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saída</p>
              <p className="font-medium">{formatFlightDate(flight.departureDate)}</p>
              <p className="font-mono">{flight.departureTime}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Tipo de Voo</p>
            <p className="font-medium">({flight.flightType}) {flightTypeLabels[flight.flightType]}</p>
          </div>

          {flight.observations && (
            <div>
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="text-sm">{flight.observations}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
