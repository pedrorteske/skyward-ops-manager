import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Plane } from 'lucide-react';
import { useAircraft } from '@/contexts/AircraftContext';
import { Aircraft, AircraftCategory, aircraftCategoryLabels } from '@/types/aircraft';
import { AircraftDashboard } from '@/components/aircraft/AircraftDashboard';
import { AircraftExpandableRow } from '@/components/aircraft/AircraftExpandableRow';
import { AircraftFormDialog } from '@/components/aircraft/AircraftFormDialog';

const ITEMS_PER_PAGE = 10;

export default function AircraftPage() {
  const { aircraft, isLoading, addAircraft, updateAircraft, deleteAircraft } = useAircraft();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);
  const [deletingAircraft, setDeletingAircraft] = useState<Aircraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filtered and paginated data
  const filteredAircraft = useMemo(() => {
    return aircraft.filter((a) => {
      const matchesSearch =
        a.registrationPrefix.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.ownerOperator.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || a.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [aircraft, searchTerm, filterCategory, filterStatus]);

  const totalPages = Math.ceil(filteredAircraft.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAircraft = filteredAircraft.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handlers
  const handleAddClick = () => {
    setEditingAircraft(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (a: Aircraft) => {
    setEditingAircraft(a);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (a: Aircraft) => {
    setDeletingAircraft(a);
  };

  const handleFormSubmit = async (data: Omit<Aircraft, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    setIsSaving(true);
    try {
      if (editingAircraft) {
        await updateAircraft(editingAircraft.id, data);
      } else {
        await addAircraft(data);
      }
      setIsFormOpen(false);
      setEditingAircraft(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingAircraft) {
      await deleteAircraft(deletingAircraft.id);
      setDeletingAircraft(null);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Aeronaves"
        description="Gerencie sua frota de aeronaves"
      >
        <Button onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Aeronave
        </Button>
      </PageHeader>

      {/* Dashboard KPIs */}
      <AircraftDashboard />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por prefixo, modelo ou operador..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>

        <Select value={filterCategory} onValueChange={(v) => { setFilterCategory(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Categorias</SelectItem>
            {Object.entries(aircraftCategoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
          <SelectTrigger className="w-full md:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="inactive">Inativa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredAircraft.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Nenhuma aeronave encontrada com os filtros aplicados.'
              : 'Nenhuma aeronave cadastrada. Clique em "Nova Aeronave" para começar.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12" />
                  <TableHead>Prefixo</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="hidden lg:table-cell">Operador</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAircraft.map((a) => (
                  <AircraftExpandableRow
                    key={a.id}
                    aircraft={a}
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredAircraft.length)} de {filteredAircraft.length} aeronaves
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Form Dialog */}
      <AircraftFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        aircraft={editingAircraft}
        onSubmit={handleFormSubmit}
        isLoading={isSaving}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAircraft} onOpenChange={() => setDeletingAircraft(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Aeronave</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a aeronave <strong>{deletingAircraft?.registrationPrefix}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
