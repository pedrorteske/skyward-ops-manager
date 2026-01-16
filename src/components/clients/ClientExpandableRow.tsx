import { useState } from 'react';
import { Client, ClientPF, ClientPJ, ClientINT, ClientType } from '@/types/aviation';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronUp, Mail, Phone, User, Building2, Globe, MoreHorizontal, Pencil, Trash2, MapPin, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ClientExpandableRowProps {
  client: Client;
  onEditClick: (client: Client) => void;
  onDeleteClick: (client: Client) => void;
}

export function ClientExpandableRow({ client, onEditClick, onDeleteClick }: ClientExpandableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getClientAddress = (client: Client) => {
    if (client.type === 'PF') return (client as ClientPF).address;
    if (client.type === 'PJ') return (client as ClientPJ).address;
    return (client as ClientINT).address;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} asChild>
      <>
        <TableRow className={cn(isExpanded && "border-b-0")}>
          <TableCell>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              getClientTypeColor(client.type)
            )}>
              {getClientTypeIcon(client.type)}
            </div>
          </TableCell>
          <TableCell>
            <div>
              <p className="font-medium">{getClientName(client)}</p>
              {client.type === 'PJ' && (
                <p className="text-xs text-muted-foreground">
                  {(client as ClientPJ).contactPerson}
                </p>
              )}
              {client.type === 'INT' && (
                <p className="text-xs text-muted-foreground">
                  {(client as ClientINT).country}
                </p>
              )}
            </div>
          </TableCell>
          <TableCell className="font-mono text-sm">
            {getClientDocument(client)}
          </TableCell>
          <TableCell>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-sm">
                <Mail className="w-3 h-3 text-muted-foreground" />
                {getClientEmail(client)}
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
            <div className="flex items-center gap-1">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditClick(client)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDeleteClick(client)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableCell colSpan={6} className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
                {/* Endereço */}
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Endereço</p>
                    <p className="text-sm">{getClientAddress(client) || 'Não informado'}</p>
                  </div>
                </div>

                {/* Observações */}
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Observações</p>
                    <p className="text-sm">{client.observations || 'Sem observações'}</p>
                  </div>
                </div>

                {/* Data de Cadastro */}
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">Cadastrado em</p>
                    <p className="text-sm">{formatDate(client.createdAt)}</p>
                  </div>
                </div>

                {/* Tipo específico de cliente */}
                {client.type === 'PJ' && (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Contato Responsável</p>
                      <p className="text-sm">{(client as ClientPJ).contactPerson}</p>
                    </div>
                  </div>
                )}

                {client.type === 'INT' && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">País</p>
                      <p className="text-sm">{(client as ClientINT).country}</p>
                    </div>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}
