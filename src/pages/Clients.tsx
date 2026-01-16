import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useClients } from '@/contexts/ClientsContext';
import { Client, ClientPF, ClientPJ, ClientINT, ClientType } from '@/types/aviation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, User, Building2, Globe, Pencil } from 'lucide-react';
import { ClientExpandableRow } from '@/components/clients/ClientExpandableRow';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ClientsDashboard } from '@/components/clients/ClientsDashboard';
import { PhoneInput } from '@/components/ui/phone-input';
import { CountrySelect } from '@/components/ui/country-select';

export default function Clients() {
  const { clients, isLoading, addClient, updateClient, deleteClient } = useClients();
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
    address: '',
    observations: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [formDataPJ, setFormDataPJ] = useState({
    operator: '',
    cnpj: '',
    commercialEmail: '',
    phone: '',
    contactPerson: '',
    address: '',
    observations: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [formDataINT, setFormDataINT] = useState({
    operator: '',
    country: '',
    email: '',
    phone: '',
    address: '',
    observations: '',
    status: 'active' as 'active' | 'inactive',
  });

  const [editFormDataPF, setEditFormDataPF] = useState({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    address: '',
    observations: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [editFormDataPJ, setEditFormDataPJ] = useState({
    operator: '',
    cnpj: '',
    commercialEmail: '',
    phone: '',
    contactPerson: '',
    address: '',
    observations: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [editFormDataINT, setEditFormDataINT] = useState({
    operator: '',
    country: '',
    email: '',
    phone: '',
    address: '',
    observations: '',
    status: 'active' as 'active' | 'inactive',
  });

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    let matchesSearch = false;
    
    if (client.type === 'PF') {
      matchesSearch = (client as ClientPF).fullName.toLowerCase().includes(searchLower) ||
        (client as ClientPF).email.toLowerCase().includes(searchLower);
    } else if (client.type === 'PJ') {
      matchesSearch = (client as ClientPJ).operator.toLowerCase().includes(searchLower) ||
        (client as ClientPJ).commercialEmail.toLowerCase().includes(searchLower);
    } else if (client.type === 'INT') {
      matchesSearch = (client as ClientINT).operator.toLowerCase().includes(searchLower) ||
        (client as ClientINT).email.toLowerCase().includes(searchLower) ||
        (client as ClientINT).country.toLowerCase().includes(searchLower);
    }
    
    const matchesType = filterType === 'all' || client.type === filterType;
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateClient = async () => {
    if (clientType === 'PF') {
      await addClient({
        type: 'PF',
        ...formDataPF,
      } as Omit<ClientPF, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>);
    } else if (clientType === 'PJ') {
      await addClient({
        type: 'PJ',
        ...formDataPJ,
      } as Omit<ClientPJ, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>);
    } else {
      await addClient({
        type: 'INT',
        ...formDataINT,
      } as Omit<ClientINT, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>);
    }
    
    setIsNewClientOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormDataPF({
      fullName: '',
      cpf: '',
      email: '',
      phone: '',
      address: '',
      observations: '',
      status: 'active',
    });
    setFormDataPJ({
      operator: '',
      cnpj: '',
      commercialEmail: '',
      phone: '',
      contactPerson: '',
      address: '',
      observations: '',
      status: 'active',
    });
    setFormDataINT({
      operator: '',
      country: '',
      email: '',
      phone: '',
      address: '',
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
        address: pfClient.address || '',
        observations: pfClient.observations || '',
        status: pfClient.status,
      });
    } else if (client.type === 'PJ') {
      const pjClient = client as ClientPJ;
      setEditFormDataPJ({
        operator: pjClient.operator,
        cnpj: pjClient.cnpj,
        commercialEmail: pjClient.commercialEmail,
        phone: pjClient.phone,
        contactPerson: pjClient.contactPerson,
        address: pjClient.address || '',
        observations: pjClient.observations || '',
        status: pjClient.status,
      });
    } else {
      const intClient = client as ClientINT;
      setEditFormDataINT({
        operator: intClient.operator,
        country: intClient.country,
        email: intClient.email,
        phone: intClient.phone,
        address: intClient.address || '',
        observations: intClient.observations || '',
        status: intClient.status,
      });
    }
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    if (editClientType === 'PF') {
      await updateClient(selectedClient.id, {
        type: 'PF',
        ...editFormDataPF,
      } as Omit<ClientPF, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>);
    } else if (editClientType === 'PJ') {
      await updateClient(selectedClient.id, {
        type: 'PJ',
        ...editFormDataPJ,
      } as Omit<ClientPJ, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>);
    } else {
      await updateClient(selectedClient.id, {
        type: 'INT',
        ...editFormDataINT,
      } as Omit<ClientINT, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>);
    }

    setIsEditDialogOpen(false);
    setSelectedClient(null);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClient = async () => {
    if (selectedClient) {
      await deleteClient(selectedClient.id);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    }
  };

  const getClientName = (client: Client) => {
    if (client.type === 'PF') return (client as ClientPF).fullName;
    if (client.type === 'PJ') return (client as ClientPJ).operator;
    return (client as ClientINT).operator;
  };

  const getClientEmail = (client: Client) => {
    if (client.type === 'PF') return (client as ClientPF).email;
    if (client.type === 'PJ') return (client as ClientPJ).commercialEmail;
    return (client as ClientINT).email;
  };

  const getClientDocument = (client: Client) => {
    if (client.type === 'PF') return (client as ClientPF).cpf;
    if (client.type === 'PJ') return (client as ClientPJ).cnpj;
    return (client as ClientINT).country;
  };

  const getClientTypeIcon = (type: ClientType) => {
    if (type === 'PF') return <User className="w-4 h-4 text-info" />;
    if (type === 'PJ') return <Building2 className="w-4 h-4 text-primary" />;
    return <Globe className="w-4 h-4 text-success" />;
  };

  const getClientTypeColor = (type: ClientType) => {
    if (type === 'PF') return "bg-info/10";
    if (type === 'PJ') return "bg-primary/10";
    return "bg-success/10";
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Clientes" 
        description="Gerencie seus clientes PF, PJ e Internacionais"
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
                    <SelectItem value="INT">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Internacional (INT)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {clientType === 'PF' && (
                <>
                  <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    value={formDataPF.fullName}
                    onChange={(e) => setFormDataPF({...formDataPF, fullName: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formDataPF.cpf}
                    onChange={(e) => setFormDataPF({...formDataPF, cpf: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="emailPF">E-mail *</Label>
                  <Input
                    id="emailPF"
                    type="email"
                    value={formDataPF.email}
                    onChange={(e) => setFormDataPF({...formDataPF, email: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="phonePF">Telefone *</Label>
                  <PhoneInput
                    id="phonePF"
                    value={formDataPF.phone}
                    onChange={(value) => setFormDataPF({...formDataPF, phone: value})}
                    defaultCountry="BR"
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="addressPF">Endereço</Label>
                  <Input
                    id="addressPF"
                    placeholder="Rua, número, bairro, cidade..."
                    value={formDataPF.address}
                    onChange={(e) => setFormDataPF({...formDataPF, address: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="observationsPF">Observações</Label>
                  <Textarea
                    id="observationsPF"
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
              )}

              {clientType === 'PJ' && (
                <>
                  <div className="space-y-2">
                  <Label htmlFor="operator">Operador *</Label>
                  <Input
                    id="operator"
                    value={formDataPJ.operator}
                    onChange={(e) => setFormDataPJ({...formDataPJ, operator: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formDataPJ.cnpj}
                    onChange={(e) => setFormDataPJ({...formDataPJ, cnpj: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="commercialEmail">E-mail Comercial *</Label>
                  <Input
                    id="commercialEmail"
                    type="email"
                    value={formDataPJ.commercialEmail}
                    onChange={(e) => setFormDataPJ({...formDataPJ, commercialEmail: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="phonePJ">Telefone *</Label>
                  <PhoneInput
                    id="phonePJ"
                    value={formDataPJ.phone}
                    onChange={(value) => setFormDataPJ({...formDataPJ, phone: value})}
                    defaultCountry="BR"
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contato Responsável *</Label>
                  <Input
                    id="contactPerson"
                    value={formDataPJ.contactPerson}
                    onChange={(e) => setFormDataPJ({...formDataPJ, contactPerson: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="addressPJ">Endereço</Label>
                  <Input
                    id="addressPJ"
                    placeholder="Rua, número, bairro, cidade..."
                    value={formDataPJ.address}
                    onChange={(e) => setFormDataPJ({...formDataPJ, address: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="observationsPJ">Observações</Label>
                  <Textarea
                    id="observationsPJ"
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

              {clientType === 'INT' && (
                <>
                  <div className="space-y-2">
                  <Label htmlFor="operatorINT">Operador *</Label>
                  <Input
                    id="operatorINT"
                    value={formDataINT.operator}
                    onChange={(e) => setFormDataINT({...formDataINT, operator: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="country">País *</Label>
                  <CountrySelect
                    id="country"
                    value={formDataINT.country}
                    onChange={(country) => setFormDataINT({...formDataINT, country})}
                    placeholder="Selecione o país"
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="emailINT">E-mail *</Label>
                  <Input
                    id="emailINT"
                    type="email"
                    value={formDataINT.email}
                    onChange={(e) => setFormDataINT({...formDataINT, email: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="phoneINT">Telefone *</Label>
                  <PhoneInput
                    id="phoneINT"
                    value={formDataINT.phone}
                    onChange={(value) => setFormDataINT({...formDataINT, phone: value})}
                    defaultCountry="US"
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="addressINT">Endereço</Label>
                  <Input
                    id="addressINT"
                    placeholder="Street, number, city, country..."
                    value={formDataINT.address}
                    onChange={(e) => setFormDataINT({...formDataINT, address: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="observationsINT">Observações</Label>
                  <Textarea
                    id="observationsINT"
                    value={formDataINT.observations}
                    onChange={(e) => setFormDataINT({...formDataINT, observations: e.target.value})}
                  />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select 
                      value={formDataINT.status} 
                      onValueChange={(v) => setFormDataINT({...formDataINT, status: v as 'active' | 'inactive'})}
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
            placeholder="Buscar por nome, operador, e-mail ou país..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={(v) => setFilterType(v as ClientType | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PF">Pessoa Física</SelectItem>
              <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              <SelectItem value="INT">Internacional</SelectItem>
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
              <TableHead>CPF/CNPJ/País</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <ClientExpandableRow
                key={client.id}
                client={client}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
              />
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
            {editClientType === 'PF' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-fullName">Nome Completo *</Label>
                  <Input
                    id="edit-fullName"
                    value={editFormDataPF.fullName}
                    onChange={(e) => setEditFormDataPF({...editFormDataPF, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cpf">CPF *</Label>
                  <Input
                    id="edit-cpf"
                    value={editFormDataPF.cpf}
                    onChange={(e) => setEditFormDataPF({...editFormDataPF, cpf: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-emailPF">E-mail *</Label>
                  <Input
                    id="edit-emailPF"
                    type="email"
                    value={editFormDataPF.email}
                    onChange={(e) => setEditFormDataPF({...editFormDataPF, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phonePF">Telefone *</Label>
                  <PhoneInput
                    id="edit-phonePF"
                    value={editFormDataPF.phone}
                    onChange={(value) => setEditFormDataPF({...editFormDataPF, phone: value})}
                    defaultCountry="BR"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-addressPF">Endereço</Label>
                  <Input
                    id="edit-addressPF"
                    placeholder="Rua, número, bairro, cidade..."
                    value={editFormDataPF.address}
                    onChange={(e) => setEditFormDataPF({...editFormDataPF, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-observationsPF">Observações</Label>
                  <Textarea
                    id="edit-observationsPF"
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
            )}

            {editClientType === 'PJ' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-operator">Operador *</Label>
                  <Input
                    id="edit-operator"
                    value={editFormDataPJ.operator}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, operator: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cnpj">CNPJ *</Label>
                  <Input
                    id="edit-cnpj"
                    value={editFormDataPJ.cnpj}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, cnpj: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-commercialEmail">E-mail Comercial *</Label>
                  <Input
                    id="edit-commercialEmail"
                    type="email"
                    value={editFormDataPJ.commercialEmail}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, commercialEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phonePJ">Telefone *</Label>
                  <PhoneInput
                    id="edit-phonePJ"
                    value={editFormDataPJ.phone}
                    onChange={(value) => setEditFormDataPJ({...editFormDataPJ, phone: value})}
                    defaultCountry="BR"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-contactPerson">Contato Responsável *</Label>
                  <Input
                    id="edit-contactPerson"
                    value={editFormDataPJ.contactPerson}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, contactPerson: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-addressPJ">Endereço</Label>
                  <Input
                    id="edit-addressPJ"
                    placeholder="Rua, número, bairro, cidade..."
                    value={editFormDataPJ.address}
                    onChange={(e) => setEditFormDataPJ({...editFormDataPJ, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-observationsPJ">Observações</Label>
                  <Textarea
                    id="edit-observationsPJ"
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

            {editClientType === 'INT' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-operatorINT">Operador *</Label>
                  <Input
                    id="edit-operatorINT"
                    value={editFormDataINT.operator}
                    onChange={(e) => setEditFormDataINT({...editFormDataINT, operator: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-country">País *</Label>
                  <CountrySelect
                    id="edit-country"
                    value={editFormDataINT.country}
                    onChange={(country) => setEditFormDataINT({...editFormDataINT, country})}
                    placeholder="Selecione o país"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-emailINT">E-mail *</Label>
                  <Input
                    id="edit-emailINT"
                    type="email"
                    value={editFormDataINT.email}
                    onChange={(e) => setEditFormDataINT({...editFormDataINT, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phoneINT">Telefone *</Label>
                  <PhoneInput
                    id="edit-phoneINT"
                    value={editFormDataINT.phone}
                    onChange={(value) => setEditFormDataINT({...editFormDataINT, phone: value})}
                    defaultCountry="US"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-addressINT">Endereço</Label>
                  <Input
                    id="edit-addressINT"
                    placeholder="Street, number, city, country..."
                    value={editFormDataINT.address}
                    onChange={(e) => setEditFormDataINT({...editFormDataINT, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-observationsINT">Observações</Label>
                  <Textarea
                    id="edit-observationsINT"
                    value={editFormDataINT.observations}
                    onChange={(e) => setEditFormDataINT({...editFormDataINT, observations: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select 
                    value={editFormDataINT.status} 
                    onValueChange={(v) => setEditFormDataINT({...editFormDataINT, status: v as 'active' | 'inactive'})}
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