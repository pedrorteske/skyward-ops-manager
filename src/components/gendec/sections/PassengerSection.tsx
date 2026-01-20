import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Passenger } from '@/types/gendec';
import { Plus, Trash2, UserCheck } from 'lucide-react';

interface PassengerSectionProps {
  passengers: Passenger[];
  onChange: (passengers: Passenger[]) => void;
}

export const PassengerSection = ({ passengers, onChange }: PassengerSectionProps) => {
  const addPassenger = () => {
    const newPassenger: Passenger = {
      id: crypto.randomUUID(),
      passengerName: '',
      passportOrId: '',
      documentExpiration: '',
      dateOfBirth: '',
      nationality: '',
    };
    onChange([...passengers, newPassenger]);
  };

  const removePassenger = (id: string) => {
    onChange(passengers.filter(p => p.id !== id));
  };

  const updatePassenger = (id: string, field: keyof Passenger, value: string) => {
    onChange(passengers.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <UserCheck className="h-5 w-5" />
          Passenger Information
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addPassenger}>
          <Plus className="h-4 w-4 mr-1" />
          Add Passenger
        </Button>
      </div>

      {passengers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No passengers added. Click "Add Passenger" to add a passenger.
        </p>
      ) : (
        <div className="space-y-4">
          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Passenger #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePassenger(passenger.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Passenger Name *</Label>
                  <Input
                    value={passenger.passengerName}
                    onChange={(e) => updatePassenger(passenger.id, 'passengerName', e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Passport No. / National ID *</Label>
                  <Input
                    value={passenger.passportOrId}
                    onChange={(e) => updatePassenger(passenger.id, 'passportOrId', e.target.value)}
                    placeholder="Document number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Document Expiration Date *</Label>
                  <Input
                    type="date"
                    value={passenger.documentExpiration}
                    onChange={(e) => updatePassenger(passenger.id, 'documentExpiration', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth (D.O.B.) *</Label>
                  <Input
                    type="date"
                    value={passenger.dateOfBirth}
                    onChange={(e) => updatePassenger(passenger.id, 'dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nationality *</Label>
                  <Input
                    value={passenger.nationality}
                    onChange={(e) => updatePassenger(passenger.id, 'nationality', e.target.value)}
                    placeholder="e.g., BRA, USA"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
