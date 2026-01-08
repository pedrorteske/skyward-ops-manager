import { useState, useEffect, useRef } from 'react';
import { Flight } from '@/types/aviation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResourceTimelineProps {
  flights: Flight[];
  onFlightClick?: (flight: Flight) => void;
}

interface AircraftResource {
  prefix: string;
  model: string;
  flights: Flight[];
}

export function ResourceTimeline({ flights, onFlightClick }: ResourceTimelineProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate hours array (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Get formatted date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Navigate between days
  const goToPrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format date for comparison
  const dateString = currentDate.toISOString().split('T')[0];

  // Filter flights for the current date - check both arrival and departure dates
  const flightsForDate = flights.filter((flight) => {
    const hasArrivalOnDate = flight.arrivalDate === dateString;
    const hasDepartureOnDate = flight.departureDate === dateString;
    return hasArrivalOnDate || hasDepartureOnDate;
  });

  // Group flights by aircraft
  const aircraftResources: AircraftResource[] = [];
  const aircraftMap = new Map<string, AircraftResource>();

  flightsForDate.forEach((flight) => {
    const existing = aircraftMap.get(flight.aircraftPrefix);
    if (existing) {
      existing.flights.push(flight);
    } else {
      const resource: AircraftResource = {
        prefix: flight.aircraftPrefix,
        model: flight.aircraftModel,
        flights: [flight],
      };
      aircraftMap.set(flight.aircraftPrefix, resource);
      aircraftResources.push(resource);
    }
  });

  // Calculate position and width of flight bar based on available data
  const getFlightPosition = (flight: Flight) => {
    const hasArrival = flight.arrivalDate && flight.arrivalTime;
    const hasDeparture = flight.departureDate && flight.departureTime;
    
    let startHour = 0;
    let endHour = 0;
    
    if (hasArrival && hasDeparture) {
      // Both arrival and departure - show full operation period
      const arrivalTime = flight.arrivalTime.split(':');
      const departureTime = flight.departureTime.split(':');
      startHour = parseInt(arrivalTime[0]) + parseInt(arrivalTime[1]) / 60;
      endHour = parseInt(departureTime[0]) + parseInt(departureTime[1]) / 60;
      
      // Handle overnight flights or same time
      if (endHour <= startHour) {
        endHour = startHour + 1; // Minimum 1 hour duration for display
      }
    } else if (hasDeparture) {
      // Only departure - show block starting at departure time
      const departureTime = flight.departureTime.split(':');
      startHour = parseInt(departureTime[0]) + parseInt(departureTime[1]) / 60;
      endHour = startHour + 1; // 1 hour block for departure only
    } else if (hasArrival) {
      // Only arrival - show block at arrival time
      const arrivalTime = flight.arrivalTime.split(':');
      startHour = parseInt(arrivalTime[0]) + parseInt(arrivalTime[1]) / 60;
      endHour = startHour + 1; // 1 hour block for arrival only
    }
    
    const duration = endHour - startHour;
    const left = (startHour / 24) * 100;
    const width = (duration / 24) * 100;
    
    return { left: `${left}%`, width: `${Math.max(width, 2)}%`, startHour, endHour };
  };

  // Check if two flights overlap
  const flightsOverlap = (flight1: Flight, flight2: Flight): boolean => {
    const pos1 = getFlightPosition(flight1);
    const pos2 = getFlightPosition(flight2);
    
    // Check if time ranges overlap
    return pos1.startHour < pos2.endHour && pos2.startHour < pos1.endHour;
  };

  // Get all conflicting flights for a resource
  const getConflictingFlights = (resourceFlights: Flight[]): Set<string> => {
    const conflicting = new Set<string>();
    
    for (let i = 0; i < resourceFlights.length; i++) {
      for (let j = i + 1; j < resourceFlights.length; j++) {
        if (flightsOverlap(resourceFlights[i], resourceFlights[j])) {
          conflicting.add(resourceFlights[i].id);
          conflicting.add(resourceFlights[j].id);
        }
      }
    }
    
    return conflicting;
  };

  // Get all conflicts across all resources
  const allConflicts = new Map<string, Set<string>>();
  aircraftResources.forEach((resource) => {
    const conflicts = getConflictingFlights(resource.flights);
    if (conflicts.size > 0) {
      allConflicts.set(resource.prefix, conflicts);
    }
  });

  const hasConflict = (flight: Flight): boolean => {
    const resourceConflicts = allConflicts.get(flight.aircraftPrefix);
    return resourceConflicts?.has(flight.id) ?? false;
  };

  // Check if current date is today
  const isToday = currentDate.toDateString() === new Date().toDateString();

  // Calculate current time position
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return ((hours + minutes / 60) / 24) * 100;
  };

  // Get flight status color
  const getFlightStatusColor = (status: Flight['status'], isConflict: boolean) => {
    if (isConflict) {
      return 'bg-destructive/90 border-destructive ring-2 ring-destructive/50 ring-offset-1 ring-offset-background';
    }
    
    switch (status) {
      case 'scheduled':
        return 'bg-primary/80 border-primary';
      case 'arrived':
        return 'bg-success/80 border-success';
      case 'departed':
        return 'bg-info/80 border-info';
      case 'delayed':
        return 'bg-warning/80 border-warning';
      case 'cancelled':
        return 'bg-destructive/80 border-destructive';
      default:
        return 'bg-muted border-muted-foreground';
    }
  };

  return (
    <div className="aviation-card overflow-hidden">
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <h3 className="text-sm font-semibold text-foreground capitalize">
          {formatDate(currentDate)}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-primary/80"></span> Programado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-success/80"></span> Chegou
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-info/80"></span> Partiu
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-destructive/90 ring-2 ring-destructive/50"></span> Conflito
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Resources column (aircraft list) */}
        <div className="flex-shrink-0 w-48 border-r border-border bg-muted/20">
          {/* Header for resources */}
          <div className="h-10 border-b border-border flex items-center px-3 bg-muted/50">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Aeronave
            </span>
          </div>
          
          {/* Resource rows */}
          {aircraftResources.length > 0 ? (
            aircraftResources.map((resource) => (
              <div
                key={resource.prefix}
                className="h-16 border-b border-border flex flex-col justify-center px-3 hover:bg-muted/30 transition-colors"
              >
                <span className="text-callsign text-sm">{resource.prefix}</span>
                <span className="text-xs text-muted-foreground truncate">{resource.model}</span>
              </div>
            ))
          ) : (
            <div className="h-16 flex items-center justify-center text-sm text-muted-foreground">
              Nenhum voo
            </div>
          )}
        </div>

        {/* Timeline area */}
        <div className="flex-1 overflow-x-auto" ref={timelineRef}>
          {/* Hours header */}
          <div className="h-10 border-b border-border flex min-w-[1440px] relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-shrink-0 w-[60px] border-r border-border/50 flex items-center justify-center"
              >
                <span className="text-xs text-muted-foreground font-mono">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Resource timeline rows */}
          <div className="relative min-w-[1440px]">
            {/* Hour grid lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    "flex-shrink-0 w-[60px] border-r",
                    hour % 6 === 0 ? "border-border" : "border-border/30"
                  )}
                />
              ))}
            </div>

            {/* Current time indicator */}
            {isToday && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-destructive z-20"
                style={{ left: `${getCurrentTimePosition()}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-destructive rounded-full" />
              </div>
            )}

            {/* Flight bars for each resource */}
            {aircraftResources.length > 0 ? (
              aircraftResources.map((resource) => (
                <div
                  key={resource.prefix}
                  className="h-16 border-b border-border relative"
                >
                  {resource.flights.map((flight) => {
                    const position = getFlightPosition(flight);
                    const isConflicting = hasConflict(flight);
                    return (
                      <div
                        key={flight.id}
                        onClick={() => onFlightClick?.(flight)}
                        className={cn(
                          "absolute top-2 h-12 rounded-md border-l-4 cursor-pointer",
                          "flex flex-col justify-center px-2 text-white shadow-md",
                          "hover:brightness-110 hover:shadow-lg transition-all",
                          getFlightStatusColor(flight.status, isConflicting),
                          isConflicting && "animate-pulse"
                        )}
                        style={{
                          left: position.left,
                          width: position.width,
                          minWidth: '120px',
                        }}
                        title={`${flight.aircraftPrefix} - ${flight.origin} → ${flight.destination}`}
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold truncate">
                          <span className="font-mono">{flight.aircraftPrefix}</span>
                          <span className="opacity-80">•</span>
                          <span className="truncate">{flight.aircraftModel}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] opacity-90 mt-0.5">
                          {flight.arrivalTime && (
                            <span className="font-mono">ETA: {flight.arrivalTime}</span>
                          )}
                          {flight.arrivalTime && flight.departureTime && <span>→</span>}
                          {flight.departureTime && (
                            <span className="font-mono">ETD: {flight.departureTime}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="h-16 flex items-center justify-center text-sm text-muted-foreground">
                <span>Nenhuma operação programada para esta data</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
