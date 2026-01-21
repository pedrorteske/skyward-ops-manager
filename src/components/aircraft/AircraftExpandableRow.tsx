import { Aircraft, aircraftCategoryLabels } from '@/types/aircraft';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { getCountryByCode } from '@/data/countries';

interface AircraftExpandableRowProps {
  aircraft: Aircraft;
  onEditClick: (aircraft: Aircraft) => void;
  onDeleteClick: (aircraft: Aircraft) => void;
}

export function AircraftExpandableRow({ aircraft, onEditClick, onDeleteClick }: AircraftExpandableRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const country = getCountryByCode(aircraft.registrationCountry);
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const DocBadge = ({ available, label }: { available: boolean; label: string }) => (
    <Badge variant={available ? 'default' : 'outline'} className={available ? 'bg-success text-success-foreground' : 'text-muted-foreground'}>
      {available ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
      {label}
    </Badge>
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <>
        <TableRow className="hover:bg-muted/50">
          <TableCell>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <span className="text-lg">{country?.flag || '🏳️'}</span>
              <span className="font-mono font-semibold">{aircraft.registrationPrefix}</span>
            </div>
          </TableCell>
          <TableCell>{aircraft.model}</TableCell>
          <TableCell className="hidden md:table-cell">{aircraftCategoryLabels[aircraft.category]}</TableCell>
          <TableCell className="hidden lg:table-cell">{aircraft.ownerOperator}</TableCell>
          <TableCell>
            <Badge variant={aircraft.status === 'active' ? 'default' : 'secondary'}>
              {aircraft.status === 'active' ? 'Ativa' : 'Inativa'}
            </Badge>
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditClick(aircraft)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteClick(aircraft)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableCell colSpan={7} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">País de Matrícula</span>
                    <p className="text-sm font-medium">{country?.name || aircraft.registrationCountry}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Categoria</span>
                    <p className="text-sm font-medium">{aircraftCategoryLabels[aircraft.category]}</p>
                  </div>
                  {aircraft.observations && (
                    <div>
                      <span className="text-xs text-muted-foreground">Observações</span>
                      <p className="text-sm">{aircraft.observations}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-2">Documentos Disponíveis</span>
                    <div className="flex flex-wrap gap-2">
                      <DocBadge available={aircraft.hasAvanac} label="AVANAC" />
                      <DocBadge available={aircraft.hasAvoem} label="AVOEM" />
                      <DocBadge available={aircraft.hasTecat} label="TECAT" />
                      <DocBadge available={aircraft.hasGendecTemplate} label="GENDEC" />
                      <DocBadge available={aircraft.hasFuelRelease} label="FUEL RELEASE" />
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                    <span>Criado em: {formatDate(aircraft.createdAt)}</span>
                    <span>Atualizado em: {formatDate(aircraft.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}
