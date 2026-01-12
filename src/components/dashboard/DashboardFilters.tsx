import { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface DashboardFiltersState {
  startDate: Date | undefined;
  endDate: Date | undefined;
  base: string;
  flightType: string;
  status: string;
}

interface DashboardFiltersProps {
  filters: DashboardFiltersState;
  onFiltersChange: (filters: DashboardFiltersState) => void;
  bases: string[];
  flightTypes: { value: string; label: string }[];
}

export function DashboardFilters({
  filters,
  onFiltersChange,
  bases,
  flightTypes,
}: DashboardFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const clearFilters = () => {
    onFiltersChange({
      startDate: undefined,
      endDate: undefined,
      base: 'all',
      flightType: 'all',
      status: 'all',
    });
  };

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.base !== 'all' ||
    filters.flightType !== 'all' ||
    filters.status !== 'all';

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="w-4 h-4" />
        Filtros
      </div>

      {/* Date Range */}
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Calendar className="w-4 h-4 mr-2" />
              {filters.startDate
                ? format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })
                : 'Data Inicial'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.startDate}
              onSelect={(date) =>
                onFiltersChange({ ...filters, startDate: date })
              }
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        <span className="text-muted-foreground">até</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Calendar className="w-4 h-4 mr-2" />
              {filters.endDate
                ? format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })
                : 'Data Final'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.endDate}
              onSelect={(date) =>
                onFiltersChange({ ...filters, endDate: date })
              }
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Base/Airport Filter */}
      <Select
        value={filters.base}
        onValueChange={(value) => onFiltersChange({ ...filters, base: value })}
      >
        <SelectTrigger className="w-40 h-9">
          <SelectValue placeholder="Base/Aeroporto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Bases</SelectItem>
          {bases.map((base) => (
            <SelectItem key={base} value={base}>
              {base}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Flight Type Filter */}
      <Select
        value={filters.flightType}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, flightType: value })
        }
      >
        <SelectTrigger className="w-48 h-9">
          <SelectValue placeholder="Tipo de Voo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Tipos</SelectItem>
          {flightTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-36 h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="scheduled">Programado</SelectItem>
          <SelectItem value="arrived">Chegou</SelectItem>
          <SelectItem value="departed">Partiu</SelectItem>
          <SelectItem value="cancelled">Cancelado</SelectItem>
          <SelectItem value="delayed">Atrasado</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
          <X className="w-4 h-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}
