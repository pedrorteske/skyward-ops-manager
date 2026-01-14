import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuotationStatusBadge } from "@/components/quotations/QuotationStatusBadge";
import { useQuotations } from "@/contexts/QuotationsContext";
import { useClients } from "@/contexts/ClientsContext";
import { useFlights } from "@/contexts/FlightsContext";
import { Quotation, QuotationItem, QuotationStatus, quotationStatusLabels, Currency, Client } from "@/types/aviation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, FileText, Trash2, Mail, Download, Clock, Plane, Pencil } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { generateQuotationPDF } from "@/lib/quotationPdfGenerator";

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

export default function Quotations() {
  const { quotations, isLoading, addQuotation, updateQuotation, deleteQuotation, updateQuotationStatus, generateQuotationNumber } = useQuotations();
  const { clients, getClientById } = useClients();
  const { flights } = useFlights();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<QuotationStatus | "all">("all");
  const [isNewQuotationOpen, setIsNewQuotationOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    clientId: "",
    flightId: "",
    currency: "BRL" as Currency,
    validUntil: "",
    observations: "",
  });

  const [items, setItems] = useState<QuotationItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  const [editFormData, setEditFormData] = useState({
    clientId: "",
    flightId: "",
    currency: "BRL" as Currency,
    validUntil: "",
    observations: "",
  });

  const [editItems, setEditItems] = useState<QuotationItem[]>([]);

  const filteredQuotations = quotations.filter((quotation) => {
    const client = getClientById(quotation.clientId);
    const clientName = client?.type === "PF" ? client.fullName : client?.operator || "";

    const matchesSearch =
      quotation.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || quotation.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const addItem = () => {
    setItems([
      ...items,
      {
        id: String(Date.now()),
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }),
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCreateQuotation = async () => {
    const total = calculateTotal();
    await addQuotation({
      number: generateQuotationNumber(),
      clientId: formData.clientId,
      flightId: formData.flightId || undefined,
      items: items.filter((i) => i.description && i.quantity > 0),
      currency: formData.currency,
      subtotal: total,
      total: total,
      status: "created",
      observations: formData.observations || undefined,
      validUntil: formData.validUntil,
    });

    setIsNewQuotationOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientId: "",
      flightId: "",
      currency: "BRL",
      validUntil: "",
      observations: "",
    });
    setItems([{ id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleEditClick = () => {
    if (selectedQuotation) {
      setEditFormData({
        clientId: selectedQuotation.clientId,
        flightId: selectedQuotation.flightId || "",
        currency: selectedQuotation.currency,
        validUntil: selectedQuotation.validUntil,
        observations: selectedQuotation.observations || "",
      });
      setEditItems([...selectedQuotation.items]);
      setIsEditMode(true);
    }
  };

  const addEditItem = () => {
    setEditItems([
      ...editItems,
      {
        id: String(Date.now()),
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeEditItem = (id: string) => {
    if (editItems.length > 1) {
      setEditItems(editItems.filter((item) => item.id !== id));
    }
  };

  const updateEditItem = (id: string, field: keyof QuotationItem, value: string | number) => {
    setEditItems(
      editItems.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.total = Number(updated.quantity) * Number(updated.unitPrice);
        }
        return updated;
      }),
    );
  };

  const calculateEditTotal = () => {
    return editItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleUpdateQuotation = async () => {
    if (selectedQuotation) {
      const total = calculateEditTotal();
      await updateQuotation(selectedQuotation.id, {
        clientId: editFormData.clientId,
        flightId: editFormData.flightId || undefined,
        items: editItems.filter((i) => i.description && i.quantity > 0),
        currency: editFormData.currency,
        subtotal: total,
        total: total,
        observations: editFormData.observations || undefined,
        validUntil: editFormData.validUntil,
      });

      setIsEditMode(false);
      setSelectedQuotation(null);
    }
  };

  const handleDeleteQuotation = async () => {
    if (selectedQuotation) {
      await deleteQuotation(selectedQuotation.id);
      setIsDeleteDialogOpen(false);
      setSelectedQuotation(null);
    }
  };

  const handleCloseDetail = () => {
    setSelectedQuotation(null);
    setIsEditMode(false);
  };

  const handleSendEmail = async (quotation: Quotation) => {
    toast.success("E-mail enviado com sucesso!");
    await updateQuotationStatus(quotation.id, "sent");
  };

  const handleDownloadPDF = (quotation: Quotation) => {
    const client = getClientById(quotation.clientId);
    const flight = quotation.flightId ? flights.find(f => f.id === quotation.flightId) : undefined;
    
    try {
      generateQuotationPDF({ quotation, client, flight });
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const formatCurrency = (value: number, currency: Currency) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency === "BRL" ? "BRL" : "USD",
    }).format(value);
  };

  return (
    <MainLayout>
      <PageHeader title="Cotações" description="Crie e gerencie propostas comerciais">
        <Dialog open={isNewQuotationOpen} onOpenChange={setIsNewQuotationOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Cotação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Criar Nova Cotação
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Client & Flight Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <Combobox
                    options={clients
                      .filter((c) => c.status === "active")
                      .map((client) => ({
                        value: client.id,
                        label: client.type === "PF" ? client.fullName : client.operator,
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
                <div className="space-y-2">
                  <Label>Válida até *</Label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
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
                            <Combobox
                              options={serviceOptions.map(s => ({ value: s, label: s }))}
                              value={item.description}
                              onValueChange={(v) => updateItem(item.id, "description", v)}
                              placeholder="Selecione ou digite um serviço"
                              searchPlaceholder="Buscar ou digitar..."
                              emptyText="Nenhum serviço encontrado."
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
                          <TableCell className="font-medium">{formatCurrency(item.total, formData.currency)}</TableCell>
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
                        <p className="text-2xl font-bold">{formatCurrency(calculateTotal(), formData.currency)}</p>
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
              <Button variant="outline" onClick={() => setIsNewQuotationOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateQuotation} disabled={!formData.clientId || !formData.validUntil}>
                Criar Cotação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as QuotationStatus | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {Object.entries(quotationStatusLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quotations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredQuotations.map((quotation) => {
          const client = getClientById(quotation.clientId);
          const flight = quotation.flightId ? flights.find(f => f.id === quotation.flightId) : null;
          const clientName = client?.type === "PF" ? client.fullName : client?.operator;

          return (
            <div
              key={quotation.id}
              className="aviation-card p-5 hover:border-primary/50 cursor-pointer transition-all"
              onClick={() => setSelectedQuotation(quotation)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-sm font-semibold text-primary">{quotation.number}</p>
                  <p className="text-sm font-medium text-foreground mt-1">{clientName}</p>
                </div>
                <QuotationStatusBadge status={quotation.status} />
              </div>

              {flight && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-2 bg-muted/50 rounded">
                  <Plane className="w-4 h-4" />
                  <span>{flight.aircraftPrefix}</span>
                  <span>•</span>
                  <span>
                    {flight.origin} → {flight.destination}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">
                    Válida até {new Date(quotation.validUntil).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(quotation.total, quotation.currency)}
                </p>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadPDF(quotation);
                  }}
                >
                  <Download className="w-4 h-4 mr-1" /> PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendEmail(quotation);
                  }}
                  disabled={quotation.status !== "created"}
                >
                  <Mail className="w-4 h-4 mr-1" /> Enviar
                </Button>
              </div>
            </div>
          );
        })}

        {filteredQuotations.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/50 rounded-lg">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Nenhuma cotação encontrada</p>
            <p className="text-sm">Crie uma nova cotação para começar</p>
          </div>
        )}
      </div>

      {/* Quotation Detail Modal */}
      <Dialog open={!!selectedQuotation} onOpenChange={handleCloseDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedQuotation && !isEditMode && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-mono">{selectedQuotation.number}</span>
                  </div>
                  <QuotationStatusBadge status={selectedQuotation.status} />
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">
                      {(() => {
                        const client = getClientById(selectedQuotation.clientId);
                        return client?.type === "PF" ? client.fullName : client?.operator;
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Moeda</p>
                    <p className="font-medium">{selectedQuotation.currency}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Itens</p>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Unit.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedQuotation.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.unitPrice, selectedQuotation.currency)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.total, selectedQuotation.currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end p-4 bg-muted/50 rounded-lg">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(selectedQuotation.total, selectedQuotation.currency)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => handleDownloadPDF(selectedQuotation)}>
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleSendEmail(selectedQuotation)}
                    disabled={selectedQuotation.status !== "created"}
                  >
                    <Mail className="w-4 h-4 mr-2" /> Enviar
                  </Button>
                </div>

                {/* Edit/Delete Actions */}
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleEditClick} className="flex-1 gap-2">
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Edit Mode */}
          {selectedQuotation && isEditMode && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-primary" />
                  Editar Cotação - {selectedQuotation.number}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Client & Flight Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <Combobox
                      options={clients
                        .filter((c) => c.status === "active")
                        .map((client) => ({
                          value: client.id,
                          label: client.type === "PF" ? client.fullName : client.operator,
                        }))}
                      value={editFormData.clientId}
                      onValueChange={(v) => setEditFormData({ ...editFormData, clientId: v })}
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
                      value={editFormData.flightId || "none"}
                      onValueChange={(v) => setEditFormData({ ...editFormData, flightId: v === "none" ? "" : v })}
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
                      value={editFormData.currency}
                      onValueChange={(v) => setEditFormData({ ...editFormData, currency: v as Currency })}
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
                  <div className="space-y-2">
                    <Label>Válida até *</Label>
                    <Input
                      type="date"
                      value={editFormData.validUntil}
                      onChange={(e) => setEditFormData({ ...editFormData, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Itens da Cotação</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addEditItem}>
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
                        {editItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Combobox
                                options={serviceOptions.map(s => ({ value: s, label: s }))}
                                value={item.description}
                                onValueChange={(v) => updateEditItem(item.id, "description", v)}
                                placeholder="Selecione ou digite um serviço"
                                searchPlaceholder="Buscar ou digitar..."
                                emptyText="Nenhum serviço encontrado."
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
                                onChange={(e) => updateEditItem(item.id, "quantity", Number(e.target.value))}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                className="h-9"
                                value={item.unitPrice}
                                onChange={(e) => updateEditItem(item.id, "unitPrice", Number(e.target.value))}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(item.total, editFormData.currency)}</TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeEditItem(item.id)}
                                disabled={editItems.length === 1}
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
                          <p className="text-2xl font-bold">{formatCurrency(calculateEditTotal(), editFormData.currency)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observations */}
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={editFormData.observations}
                    onChange={(e) => setEditFormData({ ...editFormData, observations: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateQuotation} disabled={!editFormData.clientId || !editFormData.validUntil}>
                  Salvar Alterações
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cotação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a cotação <span className="font-mono font-bold">{selectedQuotation?.number}</span>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuotation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
