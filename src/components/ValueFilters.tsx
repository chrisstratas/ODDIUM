import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";

interface ValueFiltersProps {
  onFiltersChange?: (filters: any) => void;
}

const ValueFilters = ({ onFiltersChange }: ValueFiltersProps) => {
  const [filters, setFilters] = useState({
    sortBy: 'value',
    category: 'all',
    confidence: 'all'
  });

  const { refreshAnalytics, loading } = useAnalytics(filters);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters = { sortBy: 'value', category: 'all', confidence: 'all' };
    setFilters(resetFilters);
    onFiltersChange?.(resetFilters);
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Smart Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshAnalytics}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Value Rating Filter */}
        <div>
          <label className="text-sm font-medium block mb-2">Value Rating</label>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Select value rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Values</SelectItem>
              <SelectItem value="high">High Value</SelectItem>
              <SelectItem value="medium">Medium Value</SelectItem>
              <SelectItem value="low">Low Value</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Confidence Filter */}
        <div>
          <label className="text-sm font-medium block mb-2">Confidence</label>
          <Select value={filters.confidence} onValueChange={(value) => handleFilterChange('confidence', value)}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Select confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="80">80%+ Confidence</SelectItem>
              <SelectItem value="70">70%+ Confidence</SelectItem>
              <SelectItem value="60">60%+ Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div>
          <label className="text-sm font-medium block mb-2">Sort By</label>
          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
            <SelectTrigger className="bg-muted border-border">
              <SelectValue placeholder="Sort by" />
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

        {/* Filter Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Filters</label>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-warning/20 border-warning text-warning"
              onClick={() => {
                handleFilterChange('sortBy', 'recent_form');
                handleFilterChange('confidence', '70');
              }}
            >
              🔥 Hot Streaks
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-accent/20 border-accent text-accent"
              onClick={() => {
                handleFilterChange('sortBy', 'edge');
                handleFilterChange('confidence', '60');
              }}
            >
              📈 Trending Up
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-positive-odds/20 border-positive-odds text-positive-odds"
              onClick={() => {
                handleFilterChange('sortBy', 'value');
                handleFilterChange('confidence', '80');
              }}
            >
              ⭐ Editor's Picks
            </Badge>
          </div>
        </div>

        <Button variant="outline" onClick={handleReset} className="w-full">
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default ValueFilters;