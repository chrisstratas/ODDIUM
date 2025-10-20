import { useState } from "react";
import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import DailySchedule from "@/components/DailySchedule";
import BettingInsights from "@/components/BettingInsights";
import EdgeCategories from "@/components/EdgeCategories";
import EdgeOpportunityCard from "@/components/EdgeOpportunityCard";
import { AIMessageBubble } from "@/components/AIMessageBubble";
import { useAIChat } from "@/hooks/useAIChat";
import { useEdgeOpportunities } from "@/hooks/useEdgeOpportunities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Zap, RefreshCw, Database, Bot, Send, Sparkles, LineChart, Settings, Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LiveDataManager } from "@/components/LiveDataManager";
import { AutoRefreshSettings } from "@/components/AutoRefreshSettings";
import { OddsMovementAlert } from "@/components/OddsMovementAlert";
import { formatDistanceToNow } from "date-fns";

const Index = () => {
  const [selectedSport, setSelectedSport] = useState("NFL");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isPopulatingData, setIsPopulatingData] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5 * 60 * 1000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastDataUpdate, setLastDataUpdate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("opportunities");
  
  const { 
    opportunities, 
    loading: opportunitiesLoading,
    refetch: refetchOpportunities,
    recentMovements
  } = useEdgeOpportunities({
    category: selectedCategory || undefined,
    sport: selectedSport,
    minEdge: 5,
    minConfidence: 70
  });


  const populateLiveData = async () => {
    setIsPopulatingData(true);
    toast.info('Fetching comprehensive sports data from Sports Data IO + The Odds API...');
    
    try {
      const { data, error } = await supabase.functions.invoke('populate-all-sports-data');
      
      if (error) {
        console.error('Error populating sports data:', error);
        
        if (error.message?.includes('API_KEY')) {
          toast.error('API key is not configured. Please add Sports Data IO and The Odds API keys in Supabase secrets.');
        } else {
          toast.error('Failed to populate sports data: ' + error.message);
        }
        return;
      }

      console.log('Sports data response:', data);
      
      toast.success(`Successfully loaded data: ${data?.summary?.players || 0} sports with player profiles, projections, stats, schedules, and odds!`);
      
      setLastDataUpdate(new Date());
      setTimeout(() => {
        refetchOpportunities();
      }, 1000);
      
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to populate sports data');
    } finally {
      setIsPopulatingData(false);
    }
  };

  const handleRefreshComplete = () => {
    setLastDataUpdate(new Date());
    refetchOpportunities();
  };

  const categoryFilters = [
    { id: '', label: 'All Categories' },
    { id: 'player_props', label: 'Player Props' },
    { id: 'live_betting', label: 'Live Betting' },
    { id: 'college_sports', label: 'College Sports' },
    { id: 'arbitrage', label: 'Arbitrage' },
    { id: 'derivative_markets', label: 'Derivatives' }
  ];

  return (
    <div className="min-h-screen bg-gradient-main">
      <Header />
      
      <LiveDataManager 
        enabled={autoRefreshEnabled}
        refreshInterval={refreshInterval}
        onRefreshComplete={handleRefreshComplete}
      />
      
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              ODDIUM
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find value in the five proven categories where sharp bettors consistently profit: 
              niche props, live betting, college sports, arbitrage, and derivative markets.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button 
              onClick={populateLiveData}
              disabled={isPopulatingData}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              {isPopulatingData ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Populating Data...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Load Live Data
                </>
              )}
            </Button>
            <Button 
              onClick={refetchOpportunities}
              variant="outline"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Opportunities
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="w-5 h-5 mr-2" />
              Auto-Refresh
            </Button>
          </div>
        </div>
        
        {/* Live Status Bar */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-card/50 border">
          <div className="flex items-center gap-3">
            {autoRefreshEnabled && (
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Auto-Refresh Active
                </span>
              </div>
            )}
            {lastDataUpdate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Last updated:</span>
                <Badge variant="secondary">
                  {formatDistanceToNow(lastDataUpdate, { addSuffix: true })}
                </Badge>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Edge Opportunities
              {opportunities.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {opportunities.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Edge Categories
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Live Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-6">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedCategory === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(filter.id)}
                >
                  {filter.label}
                  {filter.id && opportunities.filter(o => o.category === filter.id).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {opportunities.filter(o => o.category === filter.id).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-gradient-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Current Edge Opportunities
                      {selectedCategory && (
                        <Badge variant="outline" className="ml-2">
                          {categoryFilters.find(f => f.id === selectedCategory)?.label}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Live opportunities across all five edge categories, updated in real-time
                    </p>
                  </CardHeader>
                  <CardContent>
                    {opportunitiesLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                          <Card key={i} className="animate-pulse">
                            <CardContent className="p-4 space-y-3">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                              <div className="h-16 bg-muted rounded"></div>
                              <div className="h-8 bg-muted rounded"></div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : opportunities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {opportunities.map((opportunity) => (
                          <EdgeOpportunityCard
                            key={opportunity.id}
                            opportunity={opportunity}
                            onExplore={() => {
                              console.log('Exploring opportunity:', opportunity.id);
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">
                          No edge opportunities found matching current filters.
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Try adjusting your sport or category selection.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {recentMovements && recentMovements.length > 0 && (
                <div>
                  <OddsMovementAlert movements={recentMovements} />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <EdgeCategories 
              onCategorySelect={(categoryId) => {
                setSelectedCategory(categoryId);
                setActiveTab("opportunities");
              }}
              selectedCategory={selectedCategory}
            />
          </TabsContent>

          <TabsContent value="live" className="space-y-6">
            <SportCategories />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailySchedule sport={selectedSport} />
              <BettingInsights sport={selectedSport} />
            </div>
          </TabsContent>
        </Tabs>
        
        <AutoRefreshSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          currentInterval={refreshInterval}
          onIntervalChange={setRefreshInterval}
          autoRefreshEnabled={autoRefreshEnabled}
          onAutoRefreshChange={setAutoRefreshEnabled}
        />
      </main>
    </div>
  );
};

export default Index;