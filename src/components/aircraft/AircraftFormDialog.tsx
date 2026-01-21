import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CountrySelect } from '@/components/ui/country-select';
import { Aircraft, AircraftCategory, aircraftCategoryLabels } from '@/types/aircraft';

interface AircraftFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aircraft?: Aircraft | null;
  onSubmit: (data: Omit<Aircraft, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => void;
  isLoading?: boolean;
}

const categoryOptions: AircraftCategory[] = [
  'fixed_wing',
  'helicopter',
  'glider',
  'motorglider',
  'balloon',
  'airship',
  'amphibious',
  'seaplane',
  'rpa_drone',
  'ultralight',
  'gyrocopter',
];

const defaultFormData: {
  ownerOperator: string;
  registrationCountry: string;
  registrationPrefix: string;
  model: string;
  category: AircraftCategory;
  hasAvanac: boolean;
  hasAvoem: boolean;
  hasTecat: boolean;
  hasGendecTemplate: boolean;
  hasFuelRelease: boolean;
  observations: string;
  status: 'active' | 'inactive';
} = {
  ownerOperator: '',
  registrationCountry: 'BR',
  registrationPrefix: '',
  model: '',
  category: 'fixed_wing',
  hasAvanac: false,
  hasAvoem: false,
  hasTecat: false,
  hasGendecTemplate: false,
  hasFuelRelease: false,
  observations: '',
  status: 'active' as const,
};

export function AircraftFormDialog({
  open,
  onOpenChange,
  aircraft,
  onSubmit,
  isLoading,
}: AircraftFormDialogProps) {
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (aircraft) {
      setFormData({
        ownerOperator: aircraft.ownerOperator,
        registrationCountry: aircraft.registrationCountry,
        registrationPrefix: aircraft.registrationPrefix,
        model: aircraft.model,
        category: aircraft.category,
        hasAvanac: aircraft.hasAvanac,
        hasAvoem: aircraft.hasAvoem,
        hasTecat: aircraft.hasTecat,
        hasGendecTemplate: aircraft.hasGendecTemplate,
        hasFuelRelease: aircraft.hasFuelRelease,
        observations: aircraft.observations || '',
        status: aircraft.status,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [aircraft, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!aircraft;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Aeronave' : 'Nova Aeronave'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Gerais */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Informações Gerais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerOperator">Proprietário ou Operador *</Label>
                <Input
                  id="ownerOperator"
                  value={formData.ownerOperator}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerOperator: e.target.value }))}
                  placeholder="Nome do operador"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>País de Matrícula *</Label>
                <CountrySelect
                  value={formData.registrationCountry}
                  onChange={(value) => setFormData(prev => ({ ...prev, registrationCountry: value }))}
                  placeholder="Selecione o país"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationPrefix">Prefixo / Matrícula *</Label>
                <Input
                  id="registrationPrefix"
                  value={formData.registrationPrefix}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationPrefix: e.target.value.toUpperCase() }))}
                  placeholder="Ex: PT-ABC, N12345"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Modelo da Aeronave *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Ex: Cessna 172, Bell 206"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Tipo de Aeronave *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: AircraftCategory) => 
                    setFormData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {aircraftCategoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Documentos Disponíveis */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Documentos Disponíveis</h3>
            <p className="text-xs text-muted-foreground">
              Marque os documentos que estão disponíveis para esta aeronave. Eles serão pré-selecionados automaticamente ao criar voos.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAvanac"
                  checked={formData.hasAvanac}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasAvanac: !!checked }))
                  }
                />
                <Label htmlFor="hasAvanac" className="cursor-pointer">AVANAC</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAvoem"
                  checked={formData.hasAvoem}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasAvoem: !!checked }))
                  }
                />
                <Label htmlFor="hasAvoem" className="cursor-pointer">AVOEM</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasTecat"
                  checked={formData.hasTecat}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasTecat: !!checked }))
                  }
                />
                <Label htmlFor="hasTecat" className="cursor-pointer">TECAT</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasGendecTemplate"
                  checked={formData.hasGendecTemplate}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasGendecTemplate: !!checked }))
                  }
                />
                <Label htmlFor="hasGendecTemplate" className="cursor-pointer">GENDEC</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasFuelRelease"
                  checked={formData.hasFuelRelease}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasFuelRelease: !!checked }))
                  }
                />
                <Label htmlFor="hasFuelRelease" className="cursor-pointer">FUEL RELEASE</Label>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              placeholder="Observações adicionais sobre a aeronave..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Aeronave'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
