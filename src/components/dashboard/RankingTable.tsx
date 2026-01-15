import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, Plane, MapPin, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AircraftRanking {
  position: number;
  model: string;
  operations: number;
}

interface BaseRanking {
  position: number;
  icao: string;
  operations: number;
}

interface RankingTableProps {
  type: 'aircraft' | 'base';
  aircraftData?: AircraftRanking[];
  baseData?: BaseRanking[];
  onClick?: () => void;
}

export function RankingTable({ type, aircraftData, baseData, onClick }: RankingTableProps) {
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

  if (type === 'aircraft' && aircraftData) {
    return (
      <Card 
        className={cn(
          "transition-all",
          onClick && "cursor-pointer hover:shadow-lg hover:border-primary/50"
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              Top Modelos de Aeronaves
            </div>
            {onClick && <Maximize2 className="w-4 h-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead className="text-right">Operações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aircraftData.map((item) => (
                <TableRow key={item.model}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.position <= 3 ? (
                        <Trophy className={`w-4 h-4 ${getMedalColor(item.position)}`} />
                      ) : (
                        <span className="text-muted-foreground text-sm">{item.position}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    {item.model}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {item.operations}
                  </TableCell>
                </TableRow>
              ))}
              {aircraftData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Nenhum dado disponível
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  if (type === 'base' && baseData) {
    return (
      <Card 
        className={cn(
          "transition-all",
          onClick && "cursor-pointer hover:shadow-lg hover:border-primary/50"
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-info" />
              Top Bases/Aeroportos
            </div>
            {onClick && <Maximize2 className="w-4 h-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>ICAO</TableHead>
                <TableHead className="text-right">Operações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {baseData.map((item) => (
                <TableRow key={item.icao}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {item.position <= 3 ? (
                        <Trophy className={`w-4 h-4 ${getMedalColor(item.position)}`} />
                      ) : (
                        <span className="text-muted-foreground text-sm">{item.position}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-info">
                    {item.icao}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {item.operations}
                  </TableCell>
                </TableRow>
              ))}
              {baseData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Nenhum dado disponível
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  return null;
}
