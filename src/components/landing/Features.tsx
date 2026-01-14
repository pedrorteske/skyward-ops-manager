import { 
  Plane, 
  Users, 
  FileText, 
  Wallet, 
  BarChart3, 
  Building2,
  Calendar,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: Plane,
    title: 'Portal de Voos',
    description: 'Gestão completa de operações aéreas com timeline visual, status em tempo real e controle de chegadas e partidas.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Users,
    title: 'Gestão de Clientes',
    description: 'CRM especializado para aviação executiva. Cadastro de operadores, pilotos e empresas com histórico completo.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: FileText,
    title: 'Cotações Profissionais',
    description: 'Geração automática de PDFs personalizados com sua marca. Envie cotações profissionais em segundos.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: Wallet,
    title: 'Financeiro Integrado',
    description: 'Controle de faturas, proformas e pagamentos. Acompanhe receitas e pendências em um dashboard completo.',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Analítico',
    description: 'KPIs operacionais, ranking de aeronaves, distribuição por base e gráficos em tempo real para decisões estratégicas.',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  {
    icon: Building2,
    title: 'Multi-tenant',
    description: 'Isolamento completo de dados por empresa. Cada cliente tem seu ambiente seguro e independente.',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
  {
    icon: Calendar,
    title: 'Calendário de Operações',
    description: 'Visualize todos os voos em calendário interativo. Planeje recursos e evite conflitos operacionais.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Shield,
    title: 'Segurança Avançada',
    description: 'Autenticação segura, criptografia de dados e controle de acesso por perfil de usuário.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              operar com excelência
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Uma plataforma completa desenvolvida especificamente para as necessidades 
            de FBOs, hangares e operadores de aviação executiva.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
