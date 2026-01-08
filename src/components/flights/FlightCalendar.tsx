import { useState } from 'react';
import { Flight, flightTypeLabels } from '@/types/aviation';
import { FlightStatusBadge } from './FlightStatusBadge';
import { ChevronLeft, ChevronRight, Plane, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FlightCalendarProps {
  flights: Flight[];
  onFlightClick?: (flight: Flight) => void;
}

export function FlightCalendar({ flights, onFlightClick }: FlightCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first and last day of month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Get the day of week for the first day (0 = Sunday)
  const firstDayWeekday = firstDayOfMonth.getDay();
  
  // Total days in month
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Days from previous month to show
  const prevMonthDays = firstDayWeekday;
  const lastDayOfPrevMonth = new Date(year, month, 0).getDate();

  // Generate calendar days
  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];
  
  // Previous month days
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, lastDayOfPrevMonth - i),
      isCurrentMonth: false,
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }
  
  // Next month days to complete the grid (6 rows x 7 days = 42)
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  // Get flights for a specific date
  const getFlightsForDate = (date: Date): Flight[] => {
    const dateStr = date.toISOString().split('T')[0];
    return flights.filter(flight => flight.arrivalDate === dateStr || flight.departureDate === dateStr);
  };

  // Navigation
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const today = new Date();
  const isToday = (date: Date) => 
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const selectedDayFlights = selectedDay ? getFlightsForDate(selectedDay) : [];

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-foreground">
            {monthNames[month]} {year}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 bg-muted">
          {weekDays.map((day) => (
            <div 
              key={day} 
              className="p-3 text-center text-sm font-semibold text-muted-foreground border-b border-border"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dayFlights = getFlightsForDate(date);
            const visibleFlights = dayFlights.slice(0, 2);
            const extraFlights = dayFlights.length - 2;

            return (
              <div
                key={index}
                onClick={() => dayFlights.length > 0 && setSelectedDay(date)}
                className={cn(
                  "min-h-[120px] p-2 border-b border-r border-border transition-colors",
                  isCurrentMonth ? "bg-card" : "bg-muted/30",
                  dayFlights.length > 0 && "cursor-pointer hover:bg-muted/50",
                  isToday(date) && "ring-2 ring-inset ring-primary"
                )}
              >
                {/* Day Number */}
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                  isToday(date) && "text-primary font-bold"
                )}>
                  {date.getDate()}
                </div>

                {/* Flights */}
                <div className="space-y-1">
                  {visibleFlights.map((flight) => (
                    <div
                      key={flight.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFlightClick?.(flight);
                      }}
                      className={cn(
                        "text-xs p-1.5 rounded truncate cursor-pointer transition-colors",
                        flight.status === 'scheduled' && "bg-info/20 text-info hover:bg-info/30",
                        flight.status === 'arrived' && "bg-success/20 text-success hover:bg-success/30",
                        flight.status === 'departed' && "bg-warning/20 text-warning hover:bg-warning/30",
                        flight.status === 'cancelled' && "bg-destructive/20 text-destructive hover:bg-destructive/30"
                      )}
                    >
                      <span className="font-mono font-medium">{flight.aircraftPrefix}</span>
                      <span className="text-muted-foreground ml-1">
                        {flight.origin}→{flight.destination}
                      </span>
                    </div>
                  ))}
                  {extraFlights > 0 && (
                    <div className="text-xs text-primary font-medium p-1">
                      +{extraFlights} voo{extraFlights > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              Voos em {selectedDay?.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {selectedDayFlights.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum voo programado para este dia.
              </p>
            ) : (
              selectedDayFlights.map((flight) => (
                <div
                  key={flight.id}
                  onClick={() => {
                    setSelectedDay(null);
                    onFlightClick?.(flight);
                  }}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-mono font-bold text-foreground">{flight.aircraftPrefix}</p>
                      <p className="text-sm text-muted-foreground">{flight.aircraftModel}</p>
                    </div>
                    <FlightStatusBadge status={flight.status} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono">{flight.origin}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono">{flight.destination}</span>
                    <span className="text-muted-foreground">|</span>
                    <span>{flight.arrivalTime} - {flight.departureTime}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    ({flight.flightType}) {flightTypeLabels[flight.flightType]}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
