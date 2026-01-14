import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Plus, Trash2, FileText, Copy, Check, Plane, User, MapPin, DollarSign, CreditCard, ClipboardList, Calculator } from 'lucide-react';
import { useClients } from '@/contexts/ClientsContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  GroundHandlingClient,
  OperationInfo,
  IncludedService,
  AdditionalService,
  PaymentInfo,
  ClientType,
  PaymentMethod,
  ChargeUnit,
  defaultIncludedServices,
  defaultAdditionalServices,
  chargeUnitLabels,
  paymentMethodLabels,
  flightTypeOptions,
} from '@/types/groundHandling';
import type { FinancialDocument, FinancialDocumentType, Currency } from '@/types/financial';
import type { ClientPF, ClientPJ, ClientINT } from '@/types/aviation';

interface GroundHandlingQuotationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroundHandlingQuotationForm({ open, onOpenChange }: GroundHandlingQuotationFormProps) {
  const { clients } = useClients();
  const { addDocument, generateDocumentNumber } = useFinancial();
  const { user } = useAuth();
  
  // Client data
  const [clientData, setClientData] = useState<GroundHandlingClient>({
    name: '',
    type: 'PJ',
    operator: '',
    cnpj: '',
    email: '',
    observations: '',
  });

  // Operation data
  const [operationData, setOperationData] = useState<OperationInfo>({
    airport: '',
    operationDate: '',
    aircraftType: '',
    aircraftPrefix: '',
    flightType: '',
    eta: '',
    etd: '',
    observations: '',
  });

  // Service value
  const [serviceValue, setServiceValue] = useState<number>(0);
  const [currency, setCurrency] = useState<Currency>('BRL');

  // Included services
  const [includedServices, setIncludedServices] = useState<IncludedService[]>(
    defaultIncludedServices.map((s, i) => ({ ...s, id: String(i + 1) }))
  );

  // Additional services
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>(
    defaultAdditionalServices.map((s, i) => ({ ...s, id: String(i + 1), total: s.unitPrice * s.quantity }))
  );

  // Admin fee
  const [applyAdminFee, setApplyAdminFee] = useState(true);
  const [adminFeePercentage] = useState(15);
  const [adminFeeText, setAdminFeeText] = useState(
    '15% de taxa de administração será cobrada sobre qualquer serviço de terceiros ou taxas aeroportuárias pagos em nome do operador.'
  );
  const [taxObservation, setTaxObservation] = useState(
    'Taxas governamentais serão cobradas sobre o valor total da invoice.'
  );

  // Payment
  const [paymentData, setPaymentData] = useState<PaymentInfo>({
    method: 'antecipado',
    pixData: '',
    observations: '',
  });

  // Company info (from auth)
  const [companyInfo, setCompanyInfo] = useState({
    name: user?.companyName || 'AeroOps FBO',
    responsibleName: user?.name || '',
    responsibleRole: 'Gerente Operacional',
    responsiblePhone: '',
    responsibleEmail: user?.email || '',
  });

  // Generated email text
  const [generatedEmailText, setGeneratedEmailText] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('client');

  // Calculate totals
  const additionalServicesTotal = useMemo(() => 
    additionalServices.reduce((acc, s) => acc + (s.unitPrice * s.quantity), 0),
    [additionalServices]
  );

  const adminFeeAmount = useMemo(() => 
    applyAdminFee ? (serviceValue + additionalServicesTotal) * (adminFeePercentage / 100) : 0,
    [applyAdminFee, serviceValue, additionalServicesTotal, adminFeePercentage]
  );

  const grandTotal = useMemo(() => 
    serviceValue + additionalServicesTotal + adminFeeAmount,
    [serviceValue, additionalServicesTotal, adminFeeAmount]
  );

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  // Generate email text
  useEffect(() => {
    const checkedServices = includedServices.filter(s => s.checked);
    const activeAdditionalServices = additionalServices.filter(s => s.unitPrice > 0);

    const includedServicesText = checkedServices.length > 0
      ? checkedServices.map(s => `• ${s.name}`).join('\n')
      : '• Nenhum serviço incluso selecionado';

    const additionalServicesText = activeAdditionalServices.length > 0
      ? activeAdditionalServices.map(s => 
          `• ${s.name}: ${formatCurrency(s.unitPrice)} ${chargeUnitLabels[s.chargeUnit]}${s.unavailableNote ? ` (${s.unavailableNote})` : ''}`
        ).join('\n')
      : '• Não há serviços adicionais nesta cotação';

    const emailText = `Prezado(a) ${clientData.name || '[Nome do Cliente]'},

Informamos que temos disponibilidade para atender no horário solicitado.

Gentileza notar que nossa confirmação de atendimento está condicionada ao pagamento antecipado, mediante envio do comprovante. Para emissão da posterior Nota Fiscal, solicitamos também o envio do CNPJ do operador, quando aplicável.

Valor do atendimento:
${currency} ${formatCurrency(serviceValue).replace(currency, '').trim()} – (impostos não incluídos)

Serviços inclusos em nosso atendimento de pista:
${includedServicesText}

Serviços não inclusos no valor acima:
${additionalServicesText}

Observações:
• ${adminFeeText}
• ${taxObservation}

Forma de pagamento:
Pagamento ${paymentMethodLabels[paymentData.method].toLowerCase()} via ${paymentMethodLabels[paymentData.method].toLowerCase()}.
PIX / Dados bancários: ${paymentData.pixData || '[Dados não informados]'}

Permanecemos à disposição para quaisquer esclarecimentos adicionais.

Atenciosamente,
${companyInfo.name}
${companyInfo.responsibleName}
${companyInfo.responsibleRole}
${companyInfo.responsiblePhone}
${companyInfo.responsibleEmail}`;

    setGeneratedEmailText(emailText);
  }, [
    clientData,
    serviceValue,
    currency,
    includedServices,
    additionalServices,
    paymentData,
    companyInfo,
    adminFeeText,
    taxObservation,
  ]);

