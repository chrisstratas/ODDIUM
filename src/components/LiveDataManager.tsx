import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

interface LiveDataManagerProps {
  enabled: boolean;
  refreshInterval: number;
  onRefreshComplete?: () => void;
}

export const LiveDataManager = ({ 
  enabled, 
  refreshInterval,
  onRefreshComplete 
}: LiveDataManagerProps) => {
  
  const refreshLiveData = async () => {
    console.log('Auto-refreshing live data...');
    
    try {
      // Fetch odds in background
      const { error: oddsError } = await supabase.functions.invoke('fetch-sportsdata-odds', {
        body: { sport: 'all' }
      });

      if (oddsError) {
        console.error('Auto-refresh odds error:', oddsError);
        return;
      }

      onRefreshComplete?.();
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    }
  };

  const { isRefreshing, lastRefreshTime } = useAutoRefresh({
    onRefresh: refreshLiveData,
    interval: refreshInterval,
    enabled,
    onlyWhenVisible: true
  });

  // Show toast when refresh completes
  useEffect(() => {
    if (lastRefreshTime && !isRefreshing) {
      const timeStr = lastRefreshTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      console.log(`Data refreshed at ${timeStr}`);
    }
  }, [lastRefreshTime, isRefreshing]);

  return null; // This is a headless component
};
