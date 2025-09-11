import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import PlayerPropCard from "@/components/PlayerPropCard";
import BettingInsights from "@/components/BettingInsights";
import ValueFilters from "@/components/ValueFilters";
import SGPCategoryFilters from "@/components/SGPCategoryFilters";
import ParlayBuilder from "@/components/BetSlip";
import RiskRewardAnalyzer from "@/components/RiskRewardAnalyzerSimple";
import WeeklySchedule from "@/components/WeeklySchedule";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RotateCcw, Database } from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";

const NBA = () => {
  const [filters, setFilters] = useState({
    sortBy: 'value',
    category: 'all',
    confidence: 'all',
    sport: 'NBA'
  });

  const [sgpFilters, setSgpFilters] = useState({
    sortBy: 'value',
    category: 'nba-scoring',
    confidence: 'all',
    sport: 'NBA'
  });

  const { props: liveProps, loading, error, refetch } = useAnalytics(filters);
  const { props: sgpProps } = useAnalytics(sgpFilters);
  const [refreshing, setRefreshing] = useState(false);

  // NBA 2024-25 Season fallback props
  const nbaFallbackProps = [
    {
      player: "Victor Wembanyama",
      team: "San Antonio Spurs",
      stat: "Points",
      line: 22.5,
      overOdds: "-108",
      underOdds: "-112",
      trend: "up" as const,
      isPopular: true,
      confidence: 89,
      valueRating: "high" as const,
      recentForm: "25.1 PPG L5",
      seasonAvg: 23.7,
      hitRate: 76,
      edge: 6.8,
      sportsbook: "DraftKings",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Shai Gilgeous-Alexander",
      team: "Oklahoma City Thunder",
      stat: "Points",
      line: 29.5,
      overOdds: "-110",
      underOdds: "-110",
      trend: "up" as const,
      isPopular: true,
      confidence: 91,
      valueRating: "high" as const,
      recentForm: "32.4 PPG L5",
      seasonAvg: 30.8,
      hitRate: 81,
      edge: 8.2,
      sportsbook: "FanDuel",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Nikola Jokic",
      team: "Denver Nuggets",
      stat: "Triple-Double",
      line: 0.5,
      overOdds: "+180",
      underOdds: "-220",
      trend: "up" as const,
      isPopular: true,
      confidence: 84,
      valueRating: "high" as const,
      recentForm: "3 TD L5",
      seasonAvg: 2.1,
      hitRate: 71,
      edge: 8.2,
      sportsbook: "BetMGM",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Jayson Tatum",
      team: "Boston Celtics",
      stat: "3-Pointers Made",
      line: 3.5,
      overOdds: "+105",
      underOdds: "-125",
      trend: "up" as const,
      isPopular: false,
      confidence: 77,
      valueRating: "medium" as const,
      recentForm: "4.2 3PM L5",
      seasonAvg: 3.8,
      hitRate: 68,
      edge: 4.1,
      sportsbook: "Caesars",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Anthony Edwards",
      team: "Minnesota Timberwolves",
      stat: "Points",
      line: 25.5,
      overOdds: "-115",
      underOdds: "-105",
      trend: "up" as const,
      isPopular: true,
      confidence: 82,
      valueRating: "high" as const,
      recentForm: "28.3 PPG L5",
      seasonAvg: 26.7,
      hitRate: 73,
      edge: 5.4,
      sportsbook: "DraftKings",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Luka Doncic",
      team: "Dallas Mavericks",
      stat: "Assists",
      line: 8.5,
      overOdds: "-105",
      underOdds: "-115",
      trend: "down" as const,
      isPopular: false,
      confidence: 79,
      valueRating: "medium" as const,
      recentForm: "7.8 AST L5",
      seasonAvg: 8.9,
      hitRate: 71,
      edge: 2.9,
      sportsbook: "FanDuel",
      lastUpdated: new Date().toISOString()
    }
  ];

  const displayProps = liveProps.length > 0 ? liveProps : nbaFallbackProps;

  const populateDatabase = async () => {
    setRefreshing(true);
    try {
      console.log('Populating NBA data...');
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
      
      {/* NBA Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="NBA Basketball Arena" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90"></div>
        </div>
        <div className="container mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  NBA Props
                </span>
                <br />
                <span className="text-foreground">Data Analysis</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Advanced NBA player prop analysis with real-time odds, performance trends, and smart betting insights.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                onClick={populateDatabase}
                disabled={refreshing}
              >
                <Database className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Loading...' : 'Load NBA Props'}
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
                  sport="NBA"
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
            {/* NBA Weekly Schedule */}
            <div className="mb-8">
              <WeeklySchedule sport="NBA" />
            </div>

            {/* NBA Insights */}
            <div className="mb-8">
              <BettingInsights sport="NBA" />
            </div>


            {/* High Value NBA Props */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🏀 High Value NBA Props</h2>
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
                    View All NBA Props
                  </Button>
                </div>
              </div>
              {loading && <div className="text-center py-4">Loading NBA analytics...</div>}
              {error && (
                <div className="text-center py-2 text-muted-foreground">
                  Live NBA analytics unavailable — showing sample props.
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
                <h2 className="text-2xl font-bold">⚖️ NBA Risk vs Reward</h2>
              </div>
              <RiskRewardAnalyzer availableBets={displayProps} />
            </div>

            {/* SGP Builder Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🎯 NBA SGP Builder Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(sgpProps.length > 0 ? sgpProps : displayProps).map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* All NBA Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🏀 All NBA Props</h2>
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

export default NBA;