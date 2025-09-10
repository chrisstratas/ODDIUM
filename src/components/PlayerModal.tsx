import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, BarChart3, Calendar, Star } from "lucide-react";

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  team: string;
  sport: string;
}

const PlayerModal = ({ isOpen, onClose, playerName, team, sport }: PlayerModalProps) => {
  const [confidenceFilter, setConfidenceFilter] = useState([75]);
  const [valueFilter, setValueFilter] = useState([60]);
  const [recentFormFilter, setRecentFormFilter] = useState([50]);
  const [hitRateFilter, setHitRateFilter] = useState([65]);

  // Mock player data - would come from database
  const playerStats = {
    seasonAvg: 25.4,
    recentForm: 27.8,
    hitRate: 73,
    confidence: 85,
    gamesPlayed: 45,
    totalProps: 156,
    winRate: 68.2,
    valueRating: "High",
    trend: "Up 15% vs season avg"
  };

  const recentGames = [
    { date: "2024-01-15", stat: "Points", value: 28, line: 25.5, result: "Over", odds: "-110" },
    { date: "2024-01-13", stat: "Points", value: 31, line: 25.5, result: "Over", odds: "-110" },
    { date: "2024-01-11", stat: "Points", value: 22, line: 25.5, result: "Under", odds: "-110" },
    { date: "2024-01-09", stat: "Points", value: 29, line: 25.5, result: "Over", odds: "-110" },
    { date: "2024-01-07", stat: "Points", value: 25, line: 25.5, result: "Under", odds: "-110" }
  ];

  const props = [
    { stat: "Points", line: 25.5, over: "-110", under: "-110", confidence: 85, value: "High", recent: "+2.4" },
    { stat: "Rebounds", line: 8.5, over: "+105", under: "-125", confidence: 78, value: "Medium", recent: "+1.2" },
    { stat: "Assists", line: 7.5, over: "-105", under: "-115", confidence: 82, value: "High", recent: "+0.8" },
    { stat: "3-Pointers", line: 2.5, over: "+115", under: "-140", confidence: 71, value: "Medium", recent: "+0.3" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-warning" />
              <span className="text-2xl font-bold">{playerName}</span>
              <Badge variant="secondary">{team}</Badge>
              <Badge variant="outline">{sport}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Advanced Analytics Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Advanced Analytics Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Confidence Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Confidence Threshold: {confidenceFilter[0]}%
                  </label>
                  <Slider
                    value={confidenceFilter}
                    onValueChange={setConfidenceFilter}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Filter props by minimum confidence rating
                  </p>
                </div>

                {/* Value Rating Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Value Rating: {valueFilter[0]}%
                  </label>
                  <Slider
                    value={valueFilter}
                    onValueChange={setValueFilter}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Filter by betting value percentage
                  </p>
                </div>

                {/* Recent Form Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Recent Form Weight: {recentFormFilter[0]}%
                  </label>
                  <Slider
                    value={recentFormFilter}
                    onValueChange={setRecentFormFilter}
                    max={100}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adjust weight of recent performance vs season average
                  </p>
                </div>

                {/* Hit Rate Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Minimum Hit Rate: {hitRateFilter[0]}%
                  </label>
                  <Slider
                    value={hitRateFilter}
                    onValueChange={setHitRateFilter}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Filter props by historical success rate
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setConfidenceFilter([75]);
                    setValueFilter([60]);
                    setRecentFormFilter([50]);
                    setHitRateFilter([65]);
                  }}
                >
                  Reset Filters
                </Button>
                <Button size="sm">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {/* Player Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{playerStats.seasonAvg}</div>
                <div className="text-sm text-muted-foreground">Season Avg</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-positive-odds">{playerStats.recentForm}</div>
                <div className="text-sm text-muted-foreground">Recent Form</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">{playerStats.hitRate}%</div>
                <div className="text-sm text-muted-foreground">Hit Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">{playerStats.confidence}%</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="props" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="props">Current Props</TabsTrigger>
              <TabsTrigger value="history">Recent Games</TabsTrigger>
              <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="props" className="space-y-4">
              <div className="grid gap-4">
                {props.map((prop, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{prop.stat}</div>
                          <Badge variant="outline">Line: {prop.line}</Badge>
                          <Badge variant={prop.value === "High" ? "default" : "secondary"}>
                            {prop.value} Value
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="text-muted-foreground">O/U: </span>
                            <span className="text-positive-odds">{prop.over}</span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-negative-odds">{prop.under}</span>
                          </div>
                          <Badge variant="outline">{prop.confidence}% Conf</Badge>
                          <div className="text-sm text-positive-odds">{prop.recent}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                {recentGames.map((game, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{game.date}</span>
                          <span className="text-muted-foreground">{game.stat}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">{game.value}</span>
                            <span className="text-muted-foreground"> vs {game.line}</span>
                          </div>
                          <Badge 
                            variant={game.result === "Over" ? "default" : "secondary"}
                          >
                            {game.result}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{game.odds}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-lg font-medium text-positive-odds">
                        {playerStats.trend}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Recent form indicates improved performance across key metrics
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• Strong home performance (+12% vs away)</div>
                      <div>• Better against weak defenses (+8% vs bottom 10)</div>
                      <div>• Rest advantage on 2+ days (+6% performance)</div>
                      <div>• Prime time games boost (+4% in national TV games)</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerModal;