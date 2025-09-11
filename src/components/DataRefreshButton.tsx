import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Database, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DataRefreshButtonProps {
  sport?: string;
}

const DataRefreshButton = ({ sport = 'NFL' }: DataRefreshButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const fetchHighlightlyData = async () => {
    setLoading(true);
    setStatus('idle');
    
    try {
      console.log(`Triggering ${sport} data fetch from Highlightly...`);
      
      const { data, error } = await supabase.functions.invoke('fetch-api-sports-schedule', {
        body: { sport: sport }
      });
      
      if (error) {
        throw error;
      }
      
      if (data && data.success) {
        setStatus('success');
        setLastRefresh(new Date().toLocaleTimeString());
        toast({
          title: "Data Refresh Successful",
          description: `Successfully fetched ${sport} 2025-2026 season data from Highlightly`,
        });
        
        // Trigger global refresh event
        window.dispatchEvent(new CustomEvent('globalDataRefresh'));
      } else {
        throw new Error(data?.message || 'Failed to fetch data');
      }
      
    } catch (err) {
      console.error('Error fetching Highlightly data:', err);
      setStatus('error');
      toast({
        title: "Data Refresh Failed", 
        description: err instanceof Error ? err.message : 'Failed to fetch data from Highlightly',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Database className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return `Last updated: ${lastRefresh}`;
      case 'error':
        return 'Update failed - check console for details';
      default:
        return 'Ready to fetch live data';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          Live Data Refresh - {sport} 2025-2026
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {getStatusText()}
        </div>
        
        <Button
          onClick={fetchHighlightlyData}
          disabled={loading}
          className="w-full"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Fetching from Highlightly...' : `Fetch ${sport} Live Data`}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          Pulls latest {sport} schedule and scores from Highlightly API for the 2025-2026 season
        </div>
      </CardContent>
    </Card>
  );
};

export default DataRefreshButton;