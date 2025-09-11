import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RefreshContextType {
  refreshAll: () => Promise<void>;
  isRefreshing: boolean;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};

interface RefreshProviderProps {
  children: ReactNode;
}

export const RefreshProvider = ({ children }: RefreshProviderProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAll = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      console.log('Refreshing all data sources...');
      
      // Refresh all data sources in parallel
      const refreshPromises = [
        // Live analytics and props
        supabase.functions.invoke('fetch-live-analytics'),
        supabase.functions.invoke('fetch-live-odds'),
        // Sports schedules for all sports
        supabase.functions.invoke('fetch-sports-schedule', { body: { sport: 'NFL' } }),
        supabase.functions.invoke('fetch-sports-schedule', { body: { sport: 'NBA' } }),
        supabase.functions.invoke('fetch-sports-schedule', { body: { sport: 'MLB' } }),
        supabase.functions.invoke('fetch-sports-schedule', { body: { sport: 'NHL' } }),
        supabase.functions.invoke('fetch-sports-schedule', { body: { sport: 'WNBA' } }),
        // Live scores
        supabase.functions.invoke('fetch-livesport-scores'),
        // TheScore data
        supabase.functions.invoke('fetch-thescore-data', { body: { sport: 'all' } }),
        // Player matchups
        supabase.functions.invoke('populate-matchups')
      ];

      const results = await Promise.allSettled(refreshPromises);
      
      // Log any errors but don't throw to avoid stopping the refresh
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Refresh operation ${index} failed:`, result.reason);
        }
      });

      console.log('Global refresh completed');
      
      // Dispatch custom event to notify all components
      window.dispatchEvent(new CustomEvent('globalDataRefresh'));
      
    } catch (error) {
      console.error('Error during global refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <RefreshContext.Provider value={{ refreshAll, isRefreshing }}>
      {children}
    </RefreshContext.Provider>
  );
};