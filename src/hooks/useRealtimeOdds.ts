import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OddsMovement {
  player_name: string;
  stat_type: string;
  old_line: number;
  new_line: number;
  movement_size: number;
  sportsbook: string;
}

export const useRealtimeOdds = (onOddsUpdate?: () => void) => {
  const [recentMovements, setRecentMovements] = useState<OddsMovement[]>([]);

  useEffect(() => {
    // Subscribe to live_odds changes
    const channel = supabase
      .channel('live-odds-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_odds'
        },
        (payload) => {
          console.log('Live odds updated:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const oldData = payload.old as any;
            const newData = payload.new as any;
            
            if (oldData.line !== newData.line) {
              const movement: OddsMovement = {
                player_name: newData.player_name,
                stat_type: newData.stat_type,
                old_line: parseFloat(oldData.line),
                new_line: parseFloat(newData.line),
                movement_size: parseFloat(newData.line) - parseFloat(oldData.line),
                sportsbook: newData.sportsbook
              };
              
              setRecentMovements(prev => [movement, ...prev].slice(0, 10));
              
              // Show notification for significant movements
              if (Math.abs(movement.movement_size) >= 0.5) {
                toast({
                  title: "Line Movement Detected",
                  description: `${movement.player_name} ${movement.stat_type}: ${movement.old_line} → ${movement.new_line} (${movement.sportsbook})`,
                  duration: 5000,
                });
              }
            }
          }
          
          onOddsUpdate?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onOddsUpdate]);

  return { recentMovements };
};
