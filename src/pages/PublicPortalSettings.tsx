import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { usePortalSettings } from '@/hooks/usePortalSettings';
import { COLUMN_OPTIONS } from '@/types/portal';
import { 
  Globe, 
  Link2, 
  Copy, 
  ExternalLink, 
  Lock, 
  Eye, 
  RefreshCw,
  Code,
  Building2,
  Image
} from 'lucide-react';

export default function PublicPortalSettings() {
  const { settings, isLoading, saveSettings, generateToken } = usePortalSettings();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Local form state
  const [enabled, setEnabled] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['aircraft', 'route', 'status']);
  const [dateFiltersEnabled, setDateFiltersEnabled] = useState(true);
  const [accessType, setAccessType] = useState<'public' | 'protected'>('public');
  const [accessToken, setAccessToken] = useState('');

  // Initialize form with settings
  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setDisplayName(settings.displayName || '');
      setLogoUrl(settings.logoUrl || '');
      setVisibleColumns(settings.visibleColumns || ['aircraft', 'route', 'status']);
      setDateFiltersEnabled(settings.dateFiltersEnabled);
      setAccessType(settings.accessType);
      setAccessToken(settings.accessToken || '');
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    await saveSettings({
      enabled,
      displayName: displayName || null,
      logoUrl: logoUrl || null,
      visibleColumns,
      dateFiltersEnabled,
      accessType,
      accessToken: accessType === 'protected' ? accessToken : null,
    });
    setIsSaving(false);
  };

  const handleGenerateToken = () => {
    const newToken = generateToken();
    setAccessToken(newToken);
  };

  const handleToggleColumn = (column: string) => {
    setVisibleColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const publicUrl = settings?.publicSlug
    ? `${window.location.origin}/portal/${settings.publicSlug}`
    : null;

  const iframeCode = publicUrl
    ? `<iframe src="${publicUrl}" width="100%" height="600" frameborder="0" style="border-radius: 8px;"></iframe>`
    : '';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: `${label} copiado para a área de transferência.`,
    });
  };

  if (isLoading) {
  return (
    <MainLayout>
      <PageHeader 
        title="Portal Público de Voos" 
        description="Configure a página pública de visualização de voos"
      />
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader 
        title="Portal Público de Voos" 
        description="Configure a página pública de visualização de voos"
      />

      <div className="space-y-6">
        {/* Status e Ativação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Status do Portal
            </CardTitle>
            <CardDescription>
              Ative ou desative o portal público de voos da sua empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="portal-enabled" className="text-base">Portal Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativo, o portal estará acessível publicamente
                </p>
              </div>
              <Switch
                id="portal-enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Informações da Empresa
            </CardTitle>
            <CardDescription>
              Personalize como sua empresa será exibida no portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Nome de Exibição</Label>
              <Input
                id="display-name"
                placeholder="Nome da empresa para exibir no portal"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-url" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                URL do Logotipo
              </Label>
              <Input
                id="logo-url"
                placeholder="https://exemplo.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Insira a URL de uma imagem para o logotipo da empresa
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Colunas Visíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Colunas Visíveis
            </CardTitle>
            <CardDescription>
              Selecione quais informações serão exibidas no portal público
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {COLUMN_OPTIONS.map((column) => (
                <div key={column.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`col-${column.value}`}
                    checked={visibleColumns.includes(column.value)}
                    onCheckedChange={() => handleToggleColumn(column.value)}
                  />
                  <Label htmlFor={`col-${column.value}`} className="cursor-pointer">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Opções de Filtro</CardTitle>
            <CardDescription>
              Configure os filtros disponíveis para os visitantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="date-filters" className="text-base">Filtro por Data</Label>
                <p className="text-sm text-muted-foreground">
                  Permitir que visitantes filtrem voos por data
                </p>
              </div>
              <Switch
                id="date-filters"
                checked={dateFiltersEnabled}
                onCheckedChange={setDateFiltersEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Controle de Acesso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Controle de Acesso
            </CardTitle>
            <CardDescription>
              Defina como o portal pode ser acessado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={accessType}
              onValueChange={(value) => setAccessType(value as 'public' | 'protected')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="access-public" />
                <Label htmlFor="access-public" className="cursor-pointer">
                  <span className="font-medium">Público</span>
                  <p className="text-sm text-muted-foreground">Qualquer pessoa com o link pode acessar</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="protected" id="access-protected" />
                <Label htmlFor="access-protected" className="cursor-pointer">
                  <span className="font-medium">Protegido por Token</span>
                  <p className="text-sm text-muted-foreground">Requer um token de acesso para visualizar</p>
                </Label>
              </div>
            </RadioGroup>

            {accessType === 'protected' && (
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="access-token">Token de Acesso</Label>
                <div className="flex gap-2">
                  <Input
                    id="access-token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Token de acesso"
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    onClick={handleGenerateToken}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gerar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Compartilhe este token com quem deve ter acesso ao portal
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Links e Integração */}
        {settings?.publicSlug && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                Links e Integração
              </CardTitle>
              <CardDescription>
                Use estes links para acessar ou incorporar o portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Link Público</Label>
                <div className="flex gap-2">
                  <Input
                    value={publicUrl || ''}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(publicUrl!, 'Link')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                  >
                    <a href={publicUrl!} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Código iFrame
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={iframeCode}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(iframeCode, 'Código iFrame')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Cole este código no HTML do seu site para incorporar o portal
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
