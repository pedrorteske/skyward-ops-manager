import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, FileText, Receipt, FileCheck } from 'lucide-react';
import { useClients } from '@/contexts/ClientsContext';
import { useFlights } from '@/contexts/FlightsContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { FinancialDocument, FinancialDocumentType, FinancialItem, Currency } from '@/types/financial';
import { ClientPF, ClientPJ } from '@/types/aviation';
import { toast } from 'sonner';

const serviceOptions = [
  "Handling de chegada",
  "Handling de saída",
  "Handling completo",
  "Estacionamento (24h)",
  "Hangaragem (por dia)",
  "Abastecimento JET-A1 (litros)",
  "Catering executivo",
  "Transporte terrestre VIP",
  "Despacho aduaneiro",
  "GPU (Ground Power Unit)",
  "Lavagem de aeronave",
  "Serviço personalizado",
];

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

  const [formData, setFormData] = useState({
    clientId: '',
    flightId: '',
    currency: 'BRL' as Currency,
    validUntil: '',
    observations: '',
  });
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
      setFormData({
        clientId: sourceDocument.clientId,
        flightId: sourceDocument.flightId || '',
        currency: sourceDocument.currency,
        validUntil: sourceDocument.validUntil || '',
        observations: sourceDocument.observations || '',
      });
      setItems(sourceDocument.items.map(item => ({ ...item, id: String(Date.now() + Math.random()) })));
    }
  }, [sourceDocument]);

  const handleSourceDocumentChange = (docId: string) => {
    setSourceDocumentId(docId);
    const sources = documentType === 'proforma' ? availableQuotations : [...availableQuotations, ...availableProformas];
    const doc = sources.find(d => d.id === docId);
    if (doc) {
      setFormData({
        clientId: doc.clientId,
        flightId: doc.flightId || '',
        currency: doc.currency,
        validUntil: doc.validUntil || '',
        observations: doc.observations || '',
      });
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

  const getClientName = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (!client) return '';
    return client.type === 'PF' ? (client as ClientPF).fullName : (client as ClientPJ).operator;
  };

  const handleSubmit = () => {
    if (!formData.clientId) {
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
      clientId: formData.clientId,
      flightId: formData.flightId || undefined,
      items,
      currency: formData.currency,
      subtotal: calculateTotal(),
      total: calculateTotal(),
      status: 'created',
      observations: formData.observations || undefined,
      companyId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      validUntil: documentType === 'quotation' && formData.validUntil
        ? formData.validUntil
        : documentType === 'quotation' 
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
    setFormData({
      clientId: '',
      flightId: '',
      currency: 'BRL',
      validUntil: '',
      observations: '',
    });
    setSourceDocumentId('');
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: formData.currency,
    }).format(value);
  };

  const activeClients = clients.filter(c => c.status === 'active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

          {/* Client & Flight Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Combobox
                options={activeClients.map(client => ({
                  value: client.id,
                  label: client.type === 'PF'
                    ? (client as ClientPF).fullName
                    : (client as ClientPJ).operator,
                }))}
                value={formData.clientId}
                onValueChange={(v) => setFormData({ ...formData, clientId: v })}
                placeholder="Selecione um cliente"
                searchPlaceholder="Buscar cliente..."
                emptyText="Nenhum cliente encontrado."
              />
            </div>
            <div className="space-y-2">
              <Label>Prefixo (opcional)</Label>
              <Combobox
                options={[
                  { value: "none", label: "Nenhum" },
                  ...flights.map((flight) => ({
                    value: flight.id,
                    label: `${flight.aircraftPrefix} - ${flight.origin}→${flight.destination}`,
                  })),
                ]}
                value={formData.flightId || "none"}
                onValueChange={(v) => setFormData({ ...formData, flightId: v === "none" ? "" : v })}
                placeholder="Vincular a um voo"
                searchPlaceholder="Buscar voo..."
                emptyText="Nenhum voo encontrado."
              />
            </div>
          </div>

          {/* Currency & Validity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Moeda *</Label>
              <Select
                value={formData.currency}
                onValueChange={(v) => setFormData({ ...formData, currency: v as Currency })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
                  <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {documentType === 'quotation' && (
              <div className="space-y-2">
                <Label>Válida até *</Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Itens da Cotação</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Descrição</TableHead>
                    <TableHead className="w-[15%]">Qtd</TableHead>
                    <TableHead className="w-[20%]">Preço Unit.</TableHead>
                    <TableHead className="w-[20%]">Total</TableHead>
                    <TableHead className="w-[5%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select
                          value={item.description}
                          onValueChange={(v) => updateItem(item.id, "description", v)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione um serviço" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceOptions.map((service) => (
                              <SelectItem key={service} value={service}>
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          className="h-9"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-9"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="border-t bg-muted/50 p-4">
                <div className="flex justify-end gap-8">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.clientId || (documentType === 'quotation' && !formData.validUntil)}>
            Criar {documentType === 'quotation' ? 'Cotação' : documentType === 'proforma' ? 'Proforma' : 'Invoice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}