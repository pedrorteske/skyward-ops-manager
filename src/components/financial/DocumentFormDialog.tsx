import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileText, Receipt, FileCheck } from 'lucide-react';
import { useClients } from '@/contexts/ClientsContext';
import { useFlights } from '@/contexts/FlightsContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { FinancialDocument, FinancialDocumentType, FinancialItem, Currency } from '@/types/financial';
import { ClientPF, ClientPJ } from '@/types/aviation';
import { toast } from 'sonner';

interface DocumentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: FinancialDocumentType;
  sourceDocument?: FinancialDocument;
}

const documentTypeConfig = {
  quotation: {
    title: 'Nova Cotação',
    icon: FileText,
    color: 'text-primary',
  },
  proforma: {
    title: 'Nova Proforma Invoice',
    icon: Receipt,
    color: 'text-info',
  },
  invoice: {
    title: 'Nova Invoice',
    icon: FileCheck,
    color: 'text-success',
  },
};

export function DocumentFormDialog({
  open,
  onOpenChange,
  documentType,
  sourceDocument,
}: DocumentFormDialogProps) {
  const { clients } = useClients();
  const { flights } = useFlights();
  const { addDocument, generateDocumentNumber, getDocumentsByType } = useFinancial();

  const [clientId, setClientId] = useState('');
  const [flightId, setFlightId] = useState('');
  const [currency, setCurrency] = useState<Currency>('BRL');
  const [observations, setObservations] = useState('');
  const [items, setItems] = useState<FinancialItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [sourceDocumentId, setSourceDocumentId] = useState('');

  const config = documentTypeConfig[documentType];
  const IconComponent = config.icon;

  // Get available source documents
  const availableQuotations = getDocumentsByType('quotation').filter(
    doc => doc.status === 'approved'
  );
  const availableProformas = getDocumentsByType('proforma').filter(
    doc => doc.status === 'approved' || doc.status === 'sent'
  );

  useEffect(() => {
    if (sourceDocument) {
      setClientId(sourceDocument.clientId);
      setFlightId(sourceDocument.flightId || '');
      setCurrency(sourceDocument.currency);
      setObservations(sourceDocument.observations || '');
      setItems(sourceDocument.items.map(item => ({ ...item, id: String(Date.now() + Math.random()) })));
    }
  }, [sourceDocument]);

  const handleSourceDocumentChange = (docId: string) => {
    setSourceDocumentId(docId);
    const sources = documentType === 'proforma' ? availableQuotations : [...availableQuotations, ...availableProformas];
    const doc = sources.find(d => d.id === docId);
    if (doc) {
      setClientId(doc.clientId);
      setFlightId(doc.flightId || '');
      setCurrency(doc.currency);
      setObservations(doc.observations || '');
      setItems(doc.items.map(item => ({ ...item, id: String(Date.now() + Math.random()) })));
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: String(Date.now()), description: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof FinancialItem, value: string | number) => {
    setItems(
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + item.total, 0);
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return '';
    return client.type === 'PF' ? (client as ClientPF).fullName : (client as ClientPJ).operator;
  };

  const handleSubmit = () => {
    if (!clientId) {
      toast.error('Selecione um cliente');
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Preencha todos os itens corretamente');
      return;
    }

    const newDocument: FinancialDocument = {
      id: String(Date.now()),
      number: generateDocumentNumber(documentType),
      type: documentType,
      clientId,
      flightId: flightId || undefined,
      items,
      currency,
      subtotal: calculateTotal(),
      total: calculateTotal(),
      status: 'created',
      observations: observations || undefined,
      companyId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      validUntil: documentType === 'quotation' 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
        : undefined,
      quotationId: documentType !== 'quotation' && sourceDocumentId ? sourceDocumentId : undefined,
      proformaId: documentType === 'invoice' && sourceDocumentId ? sourceDocumentId : undefined,
    };

    addDocument(newDocument);
    toast.success(`${config.title.replace('Nova ', '')} criada com sucesso!`);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setClientId('');
    setFlightId('');
    setCurrency('BRL');
    setObservations('');
    setSourceDocumentId('');
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  const activeClients = clients.filter(c => c.status === 'active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className={`w-5 h-5 ${config.color}`} />
            {config.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Source Document Selection (for proforma and invoice) */}
          {documentType !== 'quotation' && (
            <div className="space-y-2">
              <Label>Criar a partir de</Label>
              <Select value={sourceDocumentId} onValueChange={handleSourceDocumentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um documento (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Criar manualmente</SelectItem>
                  {documentType === 'proforma' && availableQuotations.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.number} - {getClientName(doc.clientId)}
                    </SelectItem>
                  ))}
                  {documentType === 'invoice' && (
                    <>
                      {availableQuotations.map(doc => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.number} (Cotação) - {getClientName(doc.clientId)}
                        </SelectItem>
                      ))}
                      {availableProformas.map(doc => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.number} (Proforma) - {getClientName(doc.clientId)}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Client Selection */}
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {activeClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.type === 'PF'
                      ? (client as ClientPF).fullName
                      : (client as ClientPJ).operator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Flight Selection (optional) */}
          <div className="space-y-2">
            <Label>Voo (opcional)</Label>
            <Select value={flightId || "no-flight"} onValueChange={(v) => setFlightId(v === "no-flight" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Vincular a um voo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-flight">Nenhum</SelectItem>
                {flights.map(flight => (
                  <SelectItem key={flight.id} value={flight.id}>
                    {flight.aircraftPrefix} - {flight.origin} → {flight.destination}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label>Moeda *</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">R$ (BRL)</SelectItem>
                <SelectItem value="USD">$ (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Itens *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/50 rounded-lg">
                  <div className="col-span-5">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Descrição</Label>}
                    <Input
                      placeholder="Descrição do serviço"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Qtd</Label>}
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Valor Unit.</Label>}
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                    />
                  </div>
                  <div className="col-span-2">
                    {index === 0 && <Label className="text-xs text-muted-foreground">Total</Label>}
                    <Input
                      value={formatCurrency(item.total)}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end pt-2 border-t">
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Total: </span>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Criar {documentType === 'quotation' ? 'Cotação' : documentType === 'proforma' ? 'Proforma' : 'Invoice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
