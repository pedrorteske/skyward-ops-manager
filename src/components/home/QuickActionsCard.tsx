import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plane, 
  FileText, 
  Users, 
  LayoutDashboard,
  Wallet,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const quickActions = [
  {
    label: 'Novo Voo',
    icon: Plane,
    href: '/flights',
    variant: 'default' as const,
  },
  {
    label: 'Nova Cotação',
    icon: FileText,
    href: '/quotations',
    variant: 'default' as const,
  },
  {
    label: 'Novo Cliente',
    icon: Users,
    href: '/clients',
    variant: 'default' as const,
  },
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    variant: 'outline' as const,
  },
  {
    label: 'Financeiro',
    icon: Wallet,
    href: '/financial',
    variant: 'outline' as const,
  },
];

export function QuickActionsCard() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="w-full justify-start"
            asChild
          >
            <Link to={action.href}>
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
