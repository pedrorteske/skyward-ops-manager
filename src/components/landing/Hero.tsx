import { Link } from 'react-router-dom';
import { Plane, ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Plane className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Plataforma SaaS para Aviação</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Gestão Completa de{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Operações Aéreas
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Simplifique a gestão do seu FBO, hangar ou operadora de aviação executiva. 
            Portal de voos, cotações, financeiro e muito mais em uma única plataforma.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              asChild 
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
            >
              <Link to="/auth?tab=signup">
                Iniciar Teste Grátis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="w-full sm:w-auto"
            >
              <Link to="/auth">
                Entrar na Plataforma
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border">
              <Shield className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-foreground">Dados Seguros</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border">
              <Zap className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium text-foreground">Setup Imediato</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border">
              <BarChart3 className="w-5 h-5 text-info" />
              <span className="text-sm font-medium text-foreground">Analytics Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
