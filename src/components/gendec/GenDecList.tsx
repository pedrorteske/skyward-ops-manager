import { useState } from 'react';
import { GeneralDeclaration } from '@/types/gendec';
import { useGenDec } from '@/contexts/GenDecContext';
import { GenDecStatusBadge } from './GenDecStatusBadge';
import { GenDecFormDialog } from './GenDecFormDialog';
import { generateGenDecPdf } from '@/lib/gendecPdfGenerator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Pencil, Trash2, FileDown, Search, Copy } from 'lucide-react';
import { format } from 'date-fns';

interface GenDecListProps {
  filter?: 'all' | 'draft' | 'completed' | 'archived';
}

export const GenDecList = ({ filter = 'all' }: GenDecListProps) => {
  const { gendecs, isLoading, updateGenDec, deleteGenDec, addGenDec } = useGenDec();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGenDec, setEditingGenDec] = useState<GeneralDeclaration | null>(null);
  const [deletingGenDec, setDeletingGenDec] = useState<GeneralDeclaration | null>(null);

  // Filter by status
  const filteredByStatus = filter === 'all' 
    ? gendecs 
    : gendecs.filter(g => g.status === filter);

  // Filter by search term
  const filteredGendecs = filteredByStatus.filter(g => {
    const searchLower = searchTerm.toLowerCase();
    return (
      g.number.toLowerCase().includes(searchLower) ||
      g.operator.toLowerCase().includes(searchLower) ||
      g.marksOfRegistration.toLowerCase().includes(searchLower) ||
      g.airportDeparture.toLowerCase().includes(searchLower) ||
      g.airportArrival.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (gendec: GeneralDeclaration) => {
    setEditingGenDec(gendec);
  };

  const handleSave = async (data: Omit<GeneralDeclaration, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => {
    if (editingGenDec) {
      await updateGenDec(editingGenDec.id, data);
    }
    setEditingGenDec(null);
  };

  const handleDelete = async () => {
    if (deletingGenDec) {
      await deleteGenDec(deletingGenDec.id);
      setDeletingGenDec(null);
    }
  };

  const handleExportPdf = (gendec: GeneralDeclaration) => {
    generateGenDecPdf(gendec);
  };

  const handleDuplicate = async (gendec: GeneralDeclaration) => {
    const { id, number, createdAt, updatedAt, ...rest } = gendec;
    await addGenDec({
      ...rest,
      status: 'draft',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por número, operador, aeronave..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      {filteredGendecs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? 'Nenhuma GenDec encontrada.' : 'Nenhuma General Declaration criada ainda.'}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Aeronave</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGendecs.map((gendec) => (
                <TableRow key={gendec.id}>
                  <TableCell className="font-medium">{gendec.number}</TableCell>
                  <TableCell className="capitalize">{gendec.declarationType}</TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{gendec.marksOfRegistration}</span>
                      <span className="text-muted-foreground ml-1 text-sm">({gendec.aircraftType})</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {gendec.airportDeparture} → {gendec.airportArrival}
                  </TableCell>
                  <TableCell>
                    {format(new Date(gendec.dateDeparture), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <GenDecStatusBadge status={gendec.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(gendec)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportPdf(gendec)}>
                          <FileDown className="h-4 w-4 mr-2" />
                          Exportar PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(gendec)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeletingGenDec(gendec)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      {editingGenDec && (
        <GenDecFormDialog
          open={!!editingGenDec}
          onOpenChange={(open) => !open && setEditingGenDec(null)}
          gendec={editingGenDec}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingGenDec} onOpenChange={(open) => !open && setDeletingGenDec(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir General Declaration?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A GenDec "{deletingGenDec?.number}" será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
