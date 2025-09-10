import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import PlayerPropCard from "@/components/PlayerPropCard";
import BettingInsights from "@/components/BettingInsights";
import ValueFilters from "@/components/ValueFilters";
import SGPCategoryFilters from "@/components/SGPCategoryFilters";
import ParlayBuilder from "@/components/BetSlip";
import AdvancedPlayerAnalytics from "@/components/AdvancedPlayerAnalytics";
import RiskRewardAnalyzer from "@/components/RiskRewardAnalyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RotateCcw, Database } from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";

const NHL = () => {
  const [filters, setFilters] = useState({
    sortBy: 'value',
    category: 'all',
    confidence: 'all'
  });

  const [sgpFilters, setSgpFilters] = useState({
    sortBy: 'value',
    category: 'nhl-scoring',
    confidence: 'all'
  });

  const { props: liveProps, loading, error, refetch } = useAnalytics(filters);
  const { props: sgpProps } = useAnalytics(sgpFilters);
  const [refreshing, setRefreshing] = useState(false);

  // NHL-specific fallback props
  const nhlFallbackProps = [
    {
      player: "Connor McDavid",
      team: "Edmonton Oilers",
      stat: "Points",
      line: 1.5,
      overOdds: "+105",
      underOdds: "-125",
      trend: "up" as const,
      isPopular: true,
      confidence: 92,
      valueRating: "high" as const,
      recentForm: "2.1 PPG L5",
      seasonAvg: 1.8,
      hitRate: 78,
      edge: 8.7,
      sportsbook: "DraftKings",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "David Pastrnak",
      team: "Boston Bruins",
      stat: "Goals",
      line: 0.5,
      overOdds: "+155",
      underOdds: "-190",
      trend: "up" as const,
      isPopular: true,
      confidence: 85,
      valueRating: "high" as const,
      recentForm: "0.8 G/G L5",
      seasonAvg: 0.7,
      hitRate: 68,
      edge: 6.2,
      sportsbook: "FanDuel",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Erik Karlsson",
      team: "Pittsburgh Penguins",
      stat: "Assists",
      line: 0.5,
      overOdds: "+130",
      underOdds: "-155",
      trend: "down" as const,
      isPopular: false,
      confidence: 79,
      valueRating: "medium" as const,
      recentForm: "0.6 A/G L5",
      seasonAvg: 0.8,
      hitRate: 62,
      edge: 3.4,
      sportsbook: "BetMGM",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Auston Matthews",
      team: "Toronto Maple Leafs",
      stat: "Shots on Goal",
      line: 3.5,
      overOdds: "-115",
      underOdds: "-105",
      trend: "up" as const,
      isPopular: false,
      confidence: 73,
      valueRating: "medium" as const,
      recentForm: "4.2 SOG L5",
      seasonAvg: 3.8,
      hitRate: 71,
      edge: 4.1,
      sportsbook: "Caesars",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Igor Shesterkin",
      team: "New York Rangers",
      stat: "Saves",
      line: 28.5,
      overOdds: "-110",
      underOdds: "-110",
      trend: "up" as const,
      isPopular: true,
      confidence: 81,
      valueRating: "high" as const,
      recentForm: "31.4 saves L5",
      seasonAvg: 29.2,
      hitRate: 76,
      edge: 5.8,
      sportsbook: "DraftKings",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Nathan MacKinnon",
      team: "Colorado Avalanche",
      stat: "Points + Shots",
      line: 4.5,
      overOdds: "+100",
      underOdds: "-120",
      trend: "up" as const,
      isPopular: true,
      confidence: 88,
      valueRating: "high" as const,
      recentForm: "5.2 P+S L5",
      seasonAvg: 4.7,
      hitRate: 74,
      edge: 7.3,
      sportsbook: "FanDuel",
      lastUpdated: new Date().toISOString()
    }
  ];

  const displayProps = liveProps.length > 0 ? liveProps : nhlFallbackProps;

  const populateDatabase = async () => {
    setRefreshing(true);
    try {
      console.log('Populating NHL data...');
      const response = await supabase.functions.invoke('fetch-live-analytics');
      
      if (response.error) {
        console.error('Error populating database:', response.error);
        throw response.error;
      }
      
      console.log('Database populated successfully:', response.data);
      
      // Wait a moment for data to be inserted, then refetch
      setTimeout(() => {
        refetch();
        setRefreshing(false);
      }, 1500);
      
    } catch (err) {
      console.error('Error:', err);
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <Header />
      <SportCategories />
      
      {/* NHL Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="NHL Hockey Arena" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90"></div>
        </div>
        <div className="container mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  NHL Props
                </span>
                <br />
                <span className="text-foreground">Data Analysis</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Advanced NHL player prop analysis with goals, assists, shots, saves, and comprehensive hockey analytics.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                onClick={populateDatabase}
                disabled={refreshing}
              >
                <Database className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Loading...' : 'Load NHL Props'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-6">
              <ValueFilters onFiltersChange={setFilters} />
              <SGPCategoryFilters 
                onCategoryChange={(category) => setSgpFilters(prev => ({ ...prev, category }))}
                onSortChange={(sortBy) => setSgpFilters(prev => ({ ...prev, sortBy }))}
                onConfidenceChange={(confidence) => setSgpFilters(prev => ({ ...prev, confidence }))}
                selectedCategory={sgpFilters.category}
                selectedSort={sgpFilters.sortBy}
                selectedConfidence={sgpFilters.confidence}
              />
              <ParlayBuilder />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* NHL Insights */}
            <div className="mb-8">
              <BettingInsights sport="NHL" />
            </div>

            {/* NHL Player Analytics */}
            <div className="mb-8">
              <AdvancedPlayerAnalytics sport="NHL" />
            </div>

            {/* High Value NHL Props */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🏒 High Value NHL Props</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={populateDatabase}
                    disabled={refreshing}
                  >
                    <RotateCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Loading...' : 'Refresh Data'}
                  </Button>
                  <Button variant="outline" size="sm">
                    View All NHL Props
                  </Button>
                </div>
              </div>
              {loading && <div className="text-center py-4">Loading NHL analytics...</div>}
              {error && (
                <div className="text-center py-2 text-muted-foreground">
                  Live NHL analytics unavailable — showing sample props.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.filter(prop => prop.valueRating === "high").map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* Risk vs Reward Analysis */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⚖️ NHL Risk vs Reward</h2>
              </div>
              <RiskRewardAnalyzer availableBets={displayProps} />
            </div>

            {/* SGP Builder Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🎯 NHL SGP Builder Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(sgpProps.length > 0 ? sgpProps : displayProps).map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* All NHL Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🏒 All NHL Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NHL;