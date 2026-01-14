import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plane, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Flight } from '@/types/aviation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface UpcomingFlightsCardProps {
  flights: Flight[];
}

export function UpcomingFlightsCard({ flights }: UpcomingFlightsCardProps) {
  const sortedFlights = [...flights]
    .filter(f => f.status === 'scheduled' || f.status === 'delayed')
    .sort((a, b) => {
      const dateA = new Date(`${a.arrivalDate}T${a.arrivalTime}`);
      const dateB = new Date(`${b.arrivalDate}T${b.arrivalTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 6);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            Próximos Voos
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/flights" className="text-primary">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedFlights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum voo programado
          </p>
        ) : (
          sortedFlights.map((flight) => {
            const isArrival = flight.status === 'scheduled';
            const flightTime = isArrival ? flight.arrivalTime : flight.departureTime;
            const flightDate = isArrival ? flight.arrivalDate : flight.departureDate;
            
            return (
              <div
                key={flight.id}
                className={cn(
                  'flex items-center gap-4 p-3 rounded-lg border transition-colors hover:bg-muted/50',
                  flight.status === 'delayed' && 'border-amber-500/30 bg-amber-500/5'
                )}
              >
                <div className={cn(
                  'w-2 h-2 rounded-full shrink-0',
                  flight.status === 'delayed' ? 'bg-amber-500' : 'bg-green-500'
                )} />
                
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-mono text-sm font-medium">
                    {flightTime?.slice(0, 5) || '--:--'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {flight.aircraftPrefix}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {flight.origin} → {flight.destination}
                  </p>
                </div>
                
                <Badge 
                  variant="outline"
                  className={cn(
                    'shrink-0 text-xs',
                    flight.status === 'delayed' 
                      ? 'border-amber-500/50 text-amber-600' 
                      : 'border-green-500/50 text-green-600'
                  )}
                >
                  {flight.status === 'delayed' ? 'Atrasado' : 'Programado'}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
