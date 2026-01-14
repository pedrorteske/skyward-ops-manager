import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    description: 'Ideal para pequenas operações',
    price: 'R$ 197',
    period: '/mês',
    features: [
      '1 usuário',
      'Até 50 voos/mês',
      'Portal de voos completo',
      'Gestão de clientes',
      'Cotações em PDF',
      'Suporte por email',
    ],
    cta: 'Começar Agora',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Para operações em crescimento',
    price: 'R$ 497',
    period: '/mês',
    features: [
      'Até 5 usuários',
      'Até 200 voos/mês',
      'Todas as funcionalidades Starter',
      'Dashboard analítico completo',
      'Financeiro integrado',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
    cta: 'Começar Agora',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'Para grandes operações',
    price: 'Sob consulta',
    period: '',
    features: [
      'Usuários ilimitados',
      'Voos ilimitados',
      'Todas as funcionalidades Professional',
      'API para integrações',
      'SLA garantido',
      'Treinamento dedicado',
      'Suporte 24/7',
      'Customizações',
    ],
    cta: 'Falar com Vendas',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Planos que cabem no seu{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              orçamento
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha o plano ideal para o tamanho da sua operação. 
            Todos incluem 14 dias de teste grátis.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={cn(
                "relative flex flex-col p-8 rounded-2xl border transition-all duration-300",
                plan.popular 
                  ? "bg-gradient-to-b from-primary/5 to-accent/5 border-primary shadow-xl scale-105" 
                  : "bg-card border-border hover:border-primary/50 hover:shadow-lg"
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-medium">
                    <Sparkles className="w-3 h-3" />
                    Mais Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button 
                asChild
                className={cn(
                  "w-full",
                  plan.popular 
                    ? "bg-gradient-to-r from-primary to-accent hover:opacity-90" 
                    : ""
                )}
                variant={plan.popular ? "default" : "outline"}
              >
                <Link to="/auth?tab=signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          Todos os planos incluem criptografia de dados, backups automáticos e suporte técnico.
        </p>
      </div>
    </section>
  );
}
