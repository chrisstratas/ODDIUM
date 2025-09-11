import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SGPPick {
  id: string;
  player: string;
  team: string;
  sport: string;
  prop: string;
  selection: string;
  line: number;
  odds: string;
  confidence: number;
  betType: 'over' | 'under';
}

interface SGPContextType {
  picks: SGPPick[];
  addPick: (pick: Omit<SGPPick, 'id'>) => void;
  removePick: (id: string) => void;
  clearPicks: () => void;
  getEstimatedOdds: () => string;
  getAverageConfidence: () => number;
}

const SGPContext = createContext<SGPContextType | undefined>(undefined);

export const useSGP = () => {
  const context = useContext(SGPContext);
  if (!context) {
    throw new Error('useSGP must be used within an SGPProvider');
  }
  return context;
};

interface SGPProviderProps {
  children: ReactNode;
}

export const SGPProvider: React.FC<SGPProviderProps> = ({ children }) => {
  const [picks, setPicks] = useState<SGPPick[]>([]);

  const addPick = (pick: Omit<SGPPick, 'id'>) => {
    const newPick: SGPPick = {
      ...pick,
      id: `${pick.player}-${pick.prop}-${pick.betType}-${Date.now()}`
    };
    
    // Check if same pick already exists and remove it
    setPicks(prev => {
      const filtered = prev.filter(p => 
        !(p.player === pick.player && p.prop === pick.prop && p.betType === pick.betType)
      );
      return [...filtered, newPick];
    });
  };

  const removePick = (id: string) => {
    setPicks(prev => prev.filter(pick => pick.id !== id));
  };

  const clearPicks = () => {
    setPicks([]);
  };

  const getEstimatedOdds = () => {
    if (picks.length === 0) return "+100";
    if (picks.length === 1) return picks[0].odds;
    
    // Simple parlay odds calculation (not exact, but reasonable estimate)
    const multiplier = picks.length * 2.5 + 1;
    return `+${Math.round(multiplier * 100)}`;
  };

  const getAverageConfidence = () => {
    if (picks.length === 0) return 0;
    return Math.round(picks.reduce((acc, pick) => acc + pick.confidence, 0) / picks.length);
  };

  return (
    <SGPContext.Provider
      value={{
        picks,
        addPick,
        removePick,
        clearPicks,
        getEstimatedOdds,
        getAverageConfidence
      }}
    >
      {children}
    </SGPContext.Provider>
  );
};