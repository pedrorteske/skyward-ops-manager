import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Quotation, quotationStatusLabels } from '@/types/aviation';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RecentQuotationsCardProps {
  quotations: Quotation[];
}

const statusColors = {
  created: 'bg-slate-100 text-slate-700 border-slate-200',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

export function RecentQuotationsCard({ quotations }: RecentQuotationsCardProps) {
  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatCurrency = (value: number, currency: 'BRL' | 'USD') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Cotações Recentes
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/quotations" className="text-primary">
              Ver todas <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentQuotations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma cotação encontrada
          </p>
        ) : (
          recentQuotations.map((quotation) => {
            const daysUntilExpiry = differenceInDays(
              parseISO(quotation.validUntil),
              new Date()
            );
            const isExpiringSoon = daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
            const isExpired = daysUntilExpiry < 0;

            return (
              <div
                key={quotation.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {quotation.number}
                    </p>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', statusColors[quotation.status])}
                    >
                      {quotationStatusLabels[quotation.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(quotation.total, quotation.currency)}
                    </p>
                    {!isExpired && (
                      <span className={cn(
                        'text-xs',
                        isExpiringSoon ? 'text-amber-600' : 'text-muted-foreground'
                      )}>
                        • Validade: {daysUntilExpiry}d
                      </span>
                    )}
                    {isExpired && (
                      <span className="text-xs text-red-600">• Expirada</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
