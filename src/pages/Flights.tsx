import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { FlightPortalList } from '@/components/flights/FlightPortalList';
import { FlightCalendar } from '@/components/flights/FlightCalendar';
import { FlightStatusBadge } from '@/components/flights/FlightStatusBadge';
import { useFlights } from '@/contexts/FlightsContext';
import { useAircraft } from '@/contexts/AircraftContext';
import { Flight, FlightType, FlightStatus, flightTypeLabels, flightStatusLabels } from '@/types/aviation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Calendar, List, Plane, ArrowRight, ArrowUpDown, Pencil, Trash2, Check, X, Info } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type SortOrder = 'newest' | 'oldest';

export default function Flights() {
  const { flights, isLoading, addFlight, updateFlight, deleteFlight } = useFlights();
  const { getAircraftByPrefix } = useAircraft();
  const [activeTab, setActiveTab] = useState<string>('portal');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FlightStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<FlightType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [isNewFlightOpen, setIsNewFlightOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    aircraftPrefix: '',
    aircraftModel: '',
    flightType: 'G' as FlightType,
    origin: '',
    destination: '',
    base: '',
    arrivalDate: '',
    arrivalTime: '',
    departureDate: '',
    departureTime: '',
    status: 'scheduled' as FlightStatus,
    observations: '',
    docAvanac: false,
    docAvoem: false,
    docTecat: false,
    docGendec: false,
    docFuelRelease: false,
  });
  const [linkedAircraft, setLinkedAircraft] = useState<string | null>(null);

  // Form state for new flight
  const [formData, setFormData] = useState({
    aircraftPrefix: '',
    aircraftModel: '',
    flightType: 'G' as FlightType,
    origin: '',
    destination: '',
    base: '',
    arrivalDate: '',
    arrivalTime: '',
    departureDate: '',
    departureTime: '',
    status: 'scheduled' as FlightStatus,
    observations: '',
    docAvanac: false,
    docAvoem: false,
    docTecat: false,
    docGendec: false,
    docFuelRelease: false,
  });
  const [newFlightLinkedAircraft, setNewFlightLinkedAircraft] = useState<string | null>(null);

  // Auto-fill aircraft data when prefix changes
  const handlePrefixChange = (prefix: string, isNewFlight: boolean) => {
    const upperPrefix = prefix.toUpperCase();
    const aircraft = getAircraftByPrefix(upperPrefix);
    
    if (isNewFlight) {
      setFormData(prev => ({
        ...prev,
        aircraftPrefix: upperPrefix,
        aircraftModel: aircraft?.model || prev.aircraftModel,
        docAvanac: aircraft?.hasAvanac || false,
        docAvoem: aircraft?.hasAvoem || false,
        docTecat: aircraft?.hasTecat || false,
        docGendec: aircraft?.hasGendecTemplate || false,
        docFuelRelease: aircraft?.hasFuelRelease || false,
      }));
      setNewFlightLinkedAircraft(aircraft ? aircraft.registrationPrefix : null);
    } else {
      setEditFormData(prev => ({
        ...prev,
        aircraftPrefix: upperPrefix,
        aircraftModel: aircraft?.model || prev.aircraftModel,
        docAvanac: aircraft?.hasAvanac || prev.docAvanac,
        docAvoem: aircraft?.hasAvoem || prev.docAvoem,
        docTecat: aircraft?.hasTecat || prev.docTecat,
        docGendec: aircraft?.hasGendecTemplate || prev.docGendec,
        docFuelRelease: aircraft?.hasFuelRelease || prev.docFuelRelease,
      }));
      setLinkedAircraft(aircraft ? aircraft.registrationPrefix : null);
    }
  };

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

  const handleCreateFlight = async () => {
    await addFlight({
      ...formData,
    });
    setIsNewFlightOpen(false);
    setFormData({
      aircraftPrefix: '',
      aircraftModel: '',
      flightType: 'G',
      origin: '',
      destination: '',
      base: '',
      arrivalDate: '',
      arrivalTime: '',
      departureDate: '',
      departureTime: '',
      status: 'scheduled',
      observations: '',
      docAvanac: false,
      docAvoem: false,
      docTecat: false,
      docGendec: false,
      docFuelRelease: false,
    });
    setNewFlightLinkedAircraft(null);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const handleEditClick = () => {
    if (selectedFlight) {
      setEditFormData({
        aircraftPrefix: selectedFlight.aircraftPrefix,
        aircraftModel: selectedFlight.aircraftModel,
        flightType: selectedFlight.flightType,
        origin: selectedFlight.origin,
        destination: selectedFlight.destination,
        base: selectedFlight.base || '',
        arrivalDate: selectedFlight.arrivalDate,
        arrivalTime: selectedFlight.arrivalTime,
        departureDate: selectedFlight.departureDate,
        departureTime: selectedFlight.departureTime,
        status: selectedFlight.status,
        observations: selectedFlight.observations || '',
        docAvanac: selectedFlight.docAvanac || false,
        docAvoem: selectedFlight.docAvoem || false,
        docTecat: selectedFlight.docTecat || false,
        docGendec: selectedFlight.docGendec || false,
        docFuelRelease: selectedFlight.docFuelRelease || false,
      });
      setLinkedAircraft(null);
      setIsEditMode(true);
    }
  };

  const handleUpdateFlight = async () => {
    if (selectedFlight) {
      await updateFlight(selectedFlight.id, {
        ...editFormData,
      });
      setIsEditMode(false);
      setSelectedFlight(null);
    }
  };

  const handleDeleteFlight = async () => {
    if (selectedFlight) {
      await deleteFlight(selectedFlight.id);
      setIsDeleteDialogOpen(false);
      setSelectedFlight(null);
    }
  };

  const handleCloseDetail = () => {
    setSelectedFlight(null);
    setIsEditMode(false);
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
                    value={formData.aircraftPrefix}
                    onChange={(e) => setFormData({...formData, aircraftPrefix: e.target.value.toUpperCase()})}
                    className="font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo da Aeronave *</Label>
                  <Input
                    id="model"
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
                    maxLength={4}
                    value={formData.destination}
                    onChange={(e) => setFormData({...formData, destination: e.target.value.toUpperCase()})}
                    className="font-mono uppercase"
                  />
                </div>
              </div>

              {/* Base */}
              <div className="space-y-2">
                <Label htmlFor="base">Base de Atendimento (ICAO)</Label>
                <Input
                  id="base"
                  maxLength={4}
                  value={formData.base}
                  onChange={(e) => setFormData({...formData, base: e.target.value.toUpperCase()})}
                  className="font-mono uppercase"
                />
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

      {/* Tabs Navigation - Removed Timeline tab */}
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

          {/* Flight Portal List */}
          <FlightPortalList 
            flights={sortedFlights} 
            onFlightClick={(flight) => setSelectedFlight(flight)} 
          />
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
      <Dialog open={!!selectedFlight} onOpenChange={handleCloseDetail}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedFlight && !isEditMode && (
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
                
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Origem</p>
                    <p className="font-mono text-xl font-bold">{selectedFlight.origin}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Destino</p>
                    <p className="font-mono text-xl font-bold">{selectedFlight.destination}</p>
                  </div>
                </div>

                {selectedFlight.base && (
                  <div>
                    <p className="text-sm text-muted-foreground">Base de Atendimento</p>
                    <p className="font-mono font-medium">{selectedFlight.base}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Chegada</p>
                    <p className="font-medium">{formatFlightDate(selectedFlight.arrivalDate)}</p>
                    <p className="font-mono">{selectedFlight.arrivalTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saída</p>
                    <p className="font-medium">{formatFlightDate(selectedFlight.departureDate)}</p>
                    <p className="font-mono">{selectedFlight.departureTime}</p>
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

                {/* Edit/Delete Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleEditClick} className="flex-1 gap-2">
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Edit Mode */}
          {selectedFlight && isEditMode && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-primary" />
                  Editar Voo - {selectedFlight.aircraftPrefix}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prefixo</Label>
                    <Input
                      value={editFormData.aircraftPrefix}
                      onChange={(e) => setEditFormData({...editFormData, aircraftPrefix: e.target.value.toUpperCase()})}
                      className="font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Input
                      value={editFormData.aircraftModel}
                      onChange={(e) => setEditFormData({...editFormData, aircraftModel: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Voo</Label>
                  <Select 
                    value={editFormData.flightType} 
                    onValueChange={(v) => setEditFormData({...editFormData, flightType: v as FlightType})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(flightTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>({key}) {label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Origem</Label>
                    <Input
                      maxLength={4}
                      value={editFormData.origin}
                      onChange={(e) => setEditFormData({...editFormData, origin: e.target.value.toUpperCase()})}
                      className="font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Destino</Label>
                    <Input
                      maxLength={4}
                      value={editFormData.destination}
                      onChange={(e) => setEditFormData({...editFormData, destination: e.target.value.toUpperCase()})}
                      className="font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Base de Atendimento</Label>
                  <Input
                    maxLength={4}
                    value={editFormData.base}
                    onChange={(e) => setEditFormData({...editFormData, base: e.target.value.toUpperCase()})}
                    className="font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Chegada</Label>
                    <Input
                      type="date"
                      value={editFormData.arrivalDate}
                      onChange={(e) => setEditFormData({...editFormData, arrivalDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora de Chegada</Label>
                    <Input
                      type="time"
                      value={editFormData.arrivalTime}
                      onChange={(e) => setEditFormData({...editFormData, arrivalTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Saída</Label>
                    <Input
                      type="date"
                      value={editFormData.departureDate}
                      onChange={(e) => setEditFormData({...editFormData, departureDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora de Saída</Label>
                    <Input
                      type="time"
                      value={editFormData.departureTime}
                      onChange={(e) => setEditFormData({...editFormData, departureTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={editFormData.status} 
                    onValueChange={(v) => setEditFormData({...editFormData, status: v as FlightStatus})}
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

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={editFormData.observations}
                    onChange={(e) => setEditFormData({...editFormData, observations: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateFlight}>
                  Salvar Alterações
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Voo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o voo <span className="font-mono font-bold">{selectedFlight?.aircraftPrefix}</span>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFlight} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}