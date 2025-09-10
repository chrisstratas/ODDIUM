import { useMemo } from 'react';

interface BetOption {
  id?: string;
  player: string;
  stat: string;
  line: number;
  overOdds: string;
  underOdds: string;
  confidence: number;
  valueRating: "high" | "medium" | "low";
  edge?: number; // Make edge optional since it might not exist in all data
  team?: string;
  trend?: "up" | "down";
  isPopular?: boolean;
  recentForm?: string;
  seasonAvg?: number;
  hitRate?: number;
  sportsbook?: string;
  lastUpdated?: string;
}

interface RiskRewardMetrics {
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  potentialPayout: number;
  breakEvenRate: number;
  riskScore: number;
  rewardMultiplier: number;
  category: 'safe-builder' | 'balanced-growth' | 'moonshot';
}

interface ParlayScenario {
  betAmount: number;
  legs: BetOption[];
  totalOdds: number;
  potentialPayout: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  breakEvenProbability: number;
}

export const useRiskReward = (availableBets: BetOption[]) => {
  const calculateOddsValue = (odds: string): number => {
    const numOdds = parseInt(odds);
    if (numOdds > 0) {
      return numOdds / 100;
    } else {
      return 100 / Math.abs(numOdds);
    }
  };

  const calculateRiskMetrics = (bet: BetOption, side: 'over' | 'under'): RiskRewardMetrics => {
    const odds = side === 'over' ? bet.overOdds : bet.underOdds;
    const oddsValue = calculateOddsValue(odds);
    const potentialPayout = oddsValue;
    
    // Calculate break-even rate (what percentage you need to win to break even)
    const breakEvenRate = 1 / (1 + oddsValue);
    
    // Risk score based on confidence, edge, and odds
    const confidenceScore = bet.confidence / 100;
    const edgeScore = (bet.edge || 0) / 100;
    const oddsRisk = Math.min(oddsValue / 5, 1); // Higher odds = higher risk
    
    const riskScore = (1 - confidenceScore) * 0.4 + (1 - edgeScore) * 0.3 + oddsRisk * 0.3;
    
    // Determine risk level
    let riskLevel: 'conservative' | 'moderate' | 'aggressive';
    let category: 'safe-builder' | 'balanced-growth' | 'moonshot';
    
    if (riskScore < 0.3 && potentialPayout < 1.5) {
      riskLevel = 'conservative';
      category = 'safe-builder';
    } else if (riskScore < 0.6 && potentialPayout < 3) {
      riskLevel = 'moderate';
      category = 'balanced-growth';
    } else {
      riskLevel = 'aggressive';
      category = 'moonshot';
    }

    return {
      riskLevel,
      potentialPayout,
      breakEvenRate: breakEvenRate * 100,
      riskScore: riskScore * 100,
      rewardMultiplier: potentialPayout,
      category
    };
  };

  const generateParlayScenarios = (): ParlayScenario[] => {
    const scenarios: ParlayScenario[] = [];
    
    // Conservative scenario - high confidence, lower odds
    const conservativeBets = availableBets
      .filter(bet => bet.confidence >= 80 && bet.valueRating === 'high')
      .slice(0, 3);
    
    if (conservativeBets.length >= 2) {
      const totalOdds = conservativeBets.reduce((acc, bet) => {
        const bestOdds = Math.max(calculateOddsValue(bet.overOdds), calculateOddsValue(bet.underOdds));
        return acc * (1 + bestOdds);
      }, 1);
      
      scenarios.push({
        betAmount: 10,
        legs: conservativeBets,
        totalOdds,
        potentialPayout: 10 * totalOdds,
        riskLevel: 'conservative',
        breakEvenProbability: conservativeBets.reduce((acc, bet) => acc * (bet.confidence / 100), 1) * 100
      });
    }

    // Moderate scenario - balanced risk/reward
    const moderateBets = availableBets
      .filter(bet => bet.confidence >= 60 && bet.confidence < 80)
      .slice(0, 4);
    
    if (moderateBets.length >= 3) {
      const totalOdds = moderateBets.reduce((acc, bet) => {
        const bestOdds = Math.max(calculateOddsValue(bet.overOdds), calculateOddsValue(bet.underOdds));
        return acc * (1 + bestOdds);
      }, 1);
      
      scenarios.push({
        betAmount: 5,
        legs: moderateBets,
        totalOdds,
        potentialPayout: 5 * totalOdds,
        riskLevel: 'moderate',
        breakEvenProbability: moderateBets.reduce((acc, bet) => acc * (bet.confidence / 100), 1) * 100
      });
    }

    // Aggressive scenario - high risk, high reward (targeting $1 -> $500+)
    const aggressiveBets = availableBets
      .filter(bet => {
        const maxOdds = Math.max(calculateOddsValue(bet.overOdds), calculateOddsValue(bet.underOdds));
        return maxOdds >= 2; // At least +200 odds
      })
      .slice(0, 6);
    
    if (aggressiveBets.length >= 4) {
      const totalOdds = aggressiveBets.reduce((acc, bet) => {
        const bestOdds = Math.max(calculateOddsValue(bet.overOdds), calculateOddsValue(bet.underOdds));
        return acc * (1 + bestOdds);
      }, 1);
      
      scenarios.push({
        betAmount: 1,
        legs: aggressiveBets,
        totalOdds,
        potentialPayout: 1 * totalOdds,
        riskLevel: 'aggressive',
        breakEvenProbability: aggressiveBets.reduce((acc, bet) => acc * (bet.confidence / 100), 1) * 100
      });
    }

    return scenarios;
  };

  const riskRewardData = useMemo(() => {
    const scenarios = generateParlayScenarios();
    
    const betsByRisk = {
      conservative: availableBets.filter(bet => {
        const overMetrics = calculateRiskMetrics(bet, 'over');
        const underMetrics = calculateRiskMetrics(bet, 'under');
        return overMetrics.riskLevel === 'conservative' || underMetrics.riskLevel === 'conservative';
      }),
      moderate: availableBets.filter(bet => {
        const overMetrics = calculateRiskMetrics(bet, 'over');
        const underMetrics = calculateRiskMetrics(bet, 'under');
        return overMetrics.riskLevel === 'moderate' || underMetrics.riskLevel === 'moderate';
      }),
      aggressive: availableBets.filter(bet => {
        const overMetrics = calculateRiskMetrics(bet, 'over');
        const underMetrics = calculateRiskMetrics(bet, 'under');
        return overMetrics.riskLevel === 'aggressive' || underMetrics.riskLevel === 'aggressive';
      })
    };

    return {
      scenarios,
      betsByRisk,
      calculateRiskMetrics
    };
  }, [availableBets]);

  return riskRewardData;
};