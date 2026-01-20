import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CrewMember, CREW_TYPES } from '@/types/gendec';
import { Plus, Trash2, Users } from 'lucide-react';

interface CrewSectionProps {
  crewMembers: CrewMember[];
  onChange: (crew: CrewMember[]) => void;
}

export const CrewSection = ({ crewMembers, onChange }: CrewSectionProps) => {
  const addCrewMember = () => {
    const newMember: CrewMember = {
      id: crypto.randomUUID(),
      crewType: 'PIC',
      crewName: '',
      passportOrId: '',
      documentExpiration: '',
      dateOfBirth: '',
      nationality: '',
    };
    onChange([...crewMembers, newMember]);
  };

  const removeCrewMember = (id: string) => {
    onChange(crewMembers.filter(m => m.id !== id));
  };

  const updateCrewMember = (id: string, field: keyof CrewMember, value: string) => {
    onChange(crewMembers.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Users className="h-5 w-5" />
          Crew Information
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addCrewMember}>
          <Plus className="h-4 w-4 mr-1" />
          Add Crew
        </Button>
      </div>

      {crewMembers.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No crew members added. Click "Add Crew" to add a crew member.
        </p>
      ) : (
        <div className="space-y-4">
          {crewMembers.map((member, index) => (
            <div key={member.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Crew Member #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCrewMember(member.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Crew Type *</Label>
                  <Select
                    value={member.crewType}
                    onValueChange={(value) => updateCrewMember(member.id, 'crewType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CREW_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Crew Name *</Label>
                  <Input
                    value={member.crewName}
                    onChange={(e) => updateCrewMember(member.id, 'crewName', e.target.value)}
                    placeholder="Full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Passport No. / National ID *</Label>
                  <Input
                    value={member.passportOrId}
                    onChange={(e) => updateCrewMember(member.id, 'passportOrId', e.target.value)}
                    placeholder="Document number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Document Expiration Date *</Label>
                  <Input
                    type="date"
                    value={member.documentExpiration}
                    onChange={(e) => updateCrewMember(member.id, 'documentExpiration', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth (D.O.B.) *</Label>
                  <Input
                    type="date"
                    value={member.dateOfBirth}
                    onChange={(e) => updateCrewMember(member.id, 'dateOfBirth', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Nationality *</Label>
                  <Input
                    value={member.nationality}
                    onChange={(e) => updateCrewMember(member.id, 'nationality', e.target.value)}
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
