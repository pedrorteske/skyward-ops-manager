import { Link } from 'react-router-dom';
import { Plane, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer id="contact" className="bg-sidebar text-sidebar-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Plane className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-lg">AeroOps</span>
                <p className="text-[10px] text-sidebar-foreground/60 -mt-1">Aviation Management</p>
              </div>
            </div>
            <p className="text-sm text-sidebar-foreground/70 max-w-md mb-6">
              Plataforma completa para gestão de operações aéreas. 
              Simplifique processos, aumente a eficiência e tome decisões baseadas em dados.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-sidebar-foreground/70">
                <Mail className="w-4 h-4" />
                <span>contato@aeroops.com.br</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-sidebar-foreground/70">
                <Phone className="w-4 h-4" />
                <span>+55 (11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-sidebar-foreground/70">
                <MapPin className="w-4 h-4" />
                <span>São Paulo, SP - Brasil</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Planos e Preços
                </a>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Entrar
                </Link>
              </li>
              <li>
                <Link to="/auth?tab=signup" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Criar Conta
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors">
                  LGPD
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-sidebar-border mt-12 pt-8">
          <p className="text-center text-sm text-sidebar-foreground/50">
            © {new Date().getFullYear()} AeroOps. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
