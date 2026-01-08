import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { FlightCard } from '@/components/flights/FlightCard';
import { FlightCalendar } from '@/components/flights/FlightCalendar';
import { FlightStatusBadge } from '@/components/flights/FlightStatusBadge';
import { useFlights } from '@/contexts/FlightsContext';
import { Flight, FlightType, FlightStatus, flightTypeLabels, flightStatusLabels } from '@/types/aviation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Calendar, List, Plane, ArrowRight, Clock, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOrder = 'newest' | 'oldest';

export default function Flights() {
  const { flights, addFlight } = useFlights();
  const [activeTab, setActiveTab] = useState<string>('portal');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FlightStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<FlightType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [isNewFlightOpen, setIsNewFlightOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  // Form state for new flight
  const [formData, setFormData] = useState({
    aircraftPrefix: '',
    aircraftModel: '',
    flightType: 'G' as FlightType,
    origin: '',
    destination: '',
    arrivalDate: '',
    arrivalTime: '',
    departureDate: '',
    departureTime: '',
    status: 'scheduled' as FlightStatus,
    observations: '',
  });

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = 
      flight.aircraftPrefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || flight.status === filterStatus;
    const matchesType = filterType === 'all' || flight.flightType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort flights by date
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    const dateA = new Date(`${a.arrivalDate}T${a.arrivalTime}`);
    const dateB = new Date(`${b.arrivalDate}T${b.arrivalTime}`);
    return sortOrder === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });

  const handleCreateFlight = () => {
    const newFlight: Flight = {
      id: String(Date.now()),
      ...formData,
      companyId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addFlight(newFlight);
    setIsNewFlightOpen(false);
    setFormData({
      aircraftPrefix: '',
      aircraftModel: '',
      flightType: 'G',
      origin: '',
      destination: '',
      arrivalDate: '',
      arrivalTime: '',
      departureDate: '',
      departureTime: '',
      status: 'scheduled',
      observations: '',
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

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

  return (
    <MainLayout>
      <PageHeader 
        title="Portal dos Voos" 
        description="Gerencie todas as operações aéreas"
      >
        <Dialog open={isNewFlightOpen} onOpenChange={setIsNewFlightOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Voo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                Cadastrar Novo Voo
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Aircraft Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prefix">Prefixo da Aeronave *</Label>
                  <Input
                    id="prefix"
                    placeholder="PR-ABC"
                    value={formData.aircraftPrefix}
                    onChange={(e) => setFormData({...formData, aircraftPrefix: e.target.value.toUpperCase()})}
                    className="font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo da Aeronave *</Label>
                  <Input
                    id="model"
                    placeholder="Embraer Phenom 300"
                    value={formData.aircraftModel}
                    onChange={(e) => setFormData({...formData, aircraftModel: e.target.value})}
                  />
                </div>
              </div>

              {/* Flight Type */}
              <div className="space-y-2">
                <Label>Tipo de Voo *</Label>
                <Select 
                  value={formData.flightType} 
                  onValueChange={(v) => setFormData({...formData, flightType: v as FlightType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(flightTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        ({key}) {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Route */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origem (ICAO) *</Label>
                  <Input
                    id="origin"
                    placeholder="SBGR"
                    maxLength={4}
                    value={formData.origin}
                    onChange={(e) => setFormData({...formData, origin: e.target.value.toUpperCase()})}
                    className="font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destino (ICAO) *</Label>
                  <Input
                    id="destination"
                    placeholder="SBRJ"
                    maxLength={4}
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value.toUpperCase()})}
                    className="font-mono uppercase"
                  />
                </div>
              </div>

              {/* Arrival */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrivalDate">Data de Chegada *</Label>
                  <Input
                    id="arrivalDate"
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({...formData, arrivalDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">Hora de Chegada *</Label>
                  <Input
                    id="arrivalTime"
                    type="time"
                    value={formData.arrivalTime}
                    onChange={(e) => setFormData({...formData, arrivalTime: e.target.value})}
                  />
                </div>
              </div>

              {/* Departure */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departureDate">Data de Saída *</Label>
                  <Input
                    id="departureDate"
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({...formData, departureDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departureTime">Hora de Saída *</Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({...formData, departureTime: e.target.value})}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({...formData, status: v as FlightStatus})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(flightStatusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Observations */}
              <div className="space-y-2">
                <Label htmlFor="observations">Observações Operacionais</Label>
                <Textarea
                  id="observations"
                  placeholder="Informações adicionais sobre o voo..."
                  value={formData.observations}
                  onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewFlightOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateFlight}>
                Cadastrar Voo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="portal" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Portal de Voos
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        {/* Portal de Voos Tab */}
        <TabsContent value="portal" className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por prefixo, origem ou destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FlightStatus | 'all')}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  {Object.entries(flightStatusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={(v) => setFilterType(v as FlightType | 'all')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  {Object.entries(flightTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>({key}) {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort Toggle */}
              <Button
                variant="outline"
                onClick={toggleSortOrder}
                className="flex items-center gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === 'newest' ? 'Mais recentes' : 'Mais antigos'}
              </Button>
            </div>
          </div>

          {/* Flight List */}
          <div className="space-y-4">
            {sortedFlights.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/50 rounded-lg">
                <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">Nenhum voo encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou cadastre um novo voo</p>
              </div>
            ) : (
              sortedFlights.map((flight) => (
                <div 
                  key={flight.id}
                  onClick={() => setSelectedFlight(flight)}
                  className="flight-card cursor-pointer hover:border-primary/50 transition-all"
                >
                  {/* Date Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="px-3 py-1.5 bg-primary/10 rounded-lg">
                      <p className="text-sm font-bold text-primary">
                        {formatFlightDate(flight.arrivalDate)}
                      </p>
                    </div>
                    <FlightStatusBadge status={flight.status} />
                  </div>

                  {/* Flight Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Plane className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-callsign text-lg text-foreground">{flight.aircraftPrefix}</p>
                      <p className="text-sm text-muted-foreground">{flight.aircraftModel}</p>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
                    <div className="text-center">
                      <p className="text-icao text-xl">{flight.origin}</p>
                      <p className="text-xs text-muted-foreground">Origem</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-primary" />
                    <div className="text-center">
                      <p className="text-icao text-xl">{flight.destination}</p>
                      <p className="text-xs text-muted-foreground">Destino</p>
                    </div>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
                      <Clock className="w-4 h-4 text-success" />
                      <div>
                        <p className="text-xs text-muted-foreground">Chegada</p>
                        <p className="text-sm font-bold">{flight.arrivalTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
                      <Clock className="w-4 h-4 text-info" />
                      <div>
                        <p className="text-xs text-muted-foreground">Saída</p>
                        <p className="text-sm font-bold">{flight.departureTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Calendário Tab */}
        <TabsContent value="calendar">
          <FlightCalendar 
            flights={filteredFlights}
            onFlightClick={setSelectedFlight}
          />
        </TabsContent>
      </Tabs>

      {/* Flight Detail Modal */}
      <Dialog open={!!selectedFlight} onOpenChange={() => setSelectedFlight(null)}>
        <DialogContent className="max-w-lg">
          {selectedFlight && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    <span className="font-mono">{selectedFlight.aircraftPrefix}</span>
                  </div>
                  <FlightStatusBadge status={selectedFlight.status} />
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Aeronave</p>
                  <p className="font-medium">{selectedFlight.aircraftModel}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-icao text-xl">{selectedFlight.origin}</p>
                    <p className="text-xs text-muted-foreground">Origem</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <p className="text-icao text-xl">{selectedFlight.destination}</p>
                    <p className="text-xs text-muted-foreground">Destino</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 text-success mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Chegada</span>
                    </div>
                    <p className="text-sm">{selectedFlight.arrivalDate}</p>
                    <p className="text-lg font-bold">{selectedFlight.arrivalTime}</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 text-info mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Saída</span>
                    </div>
                    <p className="text-sm">{selectedFlight.departureDate}</p>
                    <p className="text-lg font-bold">{selectedFlight.departureTime}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Voo</p>
                  <p className="font-medium">({selectedFlight.flightType}) {flightTypeLabels[selectedFlight.flightType]}</p>
                </div>

                {selectedFlight.observations && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="text-sm">{selectedFlight.observations}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
