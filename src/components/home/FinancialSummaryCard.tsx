import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowRight, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FinancialDocument } from '@/types/financial';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { useMemo } from 'react';

interface FinancialSummaryCardProps {
  documents: FinancialDocument[];
}

export function FinancialSummaryCard({ documents }: FinancialSummaryCardProps) {
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const thisMonthDocs = documents.filter((doc) => {
      const docDate = parseISO(doc.createdAt);
      return isWithinInterval(docDate, { start: monthStart, end: monthEnd });
    });

    const invoices = thisMonthDocs.filter(
      (doc) => doc.type === 'invoice' || doc.type === 'proforma'
    );

    const totalRevenue = invoices.reduce((sum, doc) => sum + doc.total, 0);
    const paidAmount = invoices
      .filter((doc) => doc.status === 'paid')
      .reduce((sum, doc) => sum + doc.total, 0);
    const pendingAmount = invoices
      .filter((doc) => doc.status === 'created' || doc.status === 'sent' || doc.status === 'approved')
      .reduce((sum, doc) => sum + doc.total, 0);

    const paidPercentage = totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      paidAmount,
      pendingAmount,
      paidPercentage,
    };
  }, [documents]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Resumo Financeiro
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/financial" className="text-primary">
              Detalhes <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Este mês</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Revenue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Receita Total</span>
            </div>
            <span className="text-lg font-bold">
              {formatCurrency(monthlyStats.totalRevenue)}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={monthlyStats.paidPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {monthlyStats.paidPercentage.toFixed(0)}% recebido
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-700">Recebido</span>
            </div>
            <p className="text-sm font-semibold text-green-700">
              {formatCurrency(monthlyStats.paidAmount)}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-xs text-amber-700">Pendente</span>
            </div>
            <p className="text-sm font-semibold text-amber-700">
              {formatCurrency(monthlyStats.pendingAmount)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
