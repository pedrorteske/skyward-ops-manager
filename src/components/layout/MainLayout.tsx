import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Plane, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Building2
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/flights', label: 'Portal dos Voos', icon: Plane },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/quotations', label: 'Cotações', icon: FileText },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">AeroOps</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="hidden lg:flex items-center gap-3 px-6 h-16 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Plane className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg text-sidebar-foreground">AeroOps</span>
            <p className="text-[10px] text-sidebar-foreground/60 -mt-1">Aviation Management</p>
          </div>
        </div>

        {/* Company Info */}
        <div className="px-4 py-4 border-b border-sidebar-border mt-16 lg:mt-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent">
            <Building2 className="w-5 h-5 text-sidebar-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.companyName || 'AeroOps FBO'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.email || 'admin@aeroops.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-sm")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-semibold text-sidebar-foreground">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'Administrador'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {user?.role || 'admin'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={cn(
        "min-h-screen pt-16 lg:pt-0 lg:pl-64 transition-all duration-200"
      )}>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
