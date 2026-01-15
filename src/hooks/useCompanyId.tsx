import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

export const useCompanyId = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyId = async () => {
      if (!user?.id) {
        setCompanyId(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          logger.error('Error fetching company ID:', error);
          setCompanyId(null);
        } else {
          setCompanyId(data?.company_id || null);
        }
      } catch (err) {
        logger.error('Error in useCompanyId:', err);
        setCompanyId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyId();
  }, [user?.id]);

  return { companyId, isLoading };
};
