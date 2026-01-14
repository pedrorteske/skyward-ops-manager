import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface PendingData {
  clientName: string;
  pendingAmount: number;
  documentCount: number;
}

interface PendingByClientChartProps {
  data: PendingData[];
  title?: string;
}

export function PendingByClientChart({ 
  data, 
  title = "Valores Pendentes por Cliente" 
}: PendingByClientChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value}`;
  };

  // Sort by pending amount descending and take top 8
  const sortedData = [...data]
    .sort((a, b) => b.pendingAmount - a.pendingAmount)
    .slice(0, 8);

  // Generate gradient colors from warning to destructive based on amount
  const maxAmount = Math.max(...sortedData.map(d => d.pendingAmount));
  const getBarColor = (amount: number) => {
    const intensity = amount / maxAmount;
    if (intensity > 0.7) return 'hsl(var(--chart-8))';
    if (intensity > 0.4) return 'hsl(var(--chart-3))';
    return 'hsl(var(--chart-6))';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-warning" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          {sortedData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Nenhum valor pendente
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={formatCurrency}
                />
                <YAxis
                  type="category"
                  dataKey="clientName"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={100}
                  tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: number, name: string, props: any) => [
                    <>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(value)}
                      <span className="text-muted-foreground text-xs ml-2">
                        ({props.payload.documentCount} docs)
                      </span>
                    </>,
                    'Pendente',
                  ]}
                  labelFormatter={(label) => `Cliente: ${label}`}
                />
                <Bar dataKey="pendingAmount" radius={[0, 4, 4, 0]} name="Valor Pendente">
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.pendingAmount)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
