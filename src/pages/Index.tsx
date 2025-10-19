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
import { Target, TrendingUp, Zap, RefreshCw, Database, Bot, Send, Sparkles, LineChart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [selectedSport, setSelectedSport] = useState("NFL");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isPopulatingData, setIsPopulatingData] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
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

  const { messages, isLoading: aiLoading, sendMessage, clearMessages, updateContext } = useAIChat();

  // Update AI context when sport/category changes
  useState(() => {
    updateContext({ sport: selectedSport, category: selectedCategory });
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

  const handleSendMessage = async () => {
    if (!inputValue.trim() || aiLoading) return;
    
    const message = inputValue;
    setInputValue("");
    await sendMessage(message);
  };

  const quickActions = [
    {
      icon: Sparkles,
      label: "Find edges",
      message: "Show me the best edge opportunities right now"
    },
    {
      icon: TrendingUp,
      label: "Betting strategy",
      message: "Suggest a betting strategy for today"
    },
    {
      icon: LineChart,
      label: "Analyze player",
      message: "Analyze a specific player's performance"
    },
    {
      icon: Database,
      label: "Load data",
      message: "Load fresh sports data"
    }
  ];

  const handleQuickAction = (message: string) => {
    sendMessage(message);
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      <Header />
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
          </div>
        </div>

        <Tabs defaultValue="opportunities" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="opportunities" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Edge Opportunities
              {opportunities.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {opportunities.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Assistant
              {messages.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {messages.length}
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

          <TabsContent value="ai-assistant" className="space-y-6">
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  AI Edge Assistant
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ask questions, analyze opportunities, and get personalized betting strategies
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat Messages */}
                <ScrollArea className="h-[500px] pr-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Hi! I'm your Edge Assistant</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                          I can help you find betting edges, explain opportunities, suggest strategies, and load fresh data.
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                        {quickActions.map((action) => (
                          <Button
                            key={action.label}
                            variant="outline"
                            className="h-auto flex flex-col gap-2 p-4"
                            onClick={() => handleQuickAction(action.message)}
                          >
                            <action.icon className="w-5 h-5" />
                            <span className="text-xs">{action.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <AIMessageBubble
                          key={index}
                          role={message.role}
                          content={message.content}
                          timestamp={message.timestamp}
                        />
                      ))}
                      {aiLoading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <Bot className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="bg-muted rounded-lg px-4 py-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-75" />
                              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-150" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="space-y-3">
                  {messages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {quickActions.map((action) => (
                        <Button
                          key={action.label}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => handleQuickAction(action.message)}
                          disabled={aiLoading}
                        >
                          <action.icon className="w-3 h-3 mr-1" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about edges..."
                      disabled={aiLoading}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={aiLoading || !inputValue.trim()}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>

                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearMessages}
                      className="w-full"
                    >
                      Clear conversation
                    </Button>
                  )}
                </div>
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