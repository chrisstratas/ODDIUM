import { useState } from "react";
import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import DailySchedule from "@/components/DailySchedule";
import BettingInsights from "@/components/BettingInsights";
import EdgeCategories from "@/components/EdgeCategories";
import EdgeOpportunityCard from "@/components/EdgeOpportunityCard";
import { useEdgeOpportunities } from "@/hooks/useEdgeOpportunities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Zap, RefreshCw, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [selectedSport, setSelectedSport] = useState("NFL");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isPopulatingData, setIsPopulatingData] = useState(false);
  
  const { 
    opportunities, 
    loading: opportunitiesLoading,
    refetch: refetchOpportunities
  } = useEdgeOpportunities({
    category: selectedCategory || undefined,
    sport: selectedSport,
    minEdge: 5,
    minConfidence: 70
  });

  const populateLiveData = async () => {
    setIsPopulatingData(true);
    try {
      const { data, error } = await supabase.functions.invoke('populate-live-data');
      
      if (error) {
        console.error('Error populating live data:', error);
        toast.error('Failed to populate live data');
        return;
      }

      toast.success('Live data populated successfully! Refreshing opportunities...');
      
      // Refresh opportunities after populating data
      setTimeout(() => {
        refetchOpportunities();
      }, 1000);
      
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to populate live data');
    } finally {
      setIsPopulatingData(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Beat the House at Their Own Game
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
          </div>
        </div>

        <Tabs defaultValue="opportunities" className="w-full">
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
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Current Edge Opportunities
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Live opportunities across all five edge categories, updated in real-time
                </p>
              </CardHeader>
              <CardContent>
                {opportunitiesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {opportunities.map((opportunity) => (
                      <EdgeOpportunityCard
                        key={opportunity.id}
                        opportunity={opportunity}
                        onExplore={() => {
                          // Navigate to detailed analysis
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
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <EdgeCategories 
              onCategorySelect={setSelectedCategory}
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
      </main>
    </div>
  );
};

export default Index;