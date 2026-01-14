import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface ConversionData {
  name: string;
  value: number;
  color: string;
}

interface ConversionRateChartProps {
  totalQuotations: number;
  approvedQuotations: number;
  paidQuotations: number;
  cancelledQuotations: number;
}

export function ConversionRateChart({
  totalQuotations,
  approvedQuotations,
  paidQuotations,
  cancelledQuotations,
}: ConversionRateChartProps) {
  const pendingQuotations = totalQuotations - approvedQuotations - paidQuotations - cancelledQuotations;
  
  const data: ConversionData[] = [
    { name: 'Convertidas (Pagas)', value: paidQuotations, color: 'hsl(var(--success))' },
    { name: 'Aprovadas', value: approvedQuotations, color: 'hsl(var(--primary))' },
    { name: 'Pendentes', value: pendingQuotations > 0 ? pendingQuotations : 0, color: 'hsl(var(--warning))' },
    { name: 'Canceladas', value: cancelledQuotations, color: 'hsl(var(--destructive))' },
  ].filter(item => item.value > 0);

  const conversionRate = totalQuotations > 0 
    ? ((paidQuotations / totalQuotations) * 100).toFixed(1) 
    : '0';

  const approvalRate = totalQuotations > 0 
    ? (((approvedQuotations + paidQuotations) / totalQuotations) * 100).toFixed(1) 
    : '0';

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Taxa de Conversão de Cotações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} cotações`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxa de Conversão</span>
                <span className="text-2xl font-bold text-success">{conversionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full transition-all" 
                  style={{ width: `${conversionRate}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxa de Aprovação</span>
                <span className="text-xl font-semibold text-primary">{approvalRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${approvalRate}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                  <span className="text-xs font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
