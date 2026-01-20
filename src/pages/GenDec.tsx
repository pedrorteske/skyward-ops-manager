import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { GenDecList } from '@/components/gendec/GenDecList';
import { GenDecFormDialog } from '@/components/gendec/GenDecFormDialog';
import { useGenDec } from '@/contexts/GenDecContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GeneralDeclaration } from '@/types/gendec';

const GenDec = () => {
  const { addGenDec, gendecs } = useGenDec();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateGenDec = async (data: Omit<GeneralDeclaration, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => {
    await addGenDec(data);
    setIsFormOpen(false);
  };

  // Count by status
  const draftCount = gendecs.filter(g => g.status === 'draft').length;
  const completedCount = gendecs.filter(g => g.status === 'completed').length;
  const archivedCount = gendecs.filter(g => g.status === 'archived').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="General Declaration"
          description="Gerencie suas General Declarations (GenDec) seguindo o padrão ICAO"
        >
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova GenDec
          </Button>
        </PageHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              Todas ({gendecs.length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Rascunho ({draftCount})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídas ({completedCount})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Arquivadas ({archivedCount})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <GenDecList filter="all" />
          </TabsContent>
          <TabsContent value="draft" className="mt-6">
            <GenDecList filter="draft" />
          </TabsContent>
          <TabsContent value="completed" className="mt-6">
            <GenDecList filter="completed" />
          </TabsContent>
          <TabsContent value="archived" className="mt-6">
            <GenDecList filter="archived" />
          </TabsContent>
        </Tabs>
      </div>

      <GenDecFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleCreateGenDec}
      />
    </MainLayout>
  );
};

export default GenDec;
