import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OddsMovement {
  player_name: string;
  stat_type: string;
  old_line: number;
  new_line: number;
  movement_size: number;
  sportsbook: string;
}

interface OddsMovementAlertProps {
  movements: OddsMovement[];
}

export const OddsMovementAlert = ({ movements }: OddsMovementAlertProps) => {
  if (movements.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Recent Line Movements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-3">
            {movements.map((movement, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-2 p-2 rounded-lg bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {movement.player_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {movement.stat_type} • {movement.sportsbook}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{movement.old_line}</span>
                  {movement.movement_size > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{movement.new_line}</span>
                  <Badge variant={Math.abs(movement.movement_size) >= 1 ? "default" : "secondary"}>
                    {movement.movement_size > 0 ? '+' : ''}{movement.movement_size.toFixed(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
