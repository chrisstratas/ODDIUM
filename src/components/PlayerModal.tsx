import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Calendar, 
  Star, 
  Trophy,
  Activity,
  Clock,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSGP } from "@/contexts/SGPContext";

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  team: string;
  sport: string;
}


interface GameLog {
  date: string;
  opponent: string;
  stat: string;
  value: number;
  line: number;
  result: "Over" | "Under";
  odds: string;
  matchupGrade?: string;
  usageRate?: number;
  gameLocation?: "Home" | "Away";
}

interface UsageTrend {
  period: string;
  usage: number;
  efficiency: number;
  opportunities: number;
}

const PlayerModal = ({ isOpen, onClose, playerName, team, sport }: PlayerModalProps) => {
  const { addPick } = useSGP();
  const [confidenceFilter, setConfidenceFilter] = useState([75]);
  const [valueFilter, setValueFilter] = useState([60]);
  const [recentFormFilter, setRecentFormFilter] = useState([50]);
  const [hitRateFilter, setHitRateFilter] = useState([65]);
  const [gameLogsExpanded, setGameLogsExpanded] = useState(false);
  const [headToHeadData, setHeadToHeadData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Enhanced mock player data - in production this would come from database
  const playerStats = {
    seasonAvg: 25.4,
    recentForm: 27.8,
    hitRate: 73,
    confidence: 85,
    gamesPlayed: 45,
    totalProps: 156,
    winRate: 68.2,
    valueRating: "High",
    trend: "Up 15% vs season avg",
    matchupGrade: "A-",
    usageRate: 28.5,
    efficiency: 1.24,
    restDaysAvg: 1.2,
    homeAwayDiff: "+12% home"
  };

  // Comprehensive game logs with matchup analysis
  const recentGames: GameLog[] = [
    { 
      date: "2024-01-15", 
      opponent: "Lakers", 
      stat: "Points", 
      value: 28, 
      line: 25.5, 
      result: "Over", 
      odds: "-110",
      matchupGrade: "A",
      usageRate: 32.1,
      gameLocation: "Home"
    },
    { 
      date: "2024-01-13", 
      opponent: "Warriors", 
      stat: "Points", 
      value: 31, 
      line: 25.5, 
      result: "Over", 
      odds: "-110",
      matchupGrade: "A-",
      usageRate: 29.8,
      gameLocation: "Away"
    },
    { 
      date: "2024-01-11", 
      opponent: "Celtics", 
      stat: "Points", 
      value: 22, 
      line: 25.5, 
      result: "Under", 
      odds: "-110",
      matchupGrade: "C+",
      usageRate: 26.4,
      gameLocation: "Away"
    },
    { 
      date: "2024-01-09", 
      opponent: "Heat", 
      stat: "Points", 
      value: 29, 
      line: 25.5, 
      result: "Over", 
      odds: "-110",
      matchupGrade: "B+",
      usageRate: 30.7,
      gameLocation: "Home"
    },
    { 
      date: "2024-01-07", 
      opponent: "76ers", 
      stat: "Points", 
      value: 25, 
      line: 25.5, 
      result: "Under", 
      odds: "-110",
      matchupGrade: "B",
      usageRate: 27.9,
      gameLocation: "Home"
    }
  ];

  // Usage trends over time
  const usageTrends: UsageTrend[] = [
    { period: "Last 5 Games", usage: 29.8, efficiency: 1.28, opportunities: 24.2 },
    { period: "Last 10 Games", usage: 28.9, efficiency: 1.25, opportunities: 23.8 },
    { period: "Last 15 Games", usage: 28.1, efficiency: 1.22, opportunities: 23.1 },
    { period: "Season", usage: 27.6, efficiency: 1.19, opportunities: 22.7 }
  ];

  // Sport-specific props function
  const getSportSpecificProps = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'nba':
      case 'wnba':
        return [
          { 
            stat: "Points", 
            line: 25.5, 
            over: "-110", 
            under: "-110", 
            confidence: 85, 
            value: "High", 
            recent: "+2.4",
            matchupGrade: "A-",
            oddsMovement: "↗ From -115",
            sportsbooks: 4,
            edge: 6.8
          },
          { 
            stat: "Rebounds", 
            line: 8.5, 
            over: "+105", 
            under: "-125", 
            confidence: 78, 
            value: "Medium", 
            recent: "+1.2",
            matchupGrade: "B+",
            oddsMovement: "↘ From +100",
            sportsbooks: 3,
            edge: 4.2
          },
          { 
            stat: "Assists", 
            line: 7.5, 
            over: "-105", 
            under: "-115", 
            confidence: 82, 
            value: "High", 
            recent: "+0.8",
            matchupGrade: "A",
            oddsMovement: "→ Stable",
            sportsbooks: 5,
            edge: 5.1
          },
          { 
            stat: "3-Pointers", 
            line: 2.5, 
            over: "+115", 
            under: "-140", 
            confidence: 71, 
            value: "Medium", 
            recent: "+0.3",
            matchupGrade: "C+",
            oddsMovement: "↗ From +110",
            sportsbooks: 2,
            edge: 2.8
          }
        ];
      case 'nfl':
        return [
          { 
            stat: "Passing Yards", 
            line: 285.5, 
            over: "-110", 
            under: "-110", 
            confidence: 82, 
            value: "High", 
            recent: "+18.3",
            matchupGrade: "A",
            oddsMovement: "↗ From -115",
            sportsbooks: 5,
            edge: 7.2
          },
          { 
            stat: "Rush Attempts", 
            line: 18.5, 
            over: "-105", 
            under: "-115", 
            confidence: 76, 
            value: "Medium", 
            recent: "+1.4",
            matchupGrade: "B+",
            oddsMovement: "→ Stable",
            sportsbooks: 4,
            edge: 4.8
          },
          { 
            stat: "Receptions", 
            line: 5.5, 
            over: "+105", 
            under: "-125", 
            confidence: 79, 
            value: "High", 
            recent: "+0.7",
            matchupGrade: "A-",
            oddsMovement: "↘ From +110",
            sportsbooks: 3,
            edge: 5.1
          },
          { 
            stat: "Receiving Yards", 
            line: 75.5, 
            over: "-110", 
            under: "-110", 
            confidence: 73, 
            value: "Medium", 
            recent: "+8.2",
            matchupGrade: "B",
            oddsMovement: "↗ From -120",
            sportsbooks: 4,
            edge: 3.9
          }
        ];
      case 'mlb':
        return [
          { 
            stat: "Hits", 
            line: 1.5, 
            over: "-110", 
            under: "-110", 
            confidence: 74, 
            value: "Medium", 
            recent: "+0.3",
            matchupGrade: "B+",
            oddsMovement: "→ Stable",
            sportsbooks: 4,
            edge: 4.5
          },
          { 
            stat: "Strikeouts", 
            line: 7.5, 
            over: "+105", 
            under: "-125", 
            confidence: 81, 
            value: "High", 
            recent: "+1.2",
            matchupGrade: "A-",
            oddsMovement: "↗ From +100",
            sportsbooks: 5,
            edge: 6.3
          },
          { 
            stat: "Total Bases", 
            line: 2.5, 
            over: "-105", 
            under: "-115", 
            confidence: 77, 
            value: "Medium", 
            recent: "+0.4",
            matchupGrade: "B",
            oddsMovement: "↘ From -100",
            sportsbooks: 3,
            edge: 3.8
          },
          { 
            stat: "RBIs", 
            line: 1.5, 
            over: "+115", 
            under: "-140", 
            confidence: 68, 
            value: "Low", 
            recent: "+0.2",
            matchupGrade: "C+",
            oddsMovement: "→ Stable",
            sportsbooks: 2,
            edge: 2.1
          }
        ];
      case 'nhl':
        return [
          { 
            stat: "Goals", 
            line: 0.5, 
            over: "+160", 
            under: "-200", 
            confidence: 71, 
            value: "Medium", 
            recent: "+0.2",
            matchupGrade: "B",
            oddsMovement: "↗ From +155",
            sportsbooks: 4,
            edge: 4.2
          },
          { 
            stat: "Assists", 
            line: 0.5, 
            over: "+110", 
            under: "-135", 
            confidence: 76, 
            value: "High", 
            recent: "+0.3",
            matchupGrade: "A-",
            oddsMovement: "→ Stable",
            sportsbooks: 5,
            edge: 5.7
          },
          { 
            stat: "Shots on Goal", 
            line: 3.5, 
            over: "-110", 
            under: "-110", 
            confidence: 79, 
            value: "High", 
            recent: "+0.8",
            matchupGrade: "A",
            oddsMovement: "↘ From -105",
            sportsbooks: 3,
            edge: 6.1
          },
          { 
            stat: "Points", 
            line: 0.5, 
            over: "+105", 
            under: "-125", 
            confidence: 73, 
            value: "Medium", 
            recent: "+0.4",
            matchupGrade: "B+",
            oddsMovement: "↗ From +100",
            sportsbooks: 4,
            edge: 4.8
          }
        ];
      default:
        return [
          { 
            stat: "Performance", 
            line: 1.5, 
            over: "-110", 
            under: "-110", 
            confidence: 75, 
            value: "Medium", 
            recent: "+0.5",
            matchupGrade: "B",
            oddsMovement: "→ Stable",
            sportsbooks: 3,
            edge: 4.0
          }
        ];
    }
  };

  const handleAddPick = (prop: any, betType: 'over' | 'under') => {
    const odds = betType === 'over' ? prop.over : prop.under;
    const selection = `${betType.charAt(0).toUpperCase() + betType.slice(1)} ${prop.line}`;
    
    addPick({
      player: playerName,
      team: team,
      sport: sport,
      prop: prop.stat,
      selection: selection,
      line: prop.line,
      odds: odds,
      confidence: prop.confidence,
      betType: betType
    });
  };

  const props = getSportSpecificProps(sport);

  // Fetch head-to-head data
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchHeadToHeadData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('player_matchups')
          .select('*')
          .eq('player_name', playerName)
          .order('game_date', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        setHeadToHeadData(data || []);
      } catch (error) {
        console.error('Error fetching head-to-head data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeadToHeadData();
  }, [isOpen, playerName]);

  const getMatchupGradeColor = (grade: string) => {
    const letter = grade.charAt(0);
    switch (letter) {
      case "A": return "bg-green-100 text-green-800 border-green-200";
      case "B": return "bg-blue-100 text-blue-800 border-blue-200";
      case "C": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "D": return "bg-orange-100 text-orange-800 border-orange-200";
      case "F": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUsageChange = (current: number, previous: number) => {
    const change = current - previous;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
      color: change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-600"
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-warning" />
              <span className="text-2xl font-bold">{playerName}</span>
              <Badge variant="secondary">{team}</Badge>
              <Badge variant="outline">{sport}</Badge>
              <Badge className={getMatchupGradeColor(playerStats.matchupGrade)}>
                Grade: {playerStats.matchupGrade}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Comprehensive analytics, matchup analysis, and betting insights for {playerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhanced Player Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">{playerStats.seasonAvg}</div>
                <div className="text-sm text-blue-700">Season Avg</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <div className="text-2xl font-bold text-green-600">{playerStats.recentForm}</div>
                <div className="text-sm text-green-700">Recent Form</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Target className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                <div className="text-2xl font-bold text-yellow-600">{playerStats.hitRate}%</div>
                <div className="text-sm text-yellow-700">Hit Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <Activity className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">{playerStats.usageRate}%</div>
                <div className="text-sm text-purple-700">Usage Rate</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <CardContent className="p-4 text-center">
                <Zap className="h-5 w-5 mx-auto mb-1 text-indigo-600" />
                <div className="text-2xl font-bold text-indigo-600">{playerStats.efficiency}</div>
                <div className="text-sm text-indigo-700">Efficiency</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Tabs */}
          <Tabs defaultValue="props" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="props">Current Props</TabsTrigger>
              <TabsTrigger value="matchups">Matchup Grades</TabsTrigger>
              <TabsTrigger value="logs">Game Logs</TabsTrigger>
              <TabsTrigger value="usage">Usage Trends</TabsTrigger>
              <TabsTrigger value="head2head">Head-to-Head</TabsTrigger>
            </TabsList>

            <TabsContent value="props" className="space-y-4">
              <div className="grid gap-4">
                {props.map((prop, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-lg">{prop.stat}</div>
                          <Badge variant="outline">Line: {prop.line}</Badge>
                          <Badge variant={prop.value === "High" ? "default" : "secondary"}>
                            {prop.value} Value
                          </Badge>
                          <Badge className={getMatchupGradeColor(prop.matchupGrade)}>
                            {prop.matchupGrade}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm flex items-center gap-2">
                            <span className="text-muted-foreground">O/U: </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddPick(prop, 'over')}
                              className="text-positive-odds font-medium hover:bg-green-50 px-2 py-1 h-auto"
                            >
                              {prop.over}
                            </Button>
                            <span className="text-muted-foreground"> / </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddPick(prop, 'under')}
                              className="text-negative-odds font-medium hover:bg-red-50 px-2 py-1 h-auto"
                            >
                              {prop.under}
                            </Button>
                          </div>
                          <div className="text-xs text-center">
                            <div className="font-medium">Edge: +{prop.edge}%</div>
                            <div className="text-muted-foreground">{prop.sportsbooks} books</div>
                          </div>
                          <div className="text-xs text-center">
                            <div className="font-medium text-positive-odds">{prop.recent}</div>
                            <div className="text-muted-foreground">{prop.oddsMovement}</div>
                          </div>
                          <Badge variant="outline">{prop.confidence}% Conf</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="matchups" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Matchup Analysis & Grades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Opponent Defensive Rankings</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">vs Points Allowed</span>
                          <Badge className="bg-green-100 text-green-800">28th (worst)</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">vs Position</span>
                          <Badge className="bg-yellow-100 text-yellow-800">15th</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pace Factor</span>
                          <Badge className="bg-blue-100 text-blue-800">6th (fast)</Badge>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Historical Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">vs This Opponent</span>
                          <span className="font-medium text-green-600">+3.2 avg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Similar Matchups</span>
                          <span className="font-medium text-green-600">72% over rate</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Rest Advantage</span>
                          <span className="font-medium text-blue-600">+1.8 on 2+ days</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Matchup Grade Breakdown</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="text-2xl font-bold text-green-600">A-</div>
                        <div className="text-sm text-green-700">Overall Grade</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">B+</div>
                        <div className="text-sm text-blue-700">Defensive Matchup</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="text-2xl font-bold text-green-600">A</div>
                        <div className="text-sm text-green-700">Pace/Style</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-600">B</div>
                        <div className="text-sm text-yellow-700">Rest/Travel</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recent Game Logs
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setGameLogsExpanded(!gameLogsExpanded)}
                    >
                      {gameLogsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {gameLogsExpanded ? 'Less' : 'More'} Details
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Opponent</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Line</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Grade</TableHead>
                        {gameLogsExpanded && <TableHead>Usage%</TableHead>}
                        {gameLogsExpanded && <TableHead>Odds</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentGames.map((game, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{game.date}</TableCell>
                          <TableCell>{game.opponent}</TableCell>
                          <TableCell>
                            <Badge variant={game.gameLocation === "Home" ? "default" : "outline"}>
                              {game.gameLocation}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{game.value}</TableCell>
                          <TableCell className="text-muted-foreground">{game.line}</TableCell>
                          <TableCell>
                            <Badge variant={game.result === "Over" ? "default" : "secondary"}>
                              {game.result}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getMatchupGradeColor(game.matchupGrade || "B")}>
                              {game.matchupGrade}
                            </Badge>
                          </TableCell>
                          {gameLogsExpanded && (
                            <TableCell className="text-sm">
                              {game.usageRate?.toFixed(1)}%
                            </TableCell>
                          )}
                          {gameLogsExpanded && (
                            <TableCell className="text-sm text-muted-foreground">
                              {game.odds}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Usage & Efficiency Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {usageTrends.map((trend, index) => {
                      const prevTrend = usageTrends[index + 1];
                      const usageChange = prevTrend ? getUsageChange(trend.usage, prevTrend.usage) : null;
                      const efficiencyChange = prevTrend ? getUsageChange(trend.efficiency, prevTrend.efficiency) : null;
                      
                      return (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="font-medium">{trend.period}</div>
                              <Badge variant="outline">{trend.opportunities} opp/game</Badge>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Usage Rate</div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{trend.usage.toFixed(1)}%</span>
                                  {usageChange && (
                                    <span className={`text-xs ${usageChange.color}`}>
                                      {usageChange.direction === "up" ? "↗" : usageChange.direction === "down" ? "↘" : "→"}
                                      {usageChange.value}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Efficiency</div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{trend.efficiency.toFixed(2)}</span>
                                  {efficiencyChange && (
                                    <span className={`text-xs ${efficiencyChange.color}`}>
                                      {efficiencyChange.direction === "up" ? "↗" : efficiencyChange.direction === "down" ? "↘" : "→"}
                                      {efficiencyChange.value}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="w-24">
                                <Progress value={trend.usage} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card className="p-4 text-center">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <div className="text-lg font-bold">1.2</div>
                      <div className="text-sm text-muted-foreground">Avg Rest Days</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <div className="text-lg font-bold">{playerStats.homeAwayDiff}</div>
                      <div className="text-sm text-muted-foreground">Home Advantage</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                      <div className="text-lg font-bold">↗ Trending</div>
                      <div className="text-sm text-muted-foreground">Usage Direction</div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="head2head" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Head-to-Head Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Loading head-to-head data...</p>
                    </div>
                  ) : headToHeadData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Opponent</TableHead>
                          <TableHead>Stat</TableHead>
                          <TableHead>Player Value</TableHead>
                          <TableHead>Opponent Value</TableHead>
                          <TableHead>Result</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {headToHeadData.map((matchup, index) => (
                          <TableRow key={index}>
                            <TableCell>{new Date(matchup.game_date).toLocaleDateString()}</TableCell>
                            <TableCell>{matchup.opponent_name}</TableCell>
                            <TableCell>{matchup.stat_type}</TableCell>
                            <TableCell className="font-medium">{matchup.player_value}</TableCell>
                            <TableCell className="font-medium">{matchup.opponent_value}</TableCell>
                            <TableCell>
                              <Badge variant={matchup.result === "Win" ? "default" : "secondary"}>
                                {matchup.result}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        No head-to-head data available for {playerName}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
                </div>
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
                </div>
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
                </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerModal;