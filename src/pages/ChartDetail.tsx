import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useFlights } from '@/contexts/FlightsContext';
import { FlightType, flightTypeLabels } from '@/types/aviation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const flightTypeColors: Record<string, string> = {
  S: 'hsl(217, 95%, 55%)',
  N: 'hsl(199, 95%, 50%)',
  G: 'hsl(142, 90%, 42%)',
  M: 'hsl(38, 95%, 50%)',
};

const chartTitles: Record<string, string> = {
  'operations-month': 'Operações por Mês',
  'operations-base': 'Operações por Base',
  'flight-type': 'Distribuição por Tipo de Voo',
  'aircraft-ranking': 'Ranking de Modelos de Aeronaves',
};

export default function ChartDetail() {
  const { chartType } = useParams<{ chartType: string }>();
  const navigate = useNavigate();
  const { flights } = useFlights();

  // Monthly operations data
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, number>();
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = format(date, 'MMM/yy', { locale: ptBR });
      monthMap.set(key, 0);
    }

    flights.forEach((flight) => {
      const dateStr = flight.arrivalDate || flight.departureDate;
      if (!dateStr) return;

      try {
        const date = parseISO(dateStr);
        if (isNaN(date.getTime())) return;

        const key = format(date, 'MMM/yy', { locale: ptBR });
        if (monthMap.has(key)) {
          monthMap.set(key, (monthMap.get(key) || 0) + 1);
        }
      } catch {
        // Skip invalid dates
      }
    });

    return Array.from(monthMap.entries()).map(([month, operations]) => ({
      month,
      operations,
    }));
  }, [flights]);

  // Base distribution data
  const baseData = useMemo(() => {
    const baseMap = new Map<string, number>();

    flights.forEach((flight) => {
      if (flight.base) {
        baseMap.set(flight.base, (baseMap.get(flight.base) || 0) + 1);
      }
    });

    return Array.from(baseMap.entries())
      .map(([base, operations]) => ({ base, operations }))
      .sort((a, b) => b.operations - a.operations);
  }, [flights]);

  // Flight type distribution
  const flightTypeData = useMemo(() => {
    const typeMap = new Map<FlightType, number>();

    flights.forEach((flight) => {
      const type = flight.flightType;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    return Array.from(typeMap.entries()).map(([type, value]) => ({
      name: flightTypeLabels[type],
      value,
      color: flightTypeColors[type] || 'hsl(var(--muted-foreground))',
    }));
  }, [flights]);

  // Aircraft ranking data
  const aircraftData = useMemo(() => {
    const modelMap = new Map<string, number>();

    flights.forEach((flight) => {
      const model = flight.aircraftModel;
      if (model) {
        modelMap.set(model, (modelMap.get(model) || 0) + 1);
      }
    });

    return Array.from(modelMap.entries())
      .map(([model, operations]) => ({
        model,
        operations,
      }))
      .sort((a, b) => b.operations - a.operations);
  }, [flights]);

  const title = chartType ? chartTitles[chartType] || 'Gráfico' : 'Gráfico';

  const renderChart = () => {
    switch (chartType) {
      case 'operations-month':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar
                dataKey="operations"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                name="Operações"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'operations-base':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={baseData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                type="category"
                dataKey="base"
                width={70}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar
                dataKey="operations"
                fill="hsl(var(--chart-6))"
                radius={[0, 4, 4, 0]}
                name="Operações"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'flight-type':
        const RADIAN = Math.PI / 180;
        const renderCustomizedLabel = ({
          cx,
          cy,
          midAngle,
          innerRadius,
          outerRadius,
          percent,
        }: any) => {
          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
          const x = cx + radius * Math.cos(-midAngle * RADIAN);
          const y = cy + radius * Math.sin(-midAngle * RADIAN);

          if (percent < 0.05) return null;

          return (
            <text
              x={x}
              y={y}
              fill="white"
              textAnchor="middle"
              dominantBaseline="central"
              className="text-sm font-semibold"
            >
              {`${(percent * 100).toFixed(0)}%`}
            </text>
          );
        };

        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={flightTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={200}
                innerRadius={80}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {flightTypeData.map((entry, index) => (
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
              />
              <Legend
                wrapperStyle={{ fontSize: '14px' }}
                formatter={(value) => (
                  <span className="text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'aircraft-ranking':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={aircraftData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis
                type="number"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                type="category"
                dataKey="model"
                width={110}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar
                dataKey="operations"
                fill="hsl(var(--chart-2))"
                radius={[0, 4, 4, 0]}
                name="Operações"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="flex items-center justify-center h-full text-muted-foreground">Gráfico não encontrado</div>;
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          <div className="h-[600px]">
            {renderChart()}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
