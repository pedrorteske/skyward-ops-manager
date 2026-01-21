import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useFinancial } from '@/contexts/FinancialContext';
import { useClients } from '@/contexts/ClientsContext';
import { QuickActionButton } from '@/components/financial/QuickActionButton';
import { FinancialStatusBadge } from '@/components/financial/FinancialStatusBadge';
import { DocumentFormDialog } from '@/components/financial/DocumentFormDialog';
import { DocumentDetailDialog } from '@/components/financial/DocumentDetailDialog';
import { FinancialDashboard } from '@/components/financial/dashboard/FinancialDashboard';
import { ServicesList } from '@/components/financial/services/ServicesList';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Receipt, FileCheck, Search, LayoutDashboard, FolderOpen, Package } from 'lucide-react';
import { FinancialDocument, FinancialDocumentType, FinancialDocumentStatus } from '@/types/financial';
import { ClientPF, ClientPJ, ClientINT } from '@/types/aviation';
import { cn } from '@/lib/utils';

export default function Financial() {
  const { documents } = useFinancial();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FinancialDocumentStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<FinancialDocumentType | 'all'>('all');
  const [mainView, setMainView] = useState<'dashboard' | 'documents' | 'services'>('dashboard');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [formDocumentType, setFormDocumentType] = useState<FinancialDocumentType>('quotation');
  const [selectedDocument, setSelectedDocument] = useState<FinancialDocument | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const getClientName = (doc: FinancialDocument) => {
    if (doc.clientName) return doc.clientName;
    const client = clients.find(c => c.id === doc.clientId);
    if (!client) return doc.clientId || 'Cliente não encontrado';
    if (client.type === 'PF') return (client as ClientPF).fullName;
    if (client.type === 'PJ') return (client as ClientPJ).operator;
    return (client as ClientINT).operator;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(doc).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = activeTab === 'all' || doc.type === activeTab;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleQuickAction = (type: FinancialDocumentType) => {
    setFormDocumentType(type);
    setIsFormDialogOpen(true);
  };

  const handleRowClick = (doc: FinancialDocument) => {
    setSelectedDocument(doc);
    setIsDetailDialogOpen(true);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const documentIcons = {
    quotation: FileText,
    proforma: Receipt,
    invoice: FileCheck,
  };

  const documentColors = {
    quotation: 'text-primary',
    proforma: 'text-info',
    invoice: 'text-success',
  };

  return (
    <MainLayout>
      <PageHeader title="Financeiro" description="Gestão financeira e comercial" />

      {/* Quick Action Buttons - Removed Ground Handling Quotation */}
      <div className="flex flex-wrap gap-4 mb-8">
        <QuickActionButton
          icon={FileText}
          title="Nova Cotação"
          description="Criar proposta comercial"
          variant="primary"
          onClick={() => handleQuickAction('quotation')}
        />
        <QuickActionButton
          icon={Receipt}
          title="Proforma Invoice"
          description="Gerar fatura proforma"
          variant="info"
          onClick={() => handleQuickAction('proforma')}
        />
        <QuickActionButton
          icon={FileCheck}
          title="Invoice"
          description="Emitir fatura definitiva"
          variant="success"
          onClick={() => handleQuickAction('invoice')}
        />
      </div>

      {/* Main View Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setMainView('dashboard')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mainView === 'dashboard'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setMainView('documents')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mainView === 'documents'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          )}
        >
          <FolderOpen className="w-4 h-4" />
          Documentos
        </button>
        <button
          onClick={() => setMainView('services')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mainView === 'services'
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
          )}
        >
          <Package className="w-4 h-4" />
          Serviços
        </button>
      </div>

      {/* Dashboard View */}
      {mainView === 'dashboard' && <FinancialDashboard />}

      {/* Services View */}
      {mainView === 'services' && <ServicesList />}

      {/* Documents View */}
      {mainView === 'documents' && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FinancialDocumentType | 'all')}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="proforma">Proformas</TabsTrigger>
              <TabsTrigger value="invoice">Invoices</TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1 md:w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FinancialDocumentStatus | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="created">Criado</SelectItem>
                  <SelectItem value="sent">Enviado</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <div className="aviation-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum documento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => {
                      const IconComponent = documentIcons[doc.type];
                      return (
                        <TableRow
                          key={doc.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleRowClick(doc)}
                        >
                          <TableCell>
                            <div
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center',
                                doc.type === 'quotation' && 'bg-primary/10',
                                doc.type === 'proforma' && 'bg-info/10',
                                doc.type === 'invoice' && 'bg-success/10'
                              )}
                            >
                              <IconComponent
                                className={cn('w-4 h-4', documentColors[doc.type])}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono font-medium">{doc.number}</span>
                          </TableCell>
                          <TableCell>{getClientName(doc)}</TableCell>
                          <TableCell>
                            {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(doc.total, doc.currency)}
                          </TableCell>
                          <TableCell>
                            <FinancialStatusBadge status={doc.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Form Dialog */}
      <DocumentFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        documentType={formDocumentType}
      />

      {/* Detail Dialog */}
      <DocumentDetailDialog
        document={selectedDocument}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />
    </MainLayout>
  );
}