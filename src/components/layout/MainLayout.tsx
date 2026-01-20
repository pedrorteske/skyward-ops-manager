import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Home, 
  LayoutDashboard, 
  Plane, 
  Users, 
  Wallet,
  FileText,
  Settings, 
  Menu,
  LogOut,
  Globe,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard Analítico', icon: LayoutDashboard },
  { href: '/flights', label: 'Portal dos Voos', icon: Plane },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/financial', label: 'Financeiro', icon: Wallet },
  { href: '/gendec', label: 'General Declaration', icon: FileText },
  { href: '/public-portal', label: 'Portal Público', icon: Globe },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setIsSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </>
  );

  // Format times
  const localTime = format(currentTime, 'HH:mm:ss', { locale: ptBR });
  const utcTime = format(new Date(currentTime.toUTCString().slice(0, -4)), 'HH:mm:ss');

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Plane className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold">AeroOps</span>
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4">
                  <nav className="space-y-1">
                    <NavLinks />
                  </nav>
                </ScrollArea>
                <div className="p-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold">AeroOps</span>
          <div className="w-10" />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 border-r bg-card flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">AeroOps</span>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-1">
            <NavLinks />
          </nav>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="mb-3 px-3">
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Clock Display - Fixed on top right */}
      <div className="fixed top-4 right-4 z-50 hidden lg:flex items-center gap-4 bg-card/95 backdrop-blur border rounded-lg px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Local</p>
            <p className="font-mono text-sm font-semibold">{localTime}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-right">
          <p className="text-xs text-muted-foreground">UTC</p>
          <p className="font-mono text-sm font-semibold">{utcTime}</p>
        </div>
      </div>
    </div>
  );
}