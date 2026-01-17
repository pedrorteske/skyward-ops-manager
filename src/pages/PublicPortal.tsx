import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PublicFlight, PublicPortalData, STATUS_LABELS } from '@/types/portal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plane, Calendar, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type PortalState = 'loading' | 'not_found' | 'auth_required' | 'ready' | 'error';

const statusColors: Record<PublicFlight['status'], string> = {
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  arrived: 'bg-green-500/20 text-green-400 border-green-500/30',
  departed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  delayed: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function PublicPortal() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const [state, setState] = useState<PortalState>('loading');
  const [portalData, setPortalData] = useState<PublicPortalData | null>(null);
  const [flights, setFlights] = useState<PublicFlight[]>([]);
  const [token, setToken] = useState(tokenFromUrl || '');
  const [dateFilter, setDateFilter] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch portal data
  useEffect(() => {
    const fetchPortalData = async () => {
      if (!slug) {
        setState('not_found');
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('get_public_portal_by_slug', { p_slug: slug });

        if (error || !data || data.length === 0) {
          setState('not_found');
          return;
        }

        const portal = data[0] as PublicPortalData;
        setPortalData(portal);

        // Check if protected
        if (portal.access_type === 'protected' && !tokenFromUrl) {
          setState('auth_required');
          return;
        }

        // Validate token if protected
        if (portal.access_type === 'protected') {
          const { data: isValid } = await supabase
            .rpc('validate_portal_token', { p_slug: slug, p_token: tokenFromUrl });

          if (!isValid) {
            setState('auth_required');
            return;
          }
        }

        // Fetch flights
        await fetchFlights(portal.company_id);
        setState('ready');
      } catch (err) {
        console.error('Error loading portal:', err);
        setState('error');
      }
    };

    fetchPortalData();
  }, [slug, tokenFromUrl]);

  const fetchFlights = async (companyId: string) => {
    const { data, error } = await supabase
      .rpc('get_public_flights', { p_company_id: companyId });

    if (error) {
      console.error('Error fetching flights:', error);
      return;
    }

    setFlights(data as PublicFlight[]);
  };

  // Setup realtime subscription
  useEffect(() => {
    if (!portalData?.company_id) return;

    const channel = supabase
      .channel('public_flights')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flights',
          filter: `company_id=eq.${portalData.company_id}`,
        },
        () => {
          fetchFlights(portalData.company_id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [portalData?.company_id]);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !token) return;

    const { data: isValid } = await supabase
      .rpc('validate_portal_token', { p_slug: slug, p_token: token });

    if (isValid && portalData) {
      await fetchFlights(portalData.company_id);
      setState('ready');
    }
  };

  const filteredFlights = dateFilter
    ? flights.filter(f => f.arrival_date === dateFilter || f.departure_date === dateFilter)
    : flights;

  const formatTime = (time: string) => time?.slice(0, 5) || '--:--';
  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM', { locale: ptBR }).toUpperCase();
    } catch {
      return date;
    }
  };

  const isColumnVisible = (col: string) => 
    portalData?.visible_columns?.includes(col) ?? true;

  // Loading state
  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Plane className="w-12 h-12 text-cyan-400 animate-pulse" />
          <p className="text-cyan-400 text-lg">Carregando portal...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (state === 'not_found') {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Portal não encontrado</h1>
          <p className="text-gray-400">Este portal não existe ou foi desativado.</p>
        </div>
      </div>
    );
  }

  // Auth required
  if (state === 'auth_required') {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Lock className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Acesso Protegido</h1>
            <p className="text-gray-400">Digite o token de acesso para visualizar o portal.</p>
          </div>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Token de acesso"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="bg-[#1a1f2e] border-cyan-500/30 text-white placeholder:text-gray-500 font-mono"
            />
            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white">
              Acessar Portal
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Erro ao carregar</h1>
          <p className="text-gray-400">Ocorreu um erro ao carregar o portal. Tente novamente.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-cyan-600 hover:bg-cyan-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar
          </Button>
        </div>
      </div>
    );
  }

  // Ready - FIDS Display
  return (
    <div className="min-h-screen bg-[#0a0e14] text-white font-sans">
      {/* Header */}
      <header className="bg-[#0d1117] border-b border-cyan-500/20 px-4 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {portalData?.logo_url ? (
              <img 
                src={portalData.logo_url} 
                alt="Logo" 
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                {portalData?.display_name || 'Portal de Voos'}
              </h1>
              <p className="text-sm text-cyan-400">Informações de Voo em Tempo Real</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {portalData?.date_filters_enabled && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-[#1a1f2e] border-cyan-500/30 text-white w-40"
                />
                {dateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateFilter('')}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            )}

            <div className="text-right">
              <div className="text-3xl font-mono font-bold text-cyan-400">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-sm text-gray-400">
                {format(currentTime, 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Flight Board */}
      <main className="p-4 lg:p-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a1f2e] text-cyan-400 text-sm uppercase tracking-wider">
                {isColumnVisible('aircraft') && (
                  <th className="px-4 py-3 text-left font-semibold">Aeronave</th>
                )}
                {isColumnVisible('model') && (
                  <th className="px-4 py-3 text-left font-semibold">Modelo</th>
                )}
                {isColumnVisible('route') && (
                  <th className="px-4 py-3 text-left font-semibold">Rota</th>
                )}
                {isColumnVisible('base') && (
                  <th className="px-4 py-3 text-left font-semibold">Base</th>
                )}
                {isColumnVisible('arrival_date') && (
                  <th className="px-4 py-3 text-left font-semibold">Chegada</th>
                )}
                {isColumnVisible('arrival_time') && (
                  <th className="px-4 py-3 text-left font-semibold">ETA</th>
                )}
                {isColumnVisible('departure_date') && (
                  <th className="px-4 py-3 text-left font-semibold">Partida</th>
                )}
                {isColumnVisible('departure_time') && (
                  <th className="px-4 py-3 text-left font-semibold">ETD</th>
                )}
                {isColumnVisible('status') && (
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {filteredFlights.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <Plane className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Nenhum voo encontrado</p>
                    {dateFilter && (
                      <p className="text-sm mt-2">Tente remover o filtro de data</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredFlights.map((flight, index) => (
                  <tr 
                    key={flight.id} 
                    className={cn(
                      "hover:bg-cyan-500/5 transition-colors",
                      index % 2 === 0 ? "bg-[#0d1117]" : "bg-[#0a0e14]"
                    )}
                  >
                    {isColumnVisible('aircraft') && (
                      <td className="px-4 py-4">
                        <span className="font-mono font-bold text-lg text-white tracking-wider">
                          {flight.aircraft_prefix}
                        </span>
                      </td>
                    )}
                    {isColumnVisible('model') && (
                      <td className="px-4 py-4">
                        <span className="text-gray-300">{flight.aircraft_model}</span>
                      </td>
                    )}
                    {isColumnVisible('route') && (
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-cyan-300">
                            {flight.origin}
                          </span>
                          <span className="text-gray-500">→</span>
                          <span className="font-mono font-semibold text-cyan-300">
                            {flight.destination}
                          </span>
                        </div>
                      </td>
                    )}
                    {isColumnVisible('base') && (
                      <td className="px-4 py-4">
                        <span className="font-mono text-gray-300">
                          {flight.base || '-'}
                        </span>
                      </td>
                    )}
                    {isColumnVisible('arrival_date') && (
                      <td className="px-4 py-4">
                        <span className="text-gray-300">{formatDate(flight.arrival_date)}</span>
                      </td>
                    )}
                    {isColumnVisible('arrival_time') && (
                      <td className="px-4 py-4">
                        <span className="font-mono text-xl font-bold text-green-400">
                          {formatTime(flight.arrival_time)}
                        </span>
                      </td>
                    )}
                    {isColumnVisible('departure_date') && (
                      <td className="px-4 py-4">
                        <span className="text-gray-300">{formatDate(flight.departure_date)}</span>
                      </td>
                    )}
                    {isColumnVisible('departure_time') && (
                      <td className="px-4 py-4">
                        <span className="font-mono text-xl font-bold text-amber-400">
                          {formatTime(flight.departure_time)}
                        </span>
                      </td>
                    )}
                    {isColumnVisible('status') && (
                      <td className="px-4 py-4">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
                          statusColors[flight.status]
                        )}>
                          {STATUS_LABELS[flight.status]}
                        </span>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Live indicator */}
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-[#1a1f2e] px-4 py-2 rounded-full border border-cyan-500/30">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Atualização em tempo real</span>
        </div>
      </main>
    </div>
  );
}
