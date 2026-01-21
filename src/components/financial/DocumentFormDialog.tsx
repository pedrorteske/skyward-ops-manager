import { useState, useEffect, useRef } from 'react';
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
import { useServices } from '@/contexts/ServicesContext';
import { FinancialDocument, FinancialDocumentType, FinancialItem, Currency } from '@/types/financial';
import { ClientPF, ClientPJ, ClientINT } from '@/types/aviation';
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
  const { addDocument, generateDocumentNumber } = useFinancial();
  const { services } = useServices();

  const [formData, setFormData] = useState({
    clientValue: '', // Can be clientId or free text
    flightValue: '', // Can be flightId or free text
    currency: 'BRL' as Currency,
    validUntil: '',
    observations: '',
  });
  const [items, setItems] = useState<FinancialItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const prevCurrencyRef = useRef<Currency>(formData.currency);
  const config = documentTypeConfig[documentType];
  const IconComponent = config.icon;

  useEffect(() => {
    if (sourceDocument) {
      // Determine if clientId exists in clients
      const existingClient = clients.find(c => c.id === sourceDocument.clientId);
      const clientValue = existingClient ? sourceDocument.clientId : (sourceDocument.clientName || sourceDocument.clientId);
      
      // Determine if flightId exists in flights
      const existingFlight = flights.find(f => f.id === sourceDocument.flightId);
      const flightValue = existingFlight ? (sourceDocument.flightId || '') : (sourceDocument.flightInfo || '');
      
      setFormData({
        clientValue,
        flightValue,
        currency: sourceDocument.currency,
        validUntil: sourceDocument.validUntil || '',
        observations: sourceDocument.observations || '',
      });
      setItems(sourceDocument.items.map(item => ({ ...item, id: String(Date.now() + Math.random()) })));
    }
  }, [sourceDocument, clients, flights]);

  // Recalculate prices when currency changes
  useEffect(() => {
    if (prevCurrencyRef.current !== formData.currency) {
      setItems(currentItems => currentItems.map(item => {
        const service = services.find(s => s.name === item.description);
        if (service) {
          const newPrice = formData.currency === 'BRL' ? service.priceBrl : service.priceUsd;
          return {
            ...item,
            unitPrice: newPrice,
            total: item.quantity * newPrice,
          };
        }
        return item;
      }));
      prevCurrencyRef.current = formData.currency;
    }
  }, [formData.currency, services]);


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
          
          // If selecting a registered service, auto-fill the price
          if (field === 'description') {
            const selectedService = services.find(s => s.name === value || s.id === value);
            if (selectedService) {
              updated.description = selectedService.name;
              updated.unitPrice = formData.currency === 'BRL' 
                ? selectedService.priceBrl 
                : selectedService.priceUsd;
              updated.total = updated.quantity * updated.unitPrice;
            }
          }
          
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
    if (!client) return id; // Return the id as text if not found
    if (client.type === 'PF') return (client as ClientPF).fullName;
    if (client.type === 'PJ') return (client as ClientPJ).operator;
    return (client as ClientINT).operator;
  };

  // Check if value is a registered client/flight ID
  const isRegisteredClient = (value: string) => clients.some(c => c.id === value);
  const isRegisteredFlight = (value: string) => flights.some(f => f.id === value);

  const handleSubmit = () => {
    if (!formData.clientValue.trim()) {
      toast.error('Informe um cliente');
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Preencha todos os itens corretamente');
      return;
    }

    // Determine if client is registered or free text
    const clientIsRegistered = isRegisteredClient(formData.clientValue);
    const flightIsRegistered = formData.flightValue && isRegisteredFlight(formData.flightValue);

    const newDocument: FinancialDocument = {
      id: String(Date.now()),
      number: generateDocumentNumber(documentType),
      type: documentType,
      clientId: clientIsRegistered ? formData.clientValue : '',
      clientName: clientIsRegistered ? undefined : formData.clientValue,
      flightId: flightIsRegistered ? formData.flightValue : undefined,
      flightInfo: (!flightIsRegistered && formData.flightValue) ? formData.flightValue : undefined,
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
    };

    addDocument(newDocument);
    toast.success(`${config.title.replace('Nova ', '')} criada com sucesso!`);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormData({
      clientValue: '',
      flightValue: '',
      currency: 'BRL',
      validUntil: '',
      observations: '',
    });
    setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: formData.currency,
    }).format(value);
  };

  const activeClients = clients.filter(c => c.status === 'active');

  // Build options for client combobox
  const clientOptions = activeClients.map(client => ({
    value: client.id,
    label: client.type === 'PF'
      ? (client as ClientPF).fullName
      : (client as ClientPJ).operator,
  }));

  // Build options for flight combobox
  const flightOptions = flights.map((flight) => ({
    value: flight.id,
    label: `${flight.aircraftPrefix} - ${flight.origin}→${flight.destination}`,
  }));

  // Build options for service combobox from registered services
  const serviceComboboxOptions = services
    .filter(s => s.isActive)
    .map(service => {
      const price = formData.currency === 'BRL' ? service.priceBrl : service.priceUsd;
      const formattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: formData.currency,
      }).format(price);
      
      return {
        value: service.name,
        label: `${service.name}${service.category ? ` (${service.category})` : ''} - ${formattedPrice}`,
      };
    });

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
          {/* Client & Flight Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Combobox
                options={clientOptions}
                value={formData.clientValue}
                onValueChange={(v) => setFormData({ ...formData, clientValue: v })}
                placeholder="Digite ou selecione um cliente"
                searchPlaceholder="Buscar ou digitar cliente..."
                emptyText="Nenhum cliente cadastrado."
                allowCustomValue={true}
              />
            </div>
            <div className="space-y-2">
              <Label>Prefixo / Voo (opcional)</Label>
              <Combobox
                options={flightOptions}
                value={formData.flightValue}
                onValueChange={(v) => setFormData({ ...formData, flightValue: v })}
                placeholder="Digite ou selecione um voo"
                searchPlaceholder="Buscar ou digitar voo..."
                emptyText="Nenhum voo cadastrado."
                allowCustomValue={true}
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
              <Label>Itens do Documento</Label>
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
                        <Combobox
                          options={serviceComboboxOptions}
                          value={item.description}
                          onValueChange={(v) => updateItem(item.id, "description", v)}
                          placeholder="Selecione ou digite um serviço"
                          searchPlaceholder="Buscar serviço cadastrado..."
                          emptyText="Nenhum serviço cadastrado. Adicione na aba 'Serviços'."
                          allowCustomValue={true}
                          className="h-9"
                        />
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
          <Button onClick={handleSubmit} disabled={!formData.clientValue.trim() || (documentType === 'quotation' && !formData.validUntil)}>
            Criar {documentType === 'quotation' ? 'Cotação' : documentType === 'proforma' ? 'Proforma' : 'Invoice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
