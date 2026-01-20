import { useState } from 'react';
import { GeneralDeclaration, CrewMember, Passenger, HealthDeclaration, DeclarationType, GenDecStatus } from '@/types/gendec';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CrewSection } from './sections/CrewSection';
import { PassengerSection } from './sections/PassengerSection';
import { HealthDeclarationSection } from './sections/HealthDeclarationSection';
import { Plane, MapPin, Palette, FileCheck } from 'lucide-react';

interface GenDecFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gendec?: GeneralDeclaration;
  onSave: (gendec: Omit<GeneralDeclaration, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const defaultHealthDeclaration: HealthDeclaration = {
  personsIllness: 'NIL',
  otherConditions: 'NIL',
  disinsectingDetails: 'NIL',
};

export const GenDecFormDialog = ({ open, onOpenChange, gendec, onSave }: GenDecFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [declarationType, setDeclarationType] = useState<DeclarationType>(gendec?.declarationType || 'outward');
  const [operator, setOperator] = useState(gendec?.operator || '');
  const [marksOfRegistration, setMarksOfRegistration] = useState(gendec?.marksOfRegistration || '');
  const [aircraftType, setAircraftType] = useState(gendec?.aircraftType || '');
  const [airportDeparture, setAirportDeparture] = useState(gendec?.airportDeparture || '');
  const [dateDeparture, setDateDeparture] = useState(gendec?.dateDeparture || '');
  const [airportArrival, setAirportArrival] = useState(gendec?.airportArrival || '');
  const [dateArrival, setDateArrival] = useState(gendec?.dateArrival || '');
  const [flightNumber, setFlightNumber] = useState(gendec?.flightNumber || '');
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>(gendec?.crewMembers || []);
  const [passengers, setPassengers] = useState<Passenger[]>(gendec?.passengers || []);
  const [healthDeclaration, setHealthDeclaration] = useState<HealthDeclaration>(gendec?.healthDeclaration || defaultHealthDeclaration);
  const [logoUrl, setLogoUrl] = useState(gendec?.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(gendec?.primaryColor || '#1E3A5F');
  const [observations, setObservations] = useState(gendec?.observations || '');
  const [status, setStatus] = useState<GenDecStatus>(gendec?.status || 'draft');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!operator || !marksOfRegistration || !aircraftType) {
      return;
    }
    if (!airportDeparture || !dateDeparture || !airportArrival || !dateArrival) {
      return;
    }
    if (crewMembers.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        companyId: gendec?.companyId || '',
        declarationType,
        operator,
        marksOfRegistration,
        aircraftType,
        airportDeparture,
        dateDeparture,
        airportArrival,
        dateArrival,
        flightNumber: flightNumber || undefined,
        crewMembers,
        passengers,
        healthDeclaration,
        logoUrl: logoUrl || undefined,
        primaryColor,
        observations: observations || undefined,
        status,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!gendec;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex flex-col gap-2">
            <span className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              {isEditing ? 'Editar General Declaration' : 'Nova General Declaration'}
            </span>
            <RadioGroup
              value={declarationType}
              onValueChange={(value) => setDeclarationType(value as DeclarationType)}
              className="flex gap-4 text-sm font-normal"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outward" id="outward" />
                <Label htmlFor="outward" className="font-normal cursor-pointer">Outward</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inward" id="inward" />
                <Label htmlFor="inward" className="font-normal cursor-pointer">Inward</Label>
              </div>
            </RadioGroup>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">

            {/* Aircraft/Operator Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Plane className="h-5 w-5" />
                Aircraft / Operator Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="operator">Operator *</Label>
                  <Input
                    id="operator"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    placeholder="e.g., ACME Aviation"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration">Marks of Registration *</Label>
                  <Input
                    id="registration"
                    value={marksOfRegistration}
                    onChange={(e) => setMarksOfRegistration(e.target.value)}
                    placeholder="e.g., PR-ABC"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aircraftType">Aircraft Type *</Label>
                  <Input
                    id="aircraftType"
                    value={aircraftType}
                    onChange={(e) => setAircraftType(e.target.value)}
                    placeholder="e.g., Cessna Citation X"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Flight Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5" />
                Flight Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flightNumber">Flight Number</Label>
                  <Input
                    id="flightNumber"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    placeholder="e.g., GLO1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="airportDeparture">Airport Departure *</Label>
                  <Input
                    id="airportDeparture"
                    value={airportDeparture}
                    onChange={(e) => setAirportDeparture(e.target.value)}
                    placeholder="e.g., SBGR"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateDeparture">Date Departure *</Label>
                  <Input
                    id="dateDeparture"
                    type="date"
                    value={dateDeparture}
                    onChange={(e) => setDateDeparture(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="airportArrival">Airport Arrival *</Label>
                  <Input
                    id="airportArrival"
                    value={airportArrival}
                    onChange={(e) => setAirportArrival(e.target.value)}
                    placeholder="e.g., KJFK"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateArrival">Date Arrival *</Label>
                  <Input
                    id="dateArrival"
                    type="date"
                    value={dateArrival}
                    onChange={(e) => setDateArrival(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Crew Section */}
            <CrewSection crewMembers={crewMembers} onChange={setCrewMembers} />

            <Separator />

            {/* Passenger Section */}
            <PassengerSection passengers={passengers} onChange={setPassengers} />

            <Separator />

            {/* Health Declaration */}
            <HealthDeclarationSection healthDeclaration={healthDeclaration} onChange={setHealthDeclaration} />

            <Separator />

            {/* Customization */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Palette className="h-5 w-5" />
                Document Customization
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#1E3A5F"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Observations */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as GenDecStatus)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="archived">Arquivada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar GenDec'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
