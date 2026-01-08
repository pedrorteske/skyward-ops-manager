import { Users, User, Building2 } from 'lucide-react';
import { ClientKPICard } from './ClientKPICard';
import { Client } from '@/types/aviation';

interface ClientsDashboardProps {
  clients: Client[];
}

export function ClientsDashboard({ clients }: ClientsDashboardProps) {
  // Only count active clients
  const activeClients = clients.filter(client => client.status === 'active');
  
  const totalClients = activeClients.length;
  const pfClients = activeClients.filter(client => client.type === 'PF').length;
  const pjClients = activeClients.filter(client => client.type === 'PJ').length;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-10">
        <ClientKPICard
          title="Total de Clientes"
          value={totalClients}
          icon={Users}
          variant="default"
          subtitle="Ativos"
        />
        <ClientKPICard
          title="Pessoa Física"
          value={pfClients}
          icon={User}
          variant="info"
          subtitle="PF"
        />
        <ClientKPICard
          title="Pessoa Jurídica"
          value={pjClients}
          icon={Building2}
          variant="primary"
          subtitle="PJ"
        />
      </div>
    </div>
  );
}
