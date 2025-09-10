import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const BetSlip = () => {
  const bets = [
    {
      id: 1,
      player: "LeBron James",
      prop: "Points",
      selection: "Over 25.5",
      odds: "+110"
    }
  ];

  const isEmpty = bets.length === 0;

  return (
    <Card className="bg-gradient-card border-border shadow-card sticky top-24">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Bet Slip</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No bets selected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click on odds to add bets
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bets.map((bet) => (
              <div key={bet.id} className="border border-border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{bet.player}</p>
                    <p className="text-xs text-muted-foreground">
                      {bet.prop} {bet.selection}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-positive-odds font-semibold">
                    {bet.odds}
                  </span>
                  <Input 
                    placeholder="$0"
                    className="w-20 h-8 text-xs"
                  />
                </div>
              </div>
            ))}
            
            <div className="border-t border-border pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Total Stake:</span>
                <span className="text-sm font-medium">$0</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-sm">Potential Payout:</span>
                <span className="text-sm font-medium text-positive-odds">$0</span>
              </div>
              <Button className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
                Place Bet
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BetSlip;