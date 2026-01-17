import { useState, useEffect, useRef } from 'react';
import { PublicFlight } from '@/types/portal';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PublicTimelineProps {
  flights: PublicFlight[];
  onTimeRangeChange: (startHour: number, endHour: number) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function PublicTimeline({ 
  flights, 
  onTimeRangeChange, 
  selectedDate,
  onDateChange 
}: PublicTimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewStartHour, setViewStartHour] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const visibleHours = 12; // Show 12 hours at a time

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to current hour on mount
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    // Center the current hour in the view
    const startHour = Math.max(0, currentHour - Math.floor(visibleHours / 2));
    setViewStartHour(Math.min(startHour, 24 - visibleHours));
  }, []);

  // Notify parent of time range changes
  useEffect(() => {
    onTimeRangeChange(viewStartHour, viewStartHour + visibleHours);
  }, [viewStartHour, onTimeRangeChange]);

  // Generate all hours
  const allHours = Array.from({ length: 24 }, (_, i) => i);
  const visibleHoursArray = allHours.slice(viewStartHour, viewStartHour + visibleHours);

  // Navigate timeline
  const scrollLeft = () => {
    setViewStartHour(prev => Math.max(0, prev - 3));
  };

  const scrollRight = () => {
    setViewStartHour(prev => Math.min(24 - visibleHours, prev + 3));
  };

  const goToNow = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = Math.max(0, currentHour - Math.floor(visibleHours / 2));
    setViewStartHour(Math.min(startHour, 24 - visibleHours));
  };

  // Navigate dates
  const goToPrevDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    onDateChange(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
    goToNow();
  };

  // Check if viewing today
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Calculate current time position within visible range
  const getCurrentTimePosition = () => {
    if (!isToday) return null;
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalHour = hours + minutes / 60;
    
    if (totalHour < viewStartHour || totalHour > viewStartHour + visibleHours) {
      return null;
    }
    
    return ((totalHour - viewStartHour) / visibleHours) * 100;
  };

  // Get flights that have activity in visible time range
  const getFlightPosition = (flight: PublicFlight) => {
    const arrivalTime = flight.arrival_time?.split(':');
    const departureTime = flight.departure_time?.split(':');
    
    let startHour = 0;
    let endHour = 24;
    
    if (arrivalTime) {
      startHour = parseInt(arrivalTime[0]) + parseInt(arrivalTime[1]) / 60;
    }
    if (departureTime) {
      endHour = parseInt(departureTime[0]) + parseInt(departureTime[1]) / 60;
    }
    
    // Normalize for display
    if (endHour <= startHour) {
      endHour = startHour + 1;
    }
    
    // Calculate position within visible range
    const visibleStart = Math.max(startHour, viewStartHour);
    const visibleEnd = Math.min(endHour, viewStartHour + visibleHours);
    
    if (visibleEnd <= viewStartHour || visibleStart >= viewStartHour + visibleHours) {
      return null; // Not visible
    }
    
    const left = ((visibleStart - viewStartHour) / visibleHours) * 100;
    const width = ((visibleEnd - visibleStart) / visibleHours) * 100;
    
    return { left: `${left}%`, width: `${Math.max(width, 3)}%` };
  };

  // Group flights by aircraft for the timeline visualization
  const flightsForDate = flights.filter(f => 
    f.arrival_date === selectedDate || f.departure_date === selectedDate
  );

  const aircraftGroups = new Map<string, PublicFlight[]>();
  flightsForDate.forEach(flight => {
    const existing = aircraftGroups.get(flight.aircraft_prefix) || [];
    existing.push(flight);
    aircraftGroups.set(flight.aircraft_prefix, existing);
  });

  const currentTimePos = getCurrentTimePosition();

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }).toUpperCase();
  };

  return (
    <div className="bg-[#0d1117] border border-cyan-500/20 rounded-lg overflow-hidden">
      {/* Header with navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-[#1a1f2e]/50">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPrevDay}
            className="bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            Hoje
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextDay}
            className="bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="ml-4 text-sm font-semibold text-white">
            {formatDisplayDate(selectedDate)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Hour range display */}
          <span className="text-sm text-gray-400 font-mono">
            {viewStartHour.toString().padStart(2, '0')}:00 - {(viewStartHour + visibleHours).toString().padStart(2, '0')}:00
          </span>
          
          {/* Timeline scroll buttons */}
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollLeft}
              disabled={viewStartHour === 0}
              className="bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToNow}
              className="bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              Agora
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={scrollRight}
              disabled={viewStartHour >= 24 - visibleHours}
              className="bg-transparent border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline with fixed aircraft column */}
      <div className="flex" ref={timelineRef}>
        {/* Fixed aircraft column */}
        <div className="w-24 flex-shrink-0 border-r border-cyan-500/30">
          {/* Header - AERONAVE */}
          <div className="h-10 border-b border-cyan-500/20 flex items-center justify-center bg-[#1a1f2e]/50">
            <span className="text-xs text-cyan-400 font-semibold uppercase">Aeronave</span>
          </div>
          
          {/* Aircraft prefixes */}
          {aircraftGroups.size > 0 ? (
            Array.from(aircraftGroups.keys()).map((prefix) => (
              <div 
                key={prefix} 
                className="h-12 border-b border-cyan-500/10 flex flex-col items-center justify-center bg-[#0d1117]/50"
              >
                <span className="text-xs font-mono font-bold text-cyan-300">{prefix}</span>
              </div>
            ))
          ) : (
            <div className="h-20" />
          )}
        </div>

        {/* Timeline area */}
        <div className="flex-1 relative">
          {/* Hours header */}
          <div className="flex h-10 border-b border-cyan-500/20 relative">
            {visibleHoursArray.map((hour) => (
              <div
                key={hour}
                className="flex-1 border-r border-cyan-500/10 flex items-center justify-center"
              >
                <span className="text-xs text-cyan-400 font-mono font-semibold">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
            
            {/* Current time indicator on header */}
            {currentTimePos !== null && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-green-500 z-10"
                style={{ left: `${currentTimePos}%` }}
              >
                <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-green-500 rounded text-[10px] font-mono text-black font-bold">
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
          </div>

          {/* Flight bars visualization */}
          <div className="relative min-h-[80px]">
            {/* Hour grid lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {visibleHoursArray.map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    "flex-1 border-r",
                    hour % 3 === 0 ? "border-cyan-500/20" : "border-cyan-500/10"
                  )}
                />
              ))}
            </div>

            {/* Current time indicator */}
            {currentTimePos !== null && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-green-500/50 z-10"
                style={{ left: `${currentTimePos}%` }}
              />
            )}

            {/* Flight bars grouped by aircraft */}
            {aircraftGroups.size > 0 ? (
              Array.from(aircraftGroups.entries()).map(([prefix, groupFlights]) => (
                <div
                  key={prefix}
                  className="h-12 border-b border-cyan-500/10 relative flex items-center"
                >
                  {/* Flight bars */}
                  {groupFlights.map((flight) => {
                    const position = getFlightPosition(flight);
                    if (!position) return null;
                    
                    return (
                      <div
                        key={flight.id}
                        className={cn(
                          "absolute h-8 rounded-md border-l-4",
                          "flex items-center px-2 text-white shadow-md",
                          flight.status === 'arrived' && "bg-green-500/30 border-green-400",
                          flight.status === 'departed' && "bg-purple-500/30 border-purple-400",
                          flight.status === 'scheduled' && "bg-blue-500/30 border-blue-400",
                          flight.status === 'cancelled' && "bg-red-500/30 border-red-400",
                          flight.status === 'delayed' && "bg-amber-500/30 border-amber-400"
                        )}
                        style={{
                          left: position.left,
                          width: position.width,
                          minWidth: '60px',
                        }}
                        title={`${flight.aircraft_prefix}: ${flight.origin} → ${flight.destination}`}
                      >
                        <span className="text-[10px] font-mono truncate">
                          {flight.origin}→{flight.destination}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="h-20 flex items-center justify-center text-sm text-gray-500">
                Nenhum voo neste período
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-cyan-500/20 bg-[#1a1f2e]/30">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-500/50 border-l-2 border-blue-400" />
          <span className="text-xs text-gray-400">Programado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-green-500/50 border-l-2 border-green-400" />
          <span className="text-xs text-gray-400">Chegou</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-purple-500/50 border-l-2 border-purple-400" />
          <span className="text-xs text-gray-400">Partiu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-500/50 border-l-2 border-amber-400" />
          <span className="text-xs text-gray-400">Atrasado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-4 bg-green-500 rounded" />
          <span className="text-xs text-gray-400">Hora Atual</span>
        </div>
      </div>
    </div>
  );
}
