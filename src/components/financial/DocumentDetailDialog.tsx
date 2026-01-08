import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FileText, Receipt, FileCheck, Plane, Download, Mail, Trash2 } from 'lucide-react';
import { FinancialDocument, FinancialDocumentStatus, documentTypeLabels, financialStatusLabels } from '@/types/financial';
import { FinancialStatusBadge } from './FinancialStatusBadge';
import { useClients } from '@/contexts/ClientsContext';
import { useFlights } from '@/contexts/FlightsContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { ClientPF, ClientPJ } from '@/types/aviation';
import { useState } from 'react';
import { toast } from 'sonner';

interface DocumentDetailDialogProps {
  document: FinancialDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function DocumentDetailDialog({ document, open, onOpenChange }: DocumentDetailDialogProps) {
  const { clients } = useClients();
  const { flights } = useFlights();
  const { updateDocumentStatus, deleteDocument } = useFinancial();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!document) return null;

  const IconComponent = documentIcons[document.type];
  const client = clients.find(c => c.id === document.clientId);
  const flight = document.flightId ? flights.find(f => f.id === document.flightId) : null;

  const getClientName = () => {
    if (!client) return 'Cliente não encontrado';
    return client.type === 'PF' ? (client as ClientPF).fullName : (client as ClientPJ).operator;
  };

  const getClientEmail = () => {
    if (!client) return '';
    return client.type === 'PF' ? (client as ClientPF).email : (client as ClientPJ).commercialEmail;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: document.currency,
    }).format(value);
  };

  const handleStatusChange = (newStatus: FinancialDocumentStatus) => {
    updateDocumentStatus(document.id, newStatus);
    toast.success('Status atualizado com sucesso!');
  };

  const handleGeneratePDF = () => {
    toast.info('Funcionalidade de geração de PDF será implementada com Lovable Cloud');
  };

  const handleSendEmail = () => {
    toast.info('Funcionalidade de envio por e-mail será implementada com Lovable Cloud');
  };

  const handleDelete = () => {
    deleteDocument(document.id);
    setIsDeleteDialogOpen(false);
    onOpenChange(false);
    toast.success('Documento excluído com sucesso!');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <IconComponent className={`w-5 h-5 ${documentColors[document.type]}`} />
                {document.number}
              </DialogTitle>
              <FinancialStatusBadge status={document.status} />
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Document Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{documentTypeLabels[document.type]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Criação</p>
                <p className="font-medium">
                  {new Date(document.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{getClientName()}</p>
                <p className="text-sm text-muted-foreground">{getClientEmail()}</p>
              </div>
              {flight && (
                <div>
                  <p className="text-sm text-muted-foreground">Voo Vinculado</p>
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-primary" />
                    <span className="font-mono font-medium">{flight.aircraftPrefix}</span>
                    <span className="text-muted-foreground">
                      {flight.origin} → {flight.destination}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm font-medium">Descrição</th>
                    <th className="text-center px-4 py-2 text-sm font-medium">Qtd</th>
                    <th className="text-right px-4 py-2 text-sm font-medium">Valor Unit.</th>
                    <th className="text-right px-4 py-2 text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="text-center px-4 py-2">{item.quantity}</td>
                      <td className="text-right px-4 py-2">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right px-4 py-2 font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/50">
                  <tr>
                    <td colSpan={3} className="text-right px-4 py-3 font-medium">
                      Total ({document.currency})
                    </td>
                    <td className="text-right px-4 py-3 text-lg font-bold text-primary">
                      {formatCurrency(document.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Observations */}
            {document.observations && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Observações</p>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{document.observations}</p>
              </div>
            )}

            {/* Status Update */}
            <div className="flex items-center gap-4 pt-4 border-t">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">Atualizar Status</label>
                <Select value={document.status} onValueChange={(v) => handleStatusChange(v as FinancialDocumentStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">{financialStatusLabels.created}</SelectItem>
                    <SelectItem value="sent">{financialStatusLabels.sent}</SelectItem>
                    <SelectItem value="approved">{financialStatusLabels.approved}</SelectItem>
                    <SelectItem value="paid">{financialStatusLabels.paid}</SelectItem>
                    <SelectItem value="cancelled">{financialStatusLabels.cancelled}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleGeneratePDF}>
                <Download className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
              <Button variant="outline" onClick={handleSendEmail}>
                <Mail className="w-4 h-4 mr-2" />
                Enviar por E-mail
              </Button>
              <div className="flex-1" />
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o documento {document.number}? Esta ação não pode ser desfeita.
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
    </>
  );
}
