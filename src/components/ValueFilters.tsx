import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, SortAsc } from "lucide-react";

const ValueFilters = () => {
  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="w-5 h-5" />
          Smart Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Value Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High Value Only</SelectItem>
              <SelectItem value="medium">Medium+ Value</SelectItem>
              <SelectItem value="all">All Values</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="80">80%+ Confidence</SelectItem>
              <SelectItem value="70">70%+ Confidence</SelectItem>
              <SelectItem value="60">60%+ Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Hit Rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="70">70%+ Hit Rate</SelectItem>
              <SelectItem value="60">60%+ Hit Rate</SelectItem>
              <SelectItem value="50">50%+ Hit Rate</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Value Rating</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
              <SelectItem value="hitrate">Hit Rate</SelectItem>
              <SelectItem value="recent">Recent Form</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
            🔥 Hot Streaks
          </Badge>
          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
            📈 Trending Up
          </Badge>
          <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
            ⭐ Editor's Picks
          </Badge>
        </div>

        <Button variant="outline" size="sm" className="w-full">
          <SortAsc className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default ValueFilters;