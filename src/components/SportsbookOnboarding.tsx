import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SportsbookOnboardingProps {
  onComplete: () => void;
}

const SPORTSBOOKS = [
  { id: 'fanduel', name: 'FanDuel', description: 'Most popular choice' },
  { id: 'draftkings', name: 'DraftKings', description: 'Wide variety of props' },
  { id: 'betmgm', name: 'BetMGM', description: 'Competitive odds' },
  { id: 'caesars', name: 'Caesars', description: 'Reliable platform' },
  { id: 'bet365', name: 'Bet365', description: 'International leader' },
  { id: 'pointsbet', name: 'PointsBet', description: 'Unique betting options' }
];

const SportsbookOnboarding = ({ onComplete }: SportsbookOnboardingProps) => {
  const [selectedSportsbook, setSelectedSportsbook] = useState('fanduel');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({ preferred_sportsbook: selectedSportsbook })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Sportsbook preference saved!');
      onComplete();
    } catch (error) {
      console.error('Error saving sportsbook preference:', error);
      toast.error('Failed to save preference. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose Your Favorite Sportsbook</CardTitle>
          <p className="text-muted-foreground">
            We'll prioritize odds and data from your preferred sportsbook. You can change this anytime in settings.
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

          <div className="flex justify-center">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full md:w-auto px-8"
            >
              {saving ? 'Saving...' : 'Continue to App'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SportsbookOnboarding;