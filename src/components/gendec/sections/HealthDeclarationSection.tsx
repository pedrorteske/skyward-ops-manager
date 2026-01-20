import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { HealthDeclaration } from '@/types/gendec';
import { HeartPulse } from 'lucide-react';

interface HealthDeclarationSectionProps {
  healthDeclaration: HealthDeclaration;
  onChange: (health: HealthDeclaration) => void;
}

export const HealthDeclarationSection = ({ healthDeclaration, onChange }: HealthDeclarationSectionProps) => {
  const handleChange = (field: keyof HealthDeclaration, value: string) => {
    onChange({
      ...healthDeclaration,
      [field]: value,
    });
  };

  const handleNilClick = (field: keyof HealthDeclaration) => {
    handleChange(field, 'NIL');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <HeartPulse className="h-5 w-5" />
        Declaration of Health
      </div>

      {/* Persons with illness */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="personsIllness" className="text-sm font-medium">
            Persons on board known to be suffering from illness other than airsickness or the effects of accidents, as well as those cases of illness disembarked during the flight
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleNilClick('personsIllness')}
            className="shrink-0"
          >
            NIL
          </Button>
        </div>
        <Textarea
          id="personsIllness"
          value={healthDeclaration.personsIllness}
          onChange={(e) => handleChange('personsIllness', e.target.value)}
          placeholder="Enter details or click NIL"
          rows={2}
        />
      </div>

      {/* Other conditions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="otherConditions" className="text-sm font-medium">
            Any other condition on board which may lead to the spread of disease
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleNilClick('otherConditions')}
            className="shrink-0"
          >
            NIL
          </Button>
        </div>
        <Textarea
          id="otherConditions"
          value={healthDeclaration.otherConditions}
          onChange={(e) => handleChange('otherConditions', e.target.value)}
          placeholder="Enter details or click NIL"
          rows={2}
        />
      </div>

      {/* Disinsecting details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="disinsectingDetails" className="text-sm font-medium">
            Details of each disinsecting or sanitary treatment (place, date, time, method) during the flight. If no disinsecting has been carried out during the flight give details of most recent
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleNilClick('disinsectingDetails')}
            className="shrink-0"
          >
            NIL
          </Button>
        </div>
        <Textarea
          id="disinsectingDetails"
          value={healthDeclaration.disinsectingDetails}
          onChange={(e) => handleChange('disinsectingDetails', e.target.value)}
          placeholder="Enter details or click NIL"
          rows={2}
        />
      </div>
    </div>
  );
};