  // Update additional service
  const updateAdditionalService = (id: string, field: keyof AdditionalService, value: string | number) => {
    setAdditionalServices(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        if (field === 'unitPrice' || field === 'quantity') {
          updated.total = Number(updated.unitPrice) * Number(updated.quantity);
        }
        return updated;
      }
      return s;
    }));
  };

  // Add additional service
  const addAdditionalService = () => {
    setAdditionalServices(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: '',
        unitPrice: 0,
        chargeUnit: 'utilizacao',
        quantity: 1,
        total: 0,
      },
    ]);
  };

  // Remove additional service
  const removeAdditionalService = (id: string) => {
    setAdditionalServices(prev => prev.filter(s => s.id !== id));
  };

  // Toggle included service
  const toggleIncludedService = (id: string) => {
    setIncludedServices(prev => prev.map(s => 
      s.id === id ? { ...s, checked: !s.checked } : s
    ));
  };

  // Copy email text
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmailText);
      setCopied(true);
      toast.success('Texto copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar texto');
    }
  };

  // Save as quotation or proforma
  const handleSave = (type: FinancialDocumentType) => {
    if (!clientData.name.trim()) {
      toast.error('Informe o nome do cliente');
      return;
    }

    if (serviceValue <= 0) {
      toast.error('Informe o valor do atendimento');
      return;
    }

    // Build items from services
    const items = [
      {
        id: '1',
        description: `Atendimento de pista - ${operationData.airport || 'Aeroporto não especificado'}`,
        quantity: 1,
        unitPrice: serviceValue,
        total: serviceValue,
      },
      ...additionalServices
        .filter(s => s.unitPrice > 0)
        .map((s, i) => ({
          id: String(i + 2),
          description: `${s.name} (${chargeUnitLabels[s.chargeUnit]})`,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          total: s.unitPrice * s.quantity,
        })),
    ];

    // Build observations
    const observations = [
      includedServices.filter(s => s.checked).length > 0
        ? `Serviços inclusos: ${includedServices.filter(s => s.checked).map(s => s.name).join(', ')}`
        : '',
      applyAdminFee ? adminFeeText : '',
      taxObservation,
      operationData.observations || '',
      paymentData.observations || '',
    ].filter(Boolean).join('\n\n');

    const newDocument: FinancialDocument = {
      id: String(Date.now()),
      number: generateDocumentNumber(type),
      type,
      clientId: '',
      clientName: clientData.name,
      flightInfo: operationData.aircraftPrefix 
        ? `${operationData.aircraftPrefix} - ${operationData.airport}`
        : undefined,
      items,
      currency,
      subtotal: serviceValue + additionalServicesTotal,
      total: grandTotal,
      status: 'created',
      observations,
      companyId: user?.companyId || '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      validUntil: type === 'quotation'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    };

    addDocument(newDocument);
    toast.success(`${type === 'quotation' ? 'Cotação' : 'Proforma Invoice'} criada com sucesso!`);
    onOpenChange(false);
  };

  // Client suggestions from registered clients
  const clientSuggestions = clients
    .filter(c => c.status === 'active')
    .map(c => ({
      value: c.id,
      label: c.type === 'PF' 
        ? (c as ClientPF).fullName 
        : (c as ClientPJ | ClientINT).operator,
    }));

  const handleClientSelect = (value: string) => {
    const selectedClient = clients.find(c => c.id === value);
    if (selectedClient) {
      const clientEmail = selectedClient.type === 'PJ' 
        ? (selectedClient as ClientPJ).commercialEmail 
        : (selectedClient as ClientPF | ClientINT).email;
      
      setClientData({
        name: selectedClient.type === 'PF' 
          ? (selectedClient as ClientPF).fullName 
          : (selectedClient as ClientPJ | ClientINT).operator,
        type: selectedClient.type as ClientType,
        operator: selectedClient.type !== 'PF' 
          ? (selectedClient as ClientPJ | ClientINT).operator 
          : '',
        cnpj: selectedClient.type === 'PJ' 
          ? (selectedClient as ClientPJ).cnpj 
          : '',
        email: clientEmail,
        observations: '',
      });
    } else {
      setClientData(prev => ({ ...prev, name: value }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plane className="w-5 h-5 text-primary" />
            Formulário de Cotação - Operações de Pista
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Form Area */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-6 pt-4 border-b bg-muted/30">
                <TabsList className="grid grid-cols-6 w-full">
                  <TabsTrigger value="client" className="flex items-center gap-1 text-xs">
                    <User className="w-3 h-3" />
                    Cliente
                  </TabsTrigger>
                  <TabsTrigger value="operation" className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3 h-3" />
                    Operação
                  </TabsTrigger>
                  <TabsTrigger value="services" className="flex items-center gap-1 text-xs">
                    <ClipboardList className="w-3 h-3" />
                    Serviços
                  </TabsTrigger>
                  <TabsTrigger value="fees" className="flex items-center gap-1 text-xs">
                    <DollarSign className="w-3 h-3" />
                    Taxas
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="flex items-center gap-1 text-xs">
                    <CreditCard className="w-3 h-3" />
                    Pagamento
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center gap-1 text-xs">
                    <FileText className="w-3 h-3" />
                    E-mail
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-6 py-4">
                {/* Client Tab */}
                <TabsContent value="client" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        Dados do Cliente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome do Cliente *</Label>
                          <Combobox
                            options={clientSuggestions}
                            value={clientData.name}
                            onValueChange={handleClientSelect}
                            placeholder="Digite ou selecione um cliente"
                            searchPlaceholder="Buscar cliente..."
                            emptyText="Nenhum cliente encontrado"
                            allowCustomValue={true}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo de Cliente</Label>
                          <Select
                            value={clientData.type}
                            onValueChange={(v) => setClientData({ ...clientData, type: v as ClientType })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PF">Pessoa Física</SelectItem>
                              <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                              <SelectItem value="INT">Internacional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Operador</Label>
                          <Input
                            value={clientData.operator}
                            onChange={(e) => setClientData({ ...clientData, operator: e.target.value })}
                            placeholder="Nome do operador"
                          />
                        </div>
                        {clientData.type === 'PJ' && (
                          <div className="space-y-2">
                            <Label>CNPJ *</Label>
                            <Input
                              value={clientData.cnpj}
                              onChange={(e) => setClientData({ ...clientData, cnpj: e.target.value })}
                              placeholder="00.000.000/0000-00"
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>E-mail</Label>
                          <Input
                            type="email"
                            value={clientData.email}
                            onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Observações adicionais</Label>
                        <Textarea
                          value={clientData.observations}
                          onChange={(e) => setClientData({ ...clientData, observations: e.target.value })}
                          placeholder="Observações sobre o cliente..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Operation Tab */}
                <TabsContent value="operation" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Informações da Operação
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Aeroporto *</Label>
                          <Input
                            value={operationData.airport}
                            onChange={(e) => setOperationData({ ...operationData, airport: e.target.value })}
                            placeholder="SBGR - Guarulhos"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Data da Operação</Label>
                          <Input
                            type="date"
                            value={operationData.operationDate}
                            onChange={(e) => setOperationData({ ...operationData, operationDate: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo de Aeronave</Label>
                          <Input
                            value={operationData.aircraftType}
                            onChange={(e) => setOperationData({ ...operationData, aircraftType: e.target.value })}
                            placeholder="Ex: Phenom 300, Citation XLS"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Prefixo da Aeronave</Label>
                          <Input
                            value={operationData.aircraftPrefix}
                            onChange={(e) => setOperationData({ ...operationData, aircraftPrefix: e.target.value })}
                            placeholder="Ex: PR-ABC"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Tipo de Voo</Label>
                          <Select
                            value={operationData.flightType}
                            onValueChange={(v) => setOperationData({ ...operationData, flightType: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {flightTypeOptions.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>ETA (Horário Chegada)</Label>
                          <Input
                            type="time"
                            value={operationData.eta}
                            onChange={(e) => setOperationData({ ...operationData, eta: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ETD (Horário Saída)</Label>
                          <Input
                            type="time"
                            value={operationData.etd}
                            onChange={(e) => setOperationData({ ...operationData, etd: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Observações operacionais</Label>
                        <Textarea
                          value={operationData.observations}
                          onChange={(e) => setOperationData({ ...operationData, observations: e.target.value })}
                          placeholder="Observações sobre a operação..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="mt-0 space-y-4">
                  {/* Main Service Value */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        Valor Principal do Atendimento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                          <Label>Valor do atendimento de pista *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={serviceValue || ''}
                            onChange={(e) => setServiceValue(Number(e.target.value))}
                            placeholder="0,00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Moeda</Label>
                          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="BRL">BRL - Real</SelectItem>
                              <SelectItem value="USD">USD - Dólar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-sm text-muted-foreground pb-2">(impostos não incluídos)</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Included Services */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Check className="w-4 h-4 text-success" />
                        Serviços Inclusos no Atendimento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-2">
                        {includedServices.map(service => (
                          <div key={service.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                            <Checkbox
                              id={service.id}
                              checked={service.checked}
                              onCheckedChange={() => toggleIncludedService(service.id)}
                            />
                            <label
                              htmlFor={service.id}
                              className="flex-1 text-sm cursor-pointer"
                            >
                              {service.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Services */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Plus className="w-4 h-4 text-warning" />
                          Serviços Adicionais (Não Inclusos)
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={addAdditionalService}>
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[25%]">Serviço</TableHead>
                              <TableHead className="w-[18%]">Valor</TableHead>
                              <TableHead className="w-[22%]">Cobrança</TableHead>
                              <TableHead className="w-[10%]">Qtd</TableHead>
                              <TableHead className="w-[15%]">Total</TableHead>
                              <TableHead className="w-[10%]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {additionalServices.map(service => (
                              <TableRow key={service.id}>
                                <TableCell>
                                  <Input
                                    value={service.name}
                                    onChange={(e) => updateAdditionalService(service.id, 'name', e.target.value)}
                                    placeholder="Nome do serviço"
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={service.unitPrice || ''}
                                    onChange={(e) => updateAdditionalService(service.id, 'unitPrice', Number(e.target.value))}
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={service.chargeUnit}
                                    onValueChange={(v) => updateAdditionalService(service.id, 'chargeUnit', v)}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="utilizacao">por utilização</SelectItem>
                                      <SelectItem value="hora">por hora</SelectItem>
                                      <SelectItem value="movimento">por movimento</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={service.quantity}
                                    onChange={(e) => updateAdditionalService(service.id, 'quantity', Number(e.target.value))}
                                    className="h-8"
                                  />
                                </TableCell>
                                <TableCell className="font-medium">
                                  {formatCurrency(service.unitPrice * service.quantity)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => removeAdditionalService(service.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Dica: Para serviços não disponíveis, você pode adicionar uma observação no campo de nome (ex: "GPU - não disponível para este tipo de aeronave").
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Fees Tab */}
                <TabsContent value="fees" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-primary" />
                        Taxas e Observações Financeiras
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="space-y-1">
                          <Label>Aplicar taxa administrativa</Label>
                          <p className="text-sm text-muted-foreground">{adminFeePercentage}% sobre serviços de terceiros</p>
                        </div>
                        <Switch
                          checked={applyAdminFee}
                          onCheckedChange={setApplyAdminFee}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Texto da taxa administrativa</Label>
                        <Textarea
                          value={adminFeeText}
                          onChange={(e) => setAdminFeeText(e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Observação sobre taxas governamentais</Label>
                        <Textarea
                          value={taxObservation}
                          onChange={(e) => setTaxObservation(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        Forma de Pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Forma de Pagamento</Label>
                        <Select
                          value={paymentData.method}
                          onValueChange={(v) => setPaymentData({ ...paymentData, method: v as PaymentMethod })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="antecipado">Pagamento Antecipado</SelectItem>
                            <SelectItem value="link">Link de Pagamento</SelectItem>
                            <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>PIX / Dados Bancários</Label>
                        <Textarea
                          value={paymentData.pixData}
                          onChange={(e) => setPaymentData({ ...paymentData, pixData: e.target.value })}
                          placeholder="Chave PIX, conta bancária, etc."
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Observações de pagamento</Label>
                        <Textarea
                          value={paymentData.observations}
                          onChange={(e) => setPaymentData({ ...paymentData, observations: e.target.value })}
                          placeholder="Observações adicionais sobre o pagamento..."
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Company Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Dados do Responsável</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome da Empresa</Label>
                          <Input
                            value={companyInfo.name}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nome do Responsável</Label>
                          <Input
                            value={companyInfo.responsibleName}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, responsibleName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Cargo</Label>
                          <Input
                            value={companyInfo.responsibleRole}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, responsibleRole: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Telefone</Label>
                          <Input
                            value={companyInfo.responsiblePhone}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, responsiblePhone: e.target.value })}
                            placeholder="+55 11 99999-9999"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>E-mail</Label>
                          <Input
                            type="email"
                            value={companyInfo.responsibleEmail}
                            onChange={(e) => setCompanyInfo({ ...companyInfo, responsibleEmail: e.target.value })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Email Tab */}
                <TabsContent value="email" className="mt-0 space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          Texto para E-mail
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyEmail}
                          className={cn(copied && 'text-success border-success')}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copiar texto
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={generatedEmailText}
                        onChange={(e) => setGeneratedEmailText(e.target.value)}
                        className="font-mono text-sm min-h-[400px]"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Este texto é gerado automaticamente com base nos dados do formulário. Você pode editá-lo livremente antes de copiar.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Summary Sidebar */}
          <div className="w-72 border-l bg-muted/20 p-4 overflow-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  Resumo Financeiro
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Atendimento:</span>
                    <span className="font-medium">{formatCurrency(serviceValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serviços adicionais:</span>
                    <span className="font-medium">{formatCurrency(additionalServicesTotal)}</span>
                  </div>
                  {applyAdminFee && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa admin ({adminFeePercentage}%):</span>
                      <span className="font-medium">{formatCurrency(adminFeeAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-base font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Salvar como:</h4>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleSave('quotation')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Cotação
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSave('proforma')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Proforma Invoice
                </Button>
              </div>

              <Separator />

              {clientData.name && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Cliente:</strong> {clientData.name}</p>
                  {operationData.airport && <p><strong>Aeroporto:</strong> {operationData.airport}</p>}
                  {operationData.aircraftPrefix && <p><strong>Aeronave:</strong> {operationData.aircraftPrefix}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
