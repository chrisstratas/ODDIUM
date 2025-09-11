import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Share2, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSGP } from "@/contexts/SGPContext";

const ParlayBuilder = () => {
  const { picks, removePick, clearPicks, getEstimatedOdds, getAverageConfidence } = useSGP();
  const isEmpty = picks.length === 0;
  const estimatedOdds = getEstimatedOdds();
  const avgConfidence = getAverageConfidence();

  const sportsbooks = [
    { name: "DraftKings", logo: "🟢" },
    { name: "FanDuel", logo: "🔵" },
    { name: "BetMGM", logo: "🟡" },
    { name: "Caesars", logo: "🟠" },
    { name: "PointsBet", logo: "🟣" }
  ];

  return (
    <Card className="bg-gradient-card border-border shadow-card sticky top-24">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">SGP Builder</CardTitle>
          {!isEmpty && (
            <Badge className="bg-positive-odds text-success-foreground">
              {avgConfidence}% Avg
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No picks selected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click on props to build your parlay
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Parlay Summary */}
            <div className="bg-secondary rounded-lg p-3 border border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Same Game Parlay</span>
                <span className="text-sm text-positive-odds font-bold">{estimatedOdds}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {picks.length} picks • Lakers vs Warriors
              </div>
            </div>

            {/* Individual Picks */}
            {picks.map((pick) => (
              <div key={pick.id} className="border border-border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{pick.player}</p>
                    <p className="text-xs text-muted-foreground">
                      {pick.prop} • {pick.selection}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {pick.team} • {pick.sport}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {pick.confidence}%
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => removePick(pick.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-positive-odds font-semibold">
                    {pick.odds}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Export to Sportsbooks */}
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium mb-3">Place on Your Sportsbook</h4>
              
              <Select>
                <SelectTrigger className="mb-3 bg-secondary border-border">
                  <SelectValue placeholder="Choose your sportsbook" />
                </SelectTrigger>
                <SelectContent>
                  {sportsbooks.map((book) => (
                    <SelectItem key={book.name} value={book.name.toLowerCase()}>
                      <div className="flex items-center gap-2">
                        <span>{book.logo}</span>
                        <span>{book.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <Button size="sm" variant="outline" className="text-xs">
                  <Copy className="w-3 h-3 mr-1" />
                  Copy Picks
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>

              <Button className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Sportsbook
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParlayBuilder;