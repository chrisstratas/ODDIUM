import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ExternalFactor {
  id: string;
  type: 'hot_streak' | 'milestone' | 'weather' | 'altitude' | 'injury_concern' | 'rest' | 'motivation' | 'usage_spike';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  source: string;
  aiGenerated?: boolean;
}

export interface StreakAnalysis {
  type: 'hot' | 'cold' | 'consistent';
  streakLength: number;
  currentValue: number;
  avgValue: number;
  deviation: number;
  description: string;
}

export interface MilestoneTracker {
  type: 'career_high' | 'season_milestone' | 'achievement_threshold' | 'round_number';
  description: string;
  currentValue: number;
  targetValue: number;
  gamesRemaining?: number;
  likelihood: number;
}

interface UseExternalFactorsProps {
  playerName: string;
  team: string;
  stat: string;
  sport: string;
  line: number;
  gameDate?: string;
  homeTeam?: string;
  awayTeam?: string;
}

export const useExternalFactors = ({
  playerName,
  team,
  stat,
  sport,
  line,
  gameDate,
  homeTeam,
  awayTeam
}: UseExternalFactorsProps) => {
  const [factors, setFactors] = useState<ExternalFactor[]>([]);
  const [streakAnalysis, setStreakAnalysis] = useState<StreakAnalysis | null>(null);
  const [milestones, setMilestones] = useState<MilestoneTracker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeStreaks = (recentStats: any[]): StreakAnalysis | null => {
    if (recentStats.length < 5) return null;

    const values = recentStats.map(stat => parseFloat(stat.value?.toString() || '0'));
    const recent3 = values.slice(0, 3);
    const previous5 = values.slice(3, 8);
    
    const recent3Avg = recent3.reduce((a, b) => a + b, 0) / recent3.length;
    const previous5Avg = previous5.reduce((a, b) => a + b, 0) / previous5.length;
    const overallAvg = values.reduce((a, b) => a + b, 0) / values.length;
    
    const deviation = ((recent3Avg - previous5Avg) / previous5Avg) * 100;
    
    let type: 'hot' | 'cold' | 'consistent';
    let description: string;
    
    if (deviation > 15) {
      type = 'hot';
      description = `${playerName} is on a hot streak, averaging ${recent3Avg.toFixed(1)} ${stat.toLowerCase()} in last 3 games vs ${previous5Avg.toFixed(1)} in previous 5 (+${deviation.toFixed(1)}%).`;
    } else if (deviation < -15) {
      type = 'cold';
      description = `${playerName} has cooled off, averaging ${recent3Avg.toFixed(1)} ${stat.toLowerCase()} in last 3 games vs ${previous5Avg.toFixed(1)} in previous 5 (${deviation.toFixed(1)}%).`;
    } else {
      type = 'consistent';
      description = `${playerName} maintains consistent ${stat.toLowerCase()} production with minimal variance in recent games.`;
    }

    // Check for consecutive overs/unders
    const recentOverUnders = recent3.map(val => val > line ? 'over' : 'under');
    const streakLength = recentOverUnders.reduce((streak, current, index) => {
      if (index === 0 || current === recentOverUnders[index - 1]) {
        return streak + 1;
      }
      return 1;
    }, 1);

    if (streakLength >= 3) {
      const streakType = recentOverUnders[0];
      description += ` Currently on a ${streakLength}-game ${streakType} streak.`;
    }

    return {
      type,
      streakLength,
      currentValue: recent3Avg,
      avgValue: overallAvg,
      deviation,
      description
    };
  };

  const findMilestones = (recentStats: any[], seasonStats: any[]): MilestoneTracker[] => {
    const milestones: MilestoneTracker[] = [];
    const currentAvg = recentStats.length > 0 ? 
      recentStats.reduce((sum, stat) => sum + parseFloat(stat.value?.toString() || '0'), 0) / recentStats.length : 0;
    
    const seasonTotal = seasonStats.reduce((sum, stat) => sum + parseFloat(stat.value?.toString() || '0'), 0);
    const seasonAvg = seasonStats.length > 0 ? seasonTotal / seasonStats.length : 0;

    // Career milestone detection (round numbers)
    const roundNumbers = [1000, 2000, 3000, 5000, 10000, 15000, 20000, 25000, 30000];
    const estimatedCareerTotal = seasonTotal + (currentAvg * 20); // Rough estimate
    
    for (const milestone of roundNumbers) {
      if (estimatedCareerTotal > milestone * 0.9 && estimatedCareerTotal < milestone * 1.1) {
        milestones.push({
          type: 'career_high',
          description: `Approaching ${milestone} career ${stat.toLowerCase()}`,
          currentValue: Math.round(estimatedCareerTotal),
          targetValue: milestone,
          likelihood: Math.min(90, Math.max(10, 100 - Math.abs(estimatedCareerTotal - milestone) / milestone * 100))
        });
      }
    }

    // Season milestone detection
    if (sport === 'NBA' || sport === 'WNBA') {
      const projectedSeason = seasonTotal + (currentAvg * (82 - seasonStats.length));
      if (stat.includes('Points') && projectedSeason > 1500 && projectedSeason < 2200) {
        milestones.push({
          type: 'season_milestone',
          description: `On pace for 2000+ points this season`,
          currentValue: Math.round(projectedSeason),
          targetValue: 2000,
          gamesRemaining: Math.max(0, 82 - seasonStats.length),
          likelihood: projectedSeason >= 2000 ? 85 : 60
        });
      }
    }

    // Achievement thresholds
    if (currentAvg > line * 1.2) {
      milestones.push({
        type: 'achievement_threshold',
        description: `Significantly outperforming betting line recently`,
        currentValue: currentAvg,
        targetValue: line,
        likelihood: 75
      });
    }

    return milestones;
  };

  const generateExternalFactors = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get recent player stats
      const { data: recentStats, error: recentError } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_name', playerName)
        .eq('stat_type', stat)
        .gte('game_date', new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('game_date', { ascending: false })
        .limit(10);

      // Get season stats for milestone tracking
      const { data: seasonStats, error: seasonError } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_name', playerName)
        .eq('stat_type', stat)
        .gte('game_date', '2024-10-01')
        .order('game_date', { ascending: false });

      if (recentError || seasonError) {
        console.error('Error fetching stats:', recentError || seasonError);
      }

      const recentData = recentStats || [];
      const seasonData = seasonStats || [];

      // Analyze streaks
      const streakData = analyzeStreaks(recentData);
      setStreakAnalysis(streakData);

      // Find milestones
      const milestoneData = findMilestones(recentData, seasonData);
      setMilestones(milestoneData);

      // Generate external factors
      const externalFactors: ExternalFactor[] = [];

      // Hot streak factor
      if (streakData && streakData.type === 'hot') {
        externalFactors.push({
          id: 'hot_streak',
          type: 'hot_streak',
          title: `${playerName} Hot Streak`,
          description: streakData.description,
          impact: 'positive',
          confidence: Math.min(90, 50 + Math.abs(streakData.deviation)),
          priority: 'high',
          source: 'Statistical Analysis'
        });
      }

      // Cold streak factor
      if (streakData && streakData.type === 'cold') {
        externalFactors.push({
          id: 'cold_streak',
          type: 'hot_streak',
          title: `${playerName} Cold Streak`,
          description: streakData.description,
          impact: 'negative',
          confidence: Math.min(90, 50 + Math.abs(streakData.deviation)),
          priority: 'high',
          source: 'Statistical Analysis'
        });
      }

      // Milestone factors
      milestoneData.forEach((milestone, index) => {
        if (milestone.likelihood > 60) {
          externalFactors.push({
            id: `milestone_${index}`,
            type: 'milestone',
            title: 'Milestone Motivation',
            description: milestone.description,
            impact: 'positive',
            confidence: milestone.likelihood,
            priority: milestone.likelihood > 80 ? 'high' : 'medium',
            source: 'Milestone Tracker'
          });
        }
      });

      // Rest/fatigue analysis based on recent games
      if (recentData.length >= 3) {
        const lastThreeGames = recentData.slice(0, 3);
        const gamesInLast7Days = lastThreeGames.filter(game => {
          const gameDate = new Date(game.game_date);
          const daysAgo = (Date.now() - gameDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysAgo <= 7;
        });

        if (gamesInLast7Days.length >= 3) {
          externalFactors.push({
            id: 'fatigue_concern',
            type: 'rest',
            title: 'Heavy Schedule',
            description: `${playerName} has played ${gamesInLast7Days.length} games in the last 7 days, potential fatigue factor.`,
            impact: 'negative',
            confidence: 65,
            priority: 'medium',
            source: 'Schedule Analysis'
          });
        } else if (gamesInLast7Days.length <= 1) {
          externalFactors.push({
            id: 'rest_advantage',
            type: 'rest',
            title: 'Well Rested',
            description: `${playerName} is well-rested with minimal games in the last week.`,
            impact: 'positive',
            confidence: 70,
            priority: 'medium',
            source: 'Schedule Analysis'
          });
        }
      }

      // Weather factors for outdoor sports
      if (sport === 'NFL' || sport === 'MLB') {
        // This would normally integrate with weather API
        // For now, we'll generate sample weather factors
        const weatherFactors = [
          {
            condition: 'cold',
            description: 'Cold weather expected, may favor ground game over passing',
            impact: stat.includes('Passing') ? 'negative' : (stat.includes('Rushing') ? 'positive' : 'neutral')
          },
          {
            condition: 'wind',
            description: 'High winds forecasted, could impact passing accuracy',
            impact: stat.includes('Passing') ? 'negative' : 'neutral'
          },
          {
            condition: 'dome',
            description: 'Game in controlled environment, optimal conditions',
            impact: 'positive'
          }
        ];

        // Randomly select a weather factor for demo (in real app, this would be based on actual weather data)
        if (Math.random() > 0.7) {
          const randomWeather = weatherFactors[Math.floor(Math.random() * weatherFactors.length)];
          externalFactors.push({
            id: 'weather_factor',
            type: 'weather',
            title: 'Weather Impact',
            description: randomWeather.description,
            impact: randomWeather.impact as 'positive' | 'negative' | 'neutral',
            confidence: 75,
            priority: 'medium',
            source: 'Weather Forecast'
          });
        }
      }

      // Altitude factor for specific venues
      if (team === 'DEN' || awayTeam === 'DEN' || homeTeam === 'DEN') {
        externalFactors.push({
          id: 'altitude_factor',
          type: 'altitude',
          title: 'Denver Altitude Effect',
          description: 'High altitude in Denver can affect player performance and ball flight',
          impact: sport === 'MLB' ? 'positive' : 'neutral',
          confidence: 60,
          priority: 'low',
          source: 'Venue Analysis'
        });
      }

      // Usage spike detection
      if (recentData.length >= 5) {
        const recent3Usage = recentData.slice(0, 3).map(s => parseFloat(s.value?.toString() || '0'));
        const previous3Usage = recentData.slice(3, 6).map(s => parseFloat(s.value?.toString() || '0'));
        
        const recentAvg = recent3Usage.reduce((a, b) => a + b, 0) / recent3Usage.length;
        const previousAvg = previous3Usage.reduce((a, b) => a + b, 0) / previous3Usage.length;
        
        if (recentAvg > previousAvg * 1.25) {
          externalFactors.push({
            id: 'usage_spike',
            type: 'usage_spike',
            title: 'Increased Role',
            description: `${playerName} showing increased ${stat.toLowerCase()} usage in recent games, possibly due to team changes or injuries`,
            impact: 'positive',
            confidence: 80,
            priority: 'high',
            source: 'Usage Analysis'
          });
        }
      }

      setFactors(externalFactors);

      // Call OpenAI for additional insights if we have data
      if (recentData.length > 0) {
        await generateAIInsights(recentData, externalFactors);
      }

    } catch (err) {
      console.error('Error analyzing external factors:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze external factors');
    } finally {
      setLoading(false);
    }
  };

  const generateAIInsights = async (recentStats: any[], currentFactors: ExternalFactor[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('sports-insights-ai', {
        body: {
          sport,
          playerName,
          analysisType: 'external_factors',
          recentStats: recentStats.slice(0, 5),
          currentFactors,
          stat,
          line,
          team
        }
      });

      if (error) {
        console.error('Error getting AI insights:', error);
        return;
      }

      if (data?.insights) {
        // Parse AI insights and add them as factors
        const aiFactors: ExternalFactor[] = data.insights.map((insight: any, index: number) => ({
          id: `ai_insight_${index}`,
          type: insight.type || 'motivation',
          title: insight.title || 'AI Insight',
          description: insight.description,
          impact: insight.impact || 'neutral',
          confidence: insight.confidence || 70,
          priority: insight.priority || 'medium',
          source: 'AI Analysis',
          aiGenerated: true
        }));

        setFactors(prev => [...prev, ...aiFactors]);
      }
    } catch (err) {
      console.error('Error generating AI insights:', err);
    }
  };

  useEffect(() => {
    if (playerName && stat && sport) {
      generateExternalFactors();
    }
  }, [playerName, stat, sport, line]);

  return {
    factors,
    streakAnalysis,
    milestones,
    loading,
    error,
    refetch: generateExternalFactors
  };
};