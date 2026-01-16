import { Users, User, Building2, Globe } from 'lucide-react';
import { CircularOutlineKPI } from '@/components/dashboard/CircularOutlineKPI';
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
  const intClients = activeClients.filter(client => client.type === 'INT').length;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-10">
        <CircularOutlineKPI
          title="Total de Clientes"
          value={totalClients}
          icon={Users}
          variant="default"
          description="Ativos"
        />
        <CircularOutlineKPI
          title="Pessoa Física"
          value={pfClients}
          icon={User}
          variant="info"
          description="PF"
        />
        <CircularOutlineKPI
          title="Pessoa Jurídica"
          value={pjClients}
          icon={Building2}
          variant="primary"
          description="PJ"
        />
        <CircularOutlineKPI
          title="Internacional"
          value={intClients}
          icon={Globe}
          variant="success"
          description="INT"
        />
      </div>
    </div>
  );
}
