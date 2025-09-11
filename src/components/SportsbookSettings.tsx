import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const SPORTSBOOKS = [
  { id: 'fanduel', name: 'FanDuel', description: 'Most popular choice' },
  { id: 'draftkings', name: 'DraftKings', description: 'Wide variety of props' },
  { id: 'betmgm', name: 'BetMGM', description: 'Competitive odds' },
  { id: 'caesars', name: 'Caesars', description: 'Reliable platform' },
  { id: 'bet365', name: 'Bet365', description: 'International leader' },
  { id: 'pointsbet', name: 'PointsBet', description: 'Unique betting options' }
];

const SportsbookSettings = () => {
  const { user } = useAuth();
  const [selectedSportsbook, setSelectedSportsbook] = useState('fanduel');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentPreference = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_sportsbook')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setSelectedSportsbook(data?.preferred_sportsbook || 'fanduel');
      } catch (error) {
        console.error('Error fetching sportsbook preference:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentPreference();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_sportsbook: selectedSportsbook })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Sportsbook preference updated!');
    } catch (error) {
      console.error('Error saving sportsbook preference:', error);
      toast.error('Failed to save preference. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sportsbook Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sportsbook Preferences</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your preferred sportsbook for odds and data prioritization.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPORTSBOOKS.map((sportsbook) => (
            <div
              key={sportsbook.id}
              className={`relative p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
                selectedSportsbook === sportsbook.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
              onClick={() => setSelectedSportsbook(sportsbook.id)}
            >
              {selectedSportsbook === sportsbook.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{sportsbook.name}</h3>
                  {sportsbook.id === 'fanduel' && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{sportsbook.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="px-6"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SportsbookSettings;