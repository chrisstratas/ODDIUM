import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Trash2, DollarSign } from "lucide-react";
import { useSGP } from "@/contexts/SGPContext";
import { useState } from "react";

const ParlayBuilder = () => {
  const { picks, removePick, clearPicks, getEstimatedOdds, getAverageConfidence } = useSGP();
  const isEmpty = picks.length === 0;
  const estimatedOdds = getEstimatedOdds();
  const avgConfidence = getAverageConfidence();
  const [betAmount, setBetAmount] = useState<number>(0);
  
  const quickAmounts = [10, 25, 50, 100];
  
  const calculatePayout = () => {
    if (!betAmount || isEmpty) return 0;
    // Simple calculation - in real app would parse odds properly
    return (betAmount * 2.5).toFixed(2);
  };

  return (
    <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 sticky top-20">
      <CardHeader className="pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold">Bet Slip</CardTitle>
          {!isEmpty && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearPicks}
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {isEmpty ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/20 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium mb-1">No Bets Selected</p>
            <p className="text-xs text-muted-foreground">
              Click odds to add to bet slip
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Individual Picks */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {picks.map((pick) => (
                <div 
                  key={pick.id} 
                  className="bg-secondary/30 border border-border/30 rounded p-2.5 hover:border-border/50 transition-colors"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{pick.player}</p>
                      <p className="text-xs text-muted-foreground">
                        {pick.prop} • {pick.selection}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-positive-odds">
                          {pick.odds}
                        </span>
                        {pick.confidence && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            {pick.confidence}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                      onClick={() => removePick(pick.id)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Parlay Summary */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {picks.length} Leg Parlay
                </span>
                {avgConfidence > 0 && (
                  <Badge className="bg-positive-odds/20 text-positive-odds border-positive-odds/30 text-xs">
                    {avgConfidence}% Avg
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-bold text-positive-odds">
                {estimatedOdds}
              </div>
            </div>

            {/* Bet Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bet Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="0.00"
                  value={betAmount || ''}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="pl-9 bg-secondary border-border text-foreground h-11 text-lg font-semibold"
                />
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(amount)}
                    className="h-8 text-xs bg-secondary/50 hover:bg-primary/10 hover:border-primary/30"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Potential Payout */}
            {betAmount > 0 && (
              <div className="bg-gradient-accent/10 border border-accent/20 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Potential Payout
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    ${calculatePayout()}
                  </span>
                </div>
              </div>
            )}

            {/* Place Bet Button */}
            <Button 
              className="w-full h-12 bg-gradient-silver text-primary-foreground hover:opacity-90 font-bold text-base shadow-button"
              disabled={!betAmount || betAmount <= 0}
            >
              Place Bet
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              Bets are for demonstration purposes only
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParlayBuilder;
