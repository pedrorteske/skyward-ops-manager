import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Building2, User, Bell, Shield, Palette } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply dark mode on mount and when toggled
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize dark mode from localStorage or default to true
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Configurações" 
        description="Gerencie as configurações da sua empresa"
      />

      <div className="grid gap-6 max-w-3xl">
        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>
              Informações básicas da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input id="companyName" defaultValue={user?.companyName || 'AeroOps FBO'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" defaultValue="00.000.000/0001-00" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue="contato@aeroops.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" defaultValue="(11) 3000-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" defaultValue="Aeroporto de Congonhas, São Paulo - SP" />
            </div>
            <Button>Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Minha Conta
            </CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Nome</Label>
                <Input id="userName" defaultValue={user?.name || 'Administrador'} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">E-mail</Label>
                <Input id="userEmail" type="email" defaultValue={user?.email || 'admin@aeroops.com'} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Perfil de Acesso</Label>
              <p className="text-sm text-muted-foreground capitalize bg-muted px-3 py-2 rounded-md">
                {user?.role || 'Administrador'}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input id="currentPassword" type="password" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input id="newPassword" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button>Atualizar Senha</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como você recebe notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificações por E-mail</p>
                <p className="text-sm text-muted-foreground">Receba atualizações sobre voos</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de Chegada</p>
                <p className="text-sm text-muted-foreground">Seja notificado quando um voo estiver chegando</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a aparência do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Modo Escuro</p>
                <p className="text-sm text-muted-foreground">Ative o tema escuro para reduzir cansaço visual</p>
              </div>
              <Switch 
                checked={isDarkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança da conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticação em Duas Etapas</p>
                <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sessões Ativas</p>
                <p className="text-sm text-muted-foreground">Gerencie dispositivos conectados</p>
              </div>
              <Button variant="outline" size="sm">Gerenciar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}