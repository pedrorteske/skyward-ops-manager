import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { PortalSettings } from '@/types/portal';

const mapDbToPortalSettings = (row: any): PortalSettings => ({
  id: row.id,
  companyId: row.company_id,
  enabled: row.enabled,
  displayName: row.display_name,
  logoUrl: row.logo_url,
  visibleColumns: row.visible_columns || [],
  dateFiltersEnabled: row.date_filters_enabled,
  accessType: row.access_type,
  accessToken: row.access_token,
  publicSlug: row.public_slug,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function usePortalSettings() {
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { companyId, isLoading: companyLoading } = useCompanyId();
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    if (!companyId) {
      setSettings(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('portal_settings')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching portal settings:', error);
        return;
      }

      setSettings(data ? mapDbToPortalSettings(data) : null);
    } catch (err) {
      logger.error('Error in fetchSettings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!companyLoading) {
      fetchSettings();
    }
  }, [companyLoading, fetchSettings]);

  const generateSlug = () => {
    return `${companyId?.slice(0, 8)}-${Date.now().toString(36)}`;
  };

  const generateToken = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const saveSettings = async (updates: Partial<PortalSettings>) => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não encontrada',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const dbData: any = {
        company_id: companyId,
        enabled: 'enabled' in updates ? updates.enabled : (settings?.enabled ?? false),
        display_name: 'displayName' in updates ? updates.displayName : settings?.displayName,
        logo_url: 'logoUrl' in updates ? updates.logoUrl : settings?.logoUrl,
        visible_columns: 'visibleColumns' in updates ? updates.visibleColumns : (settings?.visibleColumns ?? ['aircraft', 'route', 'status']),
        date_filters_enabled: 'dateFiltersEnabled' in updates ? updates.dateFiltersEnabled : (settings?.dateFiltersEnabled ?? true),
        access_type: 'accessType' in updates ? updates.accessType : (settings?.accessType ?? 'public'),
        access_token: 'accessToken' in updates ? updates.accessToken : settings?.accessToken,
        public_slug: 'publicSlug' in updates ? updates.publicSlug : (settings?.publicSlug ?? generateSlug()),
      };

      if (settings?.id) {
        // Update existing
        const { data, error } = await supabase
          .from('portal_settings')
          .update(dbData)
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        setSettings(mapDbToPortalSettings(data));
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('portal_settings')
          .insert(dbData)
          .select()
          .single();

        if (error) throw error;
        setSettings(mapDbToPortalSettings(data));
      }

      toast({
        title: 'Configurações salvas',
        description: 'As configurações do portal foram atualizadas.',
      });
      return true;
    } catch (err: any) {
      logger.error('Error saving portal settings:', err);
      toast({
        title: 'Erro ao salvar',
        description: err.message || 'Ocorreu um erro ao salvar as configurações.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    settings,
    isLoading,
    saveSettings,
    refreshSettings: fetchSettings,
    generateToken,
  };
}
