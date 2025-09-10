import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import PlayerPropCard from "@/components/PlayerPropCard";
import BettingInsights from "@/components/BettingInsights";
import ValueFilters from "@/components/ValueFilters";
import SGPCategoryFilters from "@/components/SGPCategoryFilters";
import ParlayBuilder from "@/components/BetSlip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RotateCcw, TrendingUp, Users, Calendar, Target } from "lucide-react";

const MLB = () => {
  const [filters, setFilters] = useState({
    sortBy: 'value',
    category: 'all', 
    confidence: 'all'
  });

  const [sgpFilters, setSgpFilters] = useState({
    sortBy: 'value',
    category: 'mlb-batting',
    confidence: 'all'
  });

  const { props: liveProps, loading, error, refetch } = useAnalytics(filters);
  const [refreshing, setRefreshing] = useState(false);

  // MLB-specific fallback props
  const mlbFallbackProps = [
    {
      player: "Mookie Betts",
      team: "Los Angeles Dodgers",
      stat: "Total Bases",
      line: 1.5,
      overOdds: "+105",
      underOdds: "-125",
      trend: "up" as const,
      isPopular: true,
      confidence: 87,
      valueRating: "high" as const,
      recentForm: "2.1 avg",
      seasonAvg: 1.8,
      hitRate: 74,
      edge: 11.2,
      sportsbook: "DraftKings",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Gerrit Cole",
      team: "New York Yankees",
      stat: "Strikeouts",
      line: 7.5,
      overOdds: "-110",
      underOdds: "-110",
      confidence: 84,
      valueRating: "high" as const,
      trend: "up" as const,
      recentForm: "8.2 avg",
      seasonAvg: 7.8,
      hitRate: 71,
      edge: 9.5,
      isPopular: true,
      sportsbook: "FanDuel",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Aaron Judge",
      team: "New York Yankees", 
      stat: "Home Runs",
      line: 0.5,
      overOdds: "+240",
      underOdds: "-300",
      confidence: 76,
      valueRating: "high" as const,
      trend: "up" as const,
      recentForm: "0.7 avg",
      seasonAvg: 0.6,
      hitRate: 65,
      edge: 7.3,
      isPopular: false,
      sportsbook: "BetMGM",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Ronald Acuña Jr.",
      team: "Atlanta Braves",
      stat: "Hits + Runs + RBIs",
      line: 2.5,
      overOdds: "+115",
      underOdds: "-135",
      confidence: 81,
      valueRating: "medium" as const,
      trend: "up" as const,
      recentForm: "2.8 avg",
      seasonAvg: 2.6,
      hitRate: 68,
      edge: 5.1,
      isPopular: true,
      sportsbook: "Caesars",
      lastUpdated: new Date().toISOString()
    }
  ];

  const displayProps = liveProps.length > 0 ? liveProps : mlbFallbackProps;

  const populateDatabase = async () => {
    setRefreshing(true);
    try {
      console.log('Populating MLB data...');
      const response = await supabase.functions.invoke('fetch-live-analytics');
      
      if (response.error) {
        console.error('Error populating database:', response.error);
        throw response.error;
      }
      
      console.log('MLB data populated successfully:', response.data);
      
      setTimeout(() => {
        refetch();
        setRefreshing(false);
      }, 1500);
      
    } catch (err) {
      console.error('Failed to populate MLB data:', err);
      setRefreshing(false);
    }
  };

  const todaysGames = [
    { home: "Dodgers", away: "Yankees", total: "O/U 8.5", line: "LAD -1.5", time: "7:10 PM PT" },
    { home: "Braves", away: "Phillies", total: "O/U 9", line: "ATL -130", time: "7:20 PM ET" },
    { home: "Astros", away: "Rangers", total: "O/U 8", line: "HOU -115", time: "8:10 PM CT" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SportCategories currentSport="MLB" />
      
      {/* MLB Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600/20 to-blue-600/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">⚾</span>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                MLB Player Props
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              Track pitcher strikeouts, batter home runs, and team totals with comprehensive baseball analytics and live odds.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                View Today's Games
              </Button>
              <Button variant="outline" size="lg">
                <Target className="h-4 w-4 mr-2" />
                Season Props
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
              
              {/* MLB-specific filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚾ MLB Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { id: 'mlb-batting', label: 'Batting Props', icon: '🏏' },
                      { id: 'mlb-pitching', label: 'Pitching Props', icon: '⚡' },
                      { id: 'mlb-team', label: 'Team Totals', icon: '📊' },
                      { id: 'mlb-first5', label: 'First 5 Innings', icon: '🎯' },
                      { id: 'mlb-specials', label: 'Special Props', icon: '⭐' }
                    ].map((category) => (
                      <Button
                        key={category.id}
                        variant={sgpFilters.category === category.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSgpFilters(prev => ({ ...prev, category: category.id }))}
                      >
                        <span className="mr-2">{category.icon}</span>
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Today's Games */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Today's Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todaysGames.map((game, index) => (
                      <div key={index} className="p-3 rounded-lg bg-secondary/50">
                        <div className="font-medium text-sm">
                          {game.away} @ {game.home}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {game.line} • {game.total}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {game.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weather Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    🌤️ Weather Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Wind Speed:</span>
                      <span className="text-green-500">8 mph ↗️</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temperature:</span>
                      <span>72°F</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Home Run Factor:</span>
                      <span className="text-green-500">+12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* MLB Insights */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Today's MLB Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-secondary/30">
                      <div className="text-2xl font-bold text-green-500">71%</div>
                      <div className="text-sm text-muted-foreground">Strikeout Props Hit Rate</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/30">
                      <div className="text-2xl font-bold text-blue-500">8.2</div>
                      <div className="text-sm text-muted-foreground">Avg Total Runs Today</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/30">
                      <div className="text-2xl font-bold text-purple-500">156</div>
                      <div className="text-sm text-muted-foreground">Active Player Props</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* High Value MLB Props */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⚾ High Value MLB Props</h2>
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
                    View All MLB Props
                  </Button>
                </div>
              </div>
              {loading && <div className="text-center py-4">Loading MLB analytics...</div>}
              {error && (
                <div className="text-center py-2 text-muted-foreground">
                  Live MLB analytics unavailable — showing fallback props.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.filter(prop => prop.valueRating === "high").map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* MLB Batting Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🏏 MLB Batting Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.filter(prop => 
                  prop.stat.includes("Hits") || 
                  prop.stat.includes("Home") || 
                  prop.stat.includes("Total") ||
                  prop.stat.includes("RBI")
                ).slice(0, 4).map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* Pitcher Strikeouts */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">⚡ Pitcher Strikeouts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.filter(prop => prop.stat.includes("Strikeouts")).slice(0, 4).map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bet Slip */}
        <div className="fixed bottom-4 right-4 z-50">
          <ParlayBuilder />
        </div>
      </div>
    </div>
  );
};

export default MLB;