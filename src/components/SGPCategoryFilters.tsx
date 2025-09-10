import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Activity, Target, TrendingUp, Zap } from "lucide-react";

interface SGPCategoryFiltersProps {
  onCategoryChange: (category: string) => void;
  onSortChange: (sortBy: string) => void;
  onConfidenceChange: (confidence: string) => void;
  selectedCategory: string;
  selectedSort: string;
  selectedConfidence: string;
}

const SGPCategoryFilters = ({
  onCategoryChange,
  onSortChange,
  onConfidenceChange,
  selectedCategory,
  selectedSort,
  selectedConfidence
}: SGPCategoryFiltersProps) => {
  const categories = [
    { id: 'all', label: 'All Props', icon: Target },
    { id: 'sgp-points', label: 'Points', icon: Activity },
    { id: 'sgp-rebounds', label: 'Rebounds', icon: TrendingUp },
    { id: 'sgp-assists', label: 'Assists', icon: Zap },
    { id: 'sgp-threes', label: '3-Pointers', icon: Target }
  ];

  const handleReset = () => {
    onCategoryChange('all');
    onSortChange('value');
    onConfidenceChange('all');
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">SGP Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Stat Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(({ id, label, icon: Icon }) => (
              <Badge
                key={id}
                variant={selectedCategory === id ? "default" : "secondary"}
                className={`cursor-pointer transition-all ${
                  selectedCategory === id 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-secondary-foreground/10"
                }`}
                onClick={() => onCategoryChange(id)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-medium block mb-2">Sort By</label>
          <Select value={selectedSort} onValueChange={onSortChange}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Value Rating</SelectItem>
              <SelectItem value="confidence">Confidence</SelectItem>
              <SelectItem value="edge">Edge %</SelectItem>
              <SelectItem value="hit_rate">Hit Rate</SelectItem>
              <SelectItem value="recent_form">Recent Form</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Confidence Filter */}
        <div>
          <label className="text-sm font-medium block mb-2">Min Confidence</label>
          <Select value={selectedConfidence} onValueChange={onConfidenceChange}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="60">60%+ Confidence</SelectItem>
              <SelectItem value="70">70%+ Confidence</SelectItem>
              <SelectItem value="80">80%+ Confidence</SelectItem>
              <SelectItem value="90">90%+ Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-warning/20 border-warning text-warning"
              onClick={() => {
                onSortChange('recent_form');
                onConfidenceChange('70');
              }}
            >
              🔥 Hot Streaks
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-accent/20 border-accent text-accent"
              onClick={() => {
                onSortChange('edge');
                onConfidenceChange('60');
              }}
            >
              📈 Trending Up
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-positive-odds/20 border-positive-odds text-positive-odds"
              onClick={() => {
                onSortChange('value');
                onConfidenceChange('80');
              }}
            >
              ⭐ Editor's Picks
            </Badge>
          </div>
        </div>

        <Button 
          variant="outline" 
          onClick={handleReset}
          className="w-full"
        >
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default SGPCategoryFilters;