import { useMemo } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useClients } from '@/contexts/ClientsContext';
import { FinancialKPICard } from './FinancialKPICard';
import { RevenueLineChart } from './RevenueLineChart';
import { ClientRankingTable } from './ClientRankingTable';
import { 
  DollarSign, 
  Clock, 
  CheckCircle,
} from 'lucide-react';
import { ClientPF, ClientPJ, ClientINT } from '@/types/aviation';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function FinancialDashboard() {
  const { documents } = useFinancial();
  const { clients } = useClients();

  const getClientName = (clientId: string, clientName?: string) => {
    if (clientName) return clientName;
    const client = clients.find(c => c.id === clientId);
    if (!client) return clientId || 'Cliente';
    if (client.type === 'PF') return (client as ClientPF).fullName;
    if (client.type === 'PJ') return (client as ClientPJ).operator;
    return (client as ClientINT).operator;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calculate KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const currentMonthDocs = documents.filter(d => {
      const date = parseISO(d.createdAt);
      return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd });
    });

    const lastMonthDocs = documents.filter(d => {
      const date = parseISO(d.createdAt);
      return isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd });
    });

    // Total Revenue (all time)
    const totalRevenue = documents
      .filter(d => d.status === 'paid')
      .reduce((acc, d) => acc + d.total, 0);

    // Current month revenue
    const currentMonthRevenue = currentMonthDocs
      .filter(d => d.status === 'paid')
      .reduce((acc, d) => acc + d.total, 0);

    // Last month revenue
    const lastMonthRevenue = lastMonthDocs
      .filter(d => d.status === 'paid')
      .reduce((acc, d) => acc + d.total, 0);

    // Revenue trend
    const revenueTrend = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;

    // Pending Amount
    const pendingAmount = documents
      .filter(d => d.status === 'sent' || d.status === 'approved')
      .reduce((acc, d) => acc + d.total, 0);

    // Invoices
    const totalInvoices = documents.filter(d => d.type === 'invoice').length;
    const paidInvoices = documents.filter(d => d.type === 'invoice' && d.status === 'paid').length;

    return {
      totalRevenue,
      currentMonthRevenue,
      revenueTrend,
      pendingAmount,
      totalInvoices,
      paidInvoices,
    };
  }, [documents]);

  // Monthly Revenue Data (last 6 months)
  const revenueData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthRevenue = documents
        .filter(d => {
          const date = parseISO(d.createdAt);
          return d.status === 'paid' && isWithinInterval(date, { start: monthStart, end: monthEnd });
        })
        .reduce((acc, d) => acc + d.total, 0);

      // Previous year same month
      const prevYearDate = subMonths(monthDate, 12);
      const prevYearStart = startOfMonth(prevYearDate);
      const prevYearEnd = endOfMonth(prevYearDate);
      
      const prevYearRevenue = documents
        .filter(d => {
          const date = parseISO(d.createdAt);
          return d.status === 'paid' && isWithinInterval(date, { start: prevYearStart, end: prevYearEnd });
        })
        .reduce((acc, d) => acc + d.total, 0);

      months.push({
        period: format(monthDate, 'MMM', { locale: ptBR }),
        revenue: monthRevenue,
        previousRevenue: prevYearRevenue,
      });
    }

    return months;
  }, [documents]);

  // Client Ranking Data
  const clientRankingData = useMemo(() => {
    const clientRevenue: Record<string, { revenue: number; count: number; name: string }> = {};

    documents
      .filter(d => d.status === 'paid')
      .forEach(doc => {
        const key = doc.clientId || doc.clientName || 'unknown';
        const name = getClientName(doc.clientId, doc.clientName);
        
        if (!clientRevenue[key]) {
          clientRevenue[key] = { revenue: 0, count: 0, name };
        }
        clientRevenue[key].revenue += doc.total;
        clientRevenue[key].count += 1;
      });

    return Object.values(clientRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((client, index) => ({
        position: index + 1,
        clientName: client.name,
        totalRevenue: client.revenue,
        documentCount: client.count,
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable' as 'up' | 'down' | 'stable',
      }));
  }, [documents, clients]);

  return (
    <div className="space-y-6">
      {/* KPI Cards - Removed Total de Cotações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinancialKPICard
          title="Receita Total"
          value={formatCurrency(kpis.totalRevenue)}
          subtitle="Todos os pagamentos recebidos"
          icon={DollarSign}
          variant="success"
          trend={kpis.revenueTrend !== 0 ? {
            value: Math.abs(Math.round(kpis.revenueTrend)),
            isPositive: kpis.revenueTrend > 0,
          } : undefined}
        />
        <FinancialKPICard
          title="Valores Pendentes"
          value={formatCurrency(kpis.pendingAmount)}
          subtitle="Aguardando pagamento"
          icon={Clock}
          variant="warning"
        />
        <FinancialKPICard
          title="Invoices Emitidas"
          value={kpis.totalInvoices.toString()}
          subtitle={`${kpis.paidInvoices} pagas`}
          icon={CheckCircle}
          variant="info"
        />
      </div>

      {/* Revenue Chart - Full Width */}
      <div className="w-full">
        <RevenueLineChart data={revenueData} title="Receita Mensal (Últimos 6 Meses)" />
      </div>

      {/* Client Ranking - Full Width - Renamed */}
      <div className="w-full">
        <ClientRankingTable data={clientRankingData} title="Classificação de Cliente por Faturamento" />
      </div>
    </div>
  );
}