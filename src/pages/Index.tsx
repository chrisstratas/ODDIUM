import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import PlayerPropCard from "@/components/PlayerPropCard";
import BettingInsights from "@/components/BettingInsights";
import ValueFilters from "@/components/ValueFilters";
import SGPCategoryFilters from "@/components/SGPCategoryFilters";
import ParlayBuilder from "@/components/BetSlip";
import AdvancedPlayerAnalytics from "@/components/AdvancedPlayerAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RotateCcw, Database } from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";

const Index = () => {
  const [filters, setFilters] = useState({
    sortBy: 'value',
    category: 'all',
    confidence: 'all'
  });

  const [sgpFilters, setSgpFilters] = useState({
    sortBy: 'value',
    category: 'all',
    confidence: 'all'
  });

  const { props: liveProps, loading, error, refetch } = useAnalytics(filters);
  const { props: sgpProps } = useAnalytics(sgpFilters);
  const [refreshing, setRefreshing] = useState(false);

  const populateMatchupData = async () => {
    setRefreshing(true);
    try {
      console.log('Populating matchup database...');
      const response = await supabase.functions.invoke('populate-matchups');
      
      if (response.error) {
        console.error('Error populating matchups:', response.error);
        throw response.error;
      }
      
      console.log('Matchup data populated successfully:', response.data);
      setRefreshing(false);
    } catch (err) {
      console.error('Error:', err);
      setRefreshing(false);
    }
  };

  const populateDatabase = async () => {
    setRefreshing(true);
    try {
      console.log('Populating database with sample data...');
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
      console.error('Failed to populate database:', err);
      setRefreshing(false);
    }
  };

  // Fallback to static data if live data is empty
  const fallbackProps = [
    {
      player: "LeBron James",
      team: "Los Angeles Lakers",
      stat: "Points",
      line: 25.5,
      overOdds: "+110",
      underOdds: "-130",
      trend: "up" as const,
      isPopular: true,
      confidence: 85,
      valueRating: "high" as const,
      recentForm: "28.2 avg",
      seasonAvg: 25.8,
      hitRate: 72
    },
    {
      player: "Stephen Curry",
      team: "Golden State Warriors", 
      stat: "3-Pointers Made",
      line: 4.5,
      overOdds: "-105",
      underOdds: "-115",
      trend: "up" as const,
      isPopular: true,
      confidence: 78,
      valueRating: "high" as const,
      recentForm: "5.2 avg",
      seasonAvg: 4.1,
      hitRate: 68
    },
    {
      player: "Giannis Antetokounmpo",
      team: "Milwaukee Bucks",
      stat: "Rebounds",
      line: 11.5,
      overOdds: "+125",
      underOdds: "-145",
      confidence: 72,
      valueRating: "medium" as const,
      recentForm: "12.8 avg",
      seasonAvg: 11.2,
      hitRate: 65
    },
    {
      player: "Luka Dončić",
      team: "Dallas Mavericks",
      stat: "Assists",
      line: 8.5,
      overOdds: "-110",
      underOdds: "-110",
      isPopular: true,
      confidence: 80,
      valueRating: "high" as const,
      recentForm: "9.4 avg",
      seasonAvg: 8.8,
      hitRate: 71
    },
    {
      player: "Jayson Tatum",
      team: "Boston Celtics",
      stat: "Points",
      line: 26.5,
      overOdds: "+115",
      underOdds: "-135",
      confidence: 65,
      valueRating: "medium" as const,
      recentForm: "24.8 avg",
      seasonAvg: 26.9,
      hitRate: 58
    },
    {
      player: "Kevin Durant",
      team: "Phoenix Suns",
      stat: "Points",
      line: 27.5,
      overOdds: "-120",
      underOdds: "+100",
      confidence: 88,
      valueRating: "high" as const,
      recentForm: "29.6 avg",
      seasonAvg: 28.1,
      hitRate: 75
    }
  ];

  const displayProps = liveProps.length > 0 ? liveProps : fallbackProps;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SportCategories />
      
      {/* Hero Section */}
      <section className="relative">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Find Value
                </span>
                <br />
                <span className="text-foreground">Bet Smarter</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Research player props, build same game parlays, and export to your favorite sportsbook.
              </p>
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                Start Building Parlays
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
            {/* Advanced Player Analytics */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🎯 Advanced Player Analytics</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={populateMatchupData}
                  disabled={refreshing}
                >
                  <Database className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Loading...' : 'Load Matchup Data'}
                </Button>
              </div>
              <AdvancedPlayerAnalytics sport="NBA" />
            </div>

            {/* Insights Section */}
            <div className="mb-8">
              <BettingInsights />
            </div>
            {/* High Value Props */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⭐ High Value Props</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={populateDatabase}
                    disabled={refreshing}
                  >
                    <RotateCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Loading...' : 'Load Live Data'}
                  </Button>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              </div>
              {loading && <div className="text-center py-4">Loading live analytics...</div>}
              {error && (
                <div className="text-center py-2 text-muted-foreground">
                  Live analytics unavailable — showing fallback props.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.filter(prop => prop.valueRating === "high").map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* SGP Category Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🎯 SGP Builder Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(sgpProps.length > 0 ? sgpProps : displayProps).map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* All Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🏀 All Live Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* Analytics Dashboard */}
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Today's Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-positive-odds">127</p>
                    <p className="text-sm text-muted-foreground">High Value Props</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">73%</p>
                    <p className="text-sm text-muted-foreground">Avg Confidence</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning">+15%</p>
                    <p className="text-sm text-muted-foreground">Expected Edge</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">2,547</p>
                    <p className="text-sm text-muted-foreground">Props Analyzed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;