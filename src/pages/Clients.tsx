import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClients } from '@/contexts/ClientsContext';
import { Client, ClientPF, ClientPJ, ClientType } from '@/types/aviation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, User, Building2, Mail, Phone, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ClientsDashboard } from '@/components/clients/ClientsDashboard';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ClientType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | 'all'>('all');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [clientType, setClientType] = useState<ClientType>('PJ');
  const [editClientType, setEditClientType] = useState<ClientType>('PJ');
  const [formDataPF, setFormDataPF] = useState({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    observations: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [formDataPJ, setFormDataPJ] = useState({
    operator: '',
    cnpj: '',
    commercialEmail: '',
    phone: '',
    contactPerson: '',
    observations: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [editFormDataPF, setEditFormDataPF] = useState({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    observations: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [editFormDataPJ, setEditFormDataPJ] = useState({
    operator: '',
    cnpj: '',
    commercialEmail: '',
    phone: '',
    contactPerson: '',
    observations: '',
    status: 'active' as 'active' | 'inactive',
  });

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = client.type === 'PF' 
      ? (client as ClientPF).fullName.toLowerCase().includes(searchLower) ||
        (client as ClientPF).email.toLowerCase().includes(searchLower)
      : (client as ClientPJ).operator.toLowerCase().includes(searchLower) ||
        (client as ClientPJ).commercialEmail.toLowerCase().includes(searchLower);
    
    const matchesType = filterType === 'all' || client.type === filterType;
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateClient = () => {
    const newClient: Client = clientType === 'PF' 
      ? {
          id: String(Date.now()),
          type: 'PF',
          ...formDataPF,
          companyId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as ClientPF
      : {
          id: String(Date.now()),
          type: 'PJ',
          ...formDataPJ,
          companyId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as ClientPJ;
    
    addClient(newClient);
    setIsNewClientOpen(false);
    resetForm();
    toast.success('Cliente cadastrado com sucesso!');
  };

  const resetForm = () => {
    setFormDataPF({
      fullName: '',
      cpf: '',
      email: '',
      phone: '',
      observations: '',
      status: 'active',
    });
    setFormDataPJ({
      operator: '',
      cnpj: '',
      commercialEmail: '',
      phone: '',
      contactPerson: '',
      observations: '',
      status: 'active',
    });
  };

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setEditClientType(client.type);
    
    if (client.type === 'PF') {
      const pfClient = client as ClientPF;
      setEditFormDataPF({
        fullName: pfClient.fullName,
        cpf: pfClient.cpf,
        email: pfClient.email,
        phone: pfClient.phone,
        observations: pfClient.observations || '',
        status: pfClient.status,
      });
    } else {
      const pjClient = client as ClientPJ;
      setEditFormDataPJ({
        operator: pjClient.operator,
        cnpj: pjClient.cnpj,
        commercialEmail: pjClient.commercialEmail,
        phone: pjClient.phone,
        contactPerson: pjClient.contactPerson,
        observations: pjClient.observations || '',
        status: pjClient.status,
      });
    }
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = () => {
    if (!selectedClient) return;

    const updatedClient: Client = editClientType === 'PF'
      ? {
          ...selectedClient,
          type: 'PF',
          ...editFormDataPF,
          updatedAt: new Date().toISOString(),
        } as ClientPF
      : {
          ...selectedClient,
          type: 'PJ',
          ...editFormDataPJ,
          updatedAt: new Date().toISOString(),
        } as ClientPJ;

    updateClient(selectedClient.id, updatedClient);
    setIsEditDialogOpen(false);
    setSelectedClient(null);
    toast.success('Cliente atualizado com sucesso!');
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClient = () => {
    if (selectedClient) {
      deleteClient(selectedClient.id);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
      toast.success('Cliente excluído com sucesso!');
    }
  };

  const getClientName = (client: Client) => {
    return client.type === 'PF' ? (client as ClientPF).fullName : (client as ClientPJ).operator;
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Clientes" 
        description="Gerencie seus clientes PF e PJ"
      >
        <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Cadastrar Novo Cliente
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Client Type Selection */}
              <div className="space-y-2">
                <Label>Tipo de Cliente *</Label>
                <Select value={clientType} onValueChange={(v) => setClientType(v as ClientType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Pessoa Física (PF)
                      </div>
                    </SelectItem>
                    <SelectItem value="PJ">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Pessoa Jurídica (PJ)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {clientType === 'PF' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      placeholder="João Pedro Martins"
                      value={formDataPF.fullName}
                      onChange={(e) => setFormDataPF({...formDataPF, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={formDataPF.cpf}
                      onChange={(e) => setFormDataPF({...formDataPF, cpf: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailPF">E-mail *</Label>
                    <Input
                      id="emailPF"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formDataPF.email}
                      onChange={(e) => setFormDataPF({...formDataPF, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phonePF">Telefone *</Label>
                    <Input
                      id="phonePF"
                      placeholder="(11) 99999-9999"
                      value={formDataPF.phone}
                      onChange={(e) => setFormDataPF({...formDataPF, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observationsPF">Observações</Label>
                    <Textarea
                      id="observationsPF"
                      placeholder="Observações sobre o cliente..."
                      value={formDataPF.observations}
                      onChange={(e) => setFormDataPF({...formDataPF, observations: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select 
                      value={formDataPF.status} 
                      onValueChange={(v) => setFormDataPF({...formDataPF, status: v as 'active' | 'inactive'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="operator">Operador *</Label>
                    <Input
                      id="operator"
                      placeholder="Nome da Empresa"
                      value={formDataPJ.operator}
                      onChange={(e) => setFormDataPJ({...formDataPJ, operator: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0001-00"
                      value={formDataPJ.cnpj}
                      onChange={(e) => setFormDataPJ({...formDataPJ, cnpj: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commercialEmail">E-mail Comercial *</Label>
                    <Input
                      id="commercialEmail"
                      type="email"
                      placeholder="comercial@empresa.com"
                      value={formDataPJ.commercialEmail}
                      onChange={(e) => setFormDataPJ({...formDataPJ, commercialEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phonePJ">Telefone *</Label>
                    <Input
                      id="phonePJ"
                      placeholder="(11) 3000-0000"
                      value={formDataPJ.phone}
                      onChange={(e) => setFormDataPJ({...formDataPJ, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contato Responsável *</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Nome do responsável"
                      value={formDataPJ.contactPerson}
                      onChange={(e) => setFormDataPJ({...formDataPJ, contactPerson: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observationsPJ">Observações</Label>
                    <Textarea
                      id="observationsPJ"
                      placeholder="Observações sobre o cliente..."
                      value={formDataPJ.observations}
                      onChange={(e) => setFormDataPJ({...formDataPJ, observations: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select 
                      value={formDataPJ.status} 
                      onValueChange={(v) => setFormDataPJ({...formDataPJ, status: v as 'active' | 'inactive'})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewClientOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateClient}>
                Cadastrar Cliente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* KPI Dashboard */}
      <ClientsDashboard clients={clients} />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, operador ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={(v) => setFilterType(v as ClientType | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PF">Pessoa Física</SelectItem>
              <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as 'active' | 'inactive' | 'all')}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="aviation-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Nome/Operador</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    client.type === 'PF' ? "bg-info/10" : "bg-primary/10"
                  )}>
                    {client.type === 'PF' ? (
                      <User className="w-4 h-4 text-info" />
                    ) : (
                      <Building2 className="w-4 h-4 text-primary" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">
                      {client.type === 'PF' 
                        ? (client as ClientPF).fullName 
                        : (client as ClientPJ).operator}
                    </p>
                    {client.type === 'PJ' && (
                      <p className="text-xs text-muted-foreground">
                        {(client as ClientPJ).contactPerson}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {client.type === 'PF' 
                    ? (client as ClientPF).cpf 
                    : (client as ClientPJ).cnpj}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      {client.type === 'PF' 
                        ? (client as ClientPF).email 
                        : (client as ClientPJ).commercialEmail}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      {client.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                    client.status === 'active' 
                      ? "bg-success/15 text-success border-success/30"
                      : "bg-muted text-muted-foreground border-muted-foreground/30"
                  )}>
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(client)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteClick(client)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum cliente encontrado</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Editar Cliente
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {editClientType === 'PF' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-fullName">Nome Completo *</Label>
                  <Input
                    id="edit-fullName"
                    placeholder="João Pedro Martins"
                    value={editFormDataPF.fullName}
                    onChange={(e) => setEditFormDataPF({...editFormDataPF, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cpf">CPF *</Label>
                  <Input
                    id="edit-cpf"
                    placeholder="000.000.000-00"
                    value={editFormDataPF.cpf}
                    onChange={(e) => setEditFormDataPF({...editFormDataPF, cpf: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-emailPF">E-mail *</Label>
                  <Input
                    id="edit-emailPF"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={editFormDataPF.email}
                    onChange={(e) => setEditFormDataPF({...editFormDataPF, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phonePF">Telefone *</Label>
                  <Input
                    id="edit-phonePF"
                    placeholder="(11) 99999-9999"
                    value={editFormDataPF.phone}
                    onChange={(e) => setEditFormDataPF({...editFormDataPF, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-observationsPF">Observações</Label>
                  <Textarea
                    id="edit-observationsPF"
                    placeholder="Observações sobre o cliente..."
                    value={editFormDataPF.observations}
                    onChange={(e) => setEditFormDataPF({...editFormDataPF, observations: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select 
                    value={editFormDataPF.status} 
                    onValueChange={(v) => setEditFormDataPF({...editFormDataPF, status: v as 'active' | 'inactive'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-operator">Operador *</Label>
                  <Input
                    id="edit-operator"
                    placeholder="Nome da Empresa"
                    value={editFormDataPJ.operator}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, operator: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cnpj">CNPJ *</Label>
                  <Input
                    id="edit-cnpj"
                    placeholder="00.000.000/0001-00"
                    value={editFormDataPJ.cnpj}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, cnpj: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-commercialEmail">E-mail Comercial *</Label>
                  <Input
                    id="edit-commercialEmail"
                    type="email"
                    placeholder="comercial@empresa.com"
                    value={editFormDataPJ.commercialEmail}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, commercialEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phonePJ">Telefone *</Label>
                  <Input
                    id="edit-phonePJ"
                    placeholder="(11) 3000-0000"
                    value={editFormDataPJ.phone}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contactPerson">Contato Responsável *</Label>
                  <Input
                    id="edit-contactPerson"
                    placeholder="Nome do responsável"
                    value={editFormDataPJ.contactPerson}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, contactPerson: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-observationsPJ">Observações</Label>
                  <Textarea
                    id="edit-observationsPJ"
                    placeholder="Observações sobre o cliente..."
                    value={editFormDataPJ.observations}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, observations: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select 
                    value={editFormDataPJ.status} 
                    onValueChange={(v) => setEditFormDataPJ({...editFormDataPJ, status: v as 'active' | 'inactive'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateClient}>
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <span className="font-bold">{selectedClient && getClientName(selectedClient)}</span>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
