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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RotateCcw, TrendingUp, Users, Calendar } from "lucide-react";

const NFL = () => {
  const [filters, setFilters] = useState({
    sortBy: 'value',
    category: 'all', 
    confidence: 'all'
  });

  const [sgpFilters, setSgpFilters] = useState({
    sortBy: 'value',
    category: 'nfl-passing',
    confidence: 'all'
  });

  const { props: liveProps, loading, error, refetch } = useAnalytics(filters);
  const [refreshing, setRefreshing] = useState(false);

  // NFL-specific fallback props
  const nflFallbackProps = [
    {
      player: "Josh Allen",
      team: "Buffalo Bills",
      stat: "Passing Yards",
      line: 267.5,
      overOdds: "-110",
      underOdds: "-110",
      trend: "up" as const,
      isPopular: true,
      confidence: 89,
      valueRating: "high" as const,
      recentForm: "285.4 avg",
      seasonAvg: 267.8,
      hitRate: 78,
      edge: 12.5,
      sportsbook: "DraftKings",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Christian McCaffrey",
      team: "San Francisco 49ers",
      stat: "Rushing Yards",
      line: 89.5,
      overOdds: "-115",
      underOdds: "-105",
      confidence: 85,
      valueRating: "high" as const,
      trend: "up" as const,
      recentForm: "94.2 avg",
      seasonAvg: 89.1,
      hitRate: 72,
      edge: 8.3,
      isPopular: true,
      sportsbook: "FanDuel",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Travis Kelce",
      team: "Kansas City Chiefs", 
      stat: "Receiving Yards",
      line: 65.5,
      overOdds: "+105",
      underOdds: "-125",
      confidence: 82,
      valueRating: "high" as const,
      trend: "down" as const,
      recentForm: "68.8 avg",
      seasonAvg: 65.2,
      hitRate: 68,
      edge: 5.7,
      isPopular: false,
      sportsbook: "BetMGM",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Lamar Jackson",
      team: "Baltimore Ravens",
      stat: "Passing TDs",
      line: 1.5,
      overOdds: "+125",
      underOdds: "-155",
      confidence: 79,
      valueRating: "medium" as const,
      trend: "up" as const,
      recentForm: "1.8 avg",
      seasonAvg: 1.6,
      hitRate: 65,
      edge: 3.2,
      isPopular: true,
      sportsbook: "Caesars",
      lastUpdated: new Date().toISOString()
    }
  ];

  const displayProps = liveProps.length > 0 ? liveProps : nflFallbackProps;

  const populateDatabase = async () => {
    setRefreshing(true);
    try {
      console.log('Populating NFL data...');
      const response = await supabase.functions.invoke('fetch-live-analytics');
      
      if (response.error) {
        console.error('Error populating database:', response.error);
        throw response.error;
      }
      
      console.log('NFL data populated successfully:', response.data);
      
      setTimeout(() => {
        refetch();
        setRefreshing(false);
      }, 1500);
      
    } catch (err) {
      console.error('Failed to populate NFL data:', err);
      setRefreshing(false);
    }
  };

  const weeklyMatchups = [
    { home: "Bills", away: "Chiefs", spread: "BUF -2.5", total: "O/U 54.5", time: "Sun 4:25 PM" },
    { home: "Cowboys", away: "Eagles", spread: "DAL -3", total: "O/U 51", time: "Sun 8:20 PM" },
    { home: "49ers", away: "Packers", spread: "SF -1", total: "O/U 48.5", time: "Mon 8:15 PM" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SportCategories currentSport="NFL" />
      
      {/* NFL Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🏈</span>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                NFL Player Props
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              Analyze quarterback passing yards, running back rushing props, and wide receiver targets with advanced NFL analytics.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                View Weekly Matchups
              </Button>
              <Button variant="outline" size="lg">
                <Calendar className="h-4 w-4 mr-2" />
                Week 18 Props
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
              
              {/* NFL-specific filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🏈 NFL Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { id: 'nfl-passing', label: 'Passing Props', icon: '🎯' },
                      { id: 'nfl-rushing', label: 'Rushing Props', icon: '🏃' },
                      { id: 'nfl-receiving', label: 'Receiving Props', icon: '🙌' },
                      { id: 'nfl-defense', label: 'Defense Props', icon: '🛡️' },
                      { id: 'nfl-kicking', label: 'Kicking Props', icon: '🦵' }
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

              {/* Weekly Matchups */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    This Week's Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weeklyMatchups.map((game, index) => (
                      <div key={index} className="p-3 rounded-lg bg-secondary/50">
                        <div className="font-medium text-sm">
                          {game.away} @ {game.home}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {game.spread} • {game.total}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {game.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* NFL Insights */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    NFL Week 18 Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-secondary/30">
                      <div className="text-2xl font-bold text-emerald-500">67%</div>
                      <div className="text-sm text-muted-foreground">QB Passing Yard Overs Hit Rate</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/30">
                      <div className="text-2xl font-bold text-blue-500">3.2x</div>
                      <div className="text-sm text-muted-foreground">Avg Rushing TD Props Multiplier</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/30">
                      <div className="text-2xl font-bold text-purple-500">89</div>
                      <div className="text-sm text-muted-foreground">Total Player Props Available</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* High Value NFL Props */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🏈 High Value NFL Props</h2>
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
                    View All NFL Props
                  </Button>
                </div>
              </div>
              {loading && <div className="text-center py-4">Loading NFL analytics...</div>}
              {error && (
                <div className="text-center py-2 text-muted-foreground">
                  Live NFL analytics unavailable — showing fallback props.
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
                <h2 className="text-2xl font-bold">⚖️ Risk vs Reward</h2>
              </div>
              <RiskRewardAnalyzer availableBets={displayProps} />
            </div>

            {/* NFL Category Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🎯 NFL Passing Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.filter(prop => prop.stat.includes("Passing") || prop.stat.includes("Yards")).slice(0, 4).map((prop, index) => (
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

export default NFL;