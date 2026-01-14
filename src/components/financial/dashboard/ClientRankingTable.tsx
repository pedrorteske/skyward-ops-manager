import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientRanking {
  position: number;
  clientName: string;
  totalRevenue: number;
  documentCount: number;
  trend?: 'up' | 'down' | 'stable';
}

interface ClientRankingTableProps {
  data: ClientRanking[];
  title?: string;
}

export function ClientRankingTable({ data, title = "Ranking de Clientes por Faturamento" }: ClientRankingTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Rank</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Documentos</TableHead>
              <TableHead className="text-right">Faturamento</TableHead>
              <TableHead className="w-[60px] text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum dado disponível
                </TableCell>
              </TableRow>
            ) : (
              data.slice(0, 10).map((client) => (
                <TableRow key={client.position}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {client.position <= 3 ? (
                        <Medal className={cn('w-5 h-5', getMedalColor(client.position))} />
                      ) : (
                        <span className="w-5 text-center font-medium text-muted-foreground">
                          {client.position}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{client.clientName}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {client.documentCount}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(client.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getTrendIcon(client.trend)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
