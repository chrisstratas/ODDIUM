import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface OddsButtonProps {
  label: string;
  odds: string;
  onClick?: () => void;
  variant?: "over" | "under" | "default";
  selected?: boolean;
  size?: "sm" | "md" | "lg";
}

const OddsButton = ({ 
  label, 
  odds, 
  onClick, 
  variant = "default",
  selected = false,
  size = "md"
}: OddsButtonProps) => {
  const [flashing, setFlashing] = useState(false);
  const isPositiveOdds = !odds.startsWith("-");

  useEffect(() => {
    // Simulate odds update flash
    setFlashing(true);
    const timer = setTimeout(() => setFlashing(false), 600);
    return () => clearTimeout(timer);
  }, [odds]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "h-16 text-sm";
      case "lg": return "h-24 text-lg";
      default: return "h-20 text-base";
    }
  };

  return (
    <Button
      onClick={onClick}
      className={`
        ${getSizeClasses()}
        flex flex-col items-center justify-center gap-1
        bg-gradient-glass backdrop-blur-sm
        border border-border/50
        hover:border-primary/50 hover:shadow-button
        transition-all duration-200
        active:scale-95
        ${selected ? 'border-primary bg-primary/10 shadow-odds' : ''}
        ${flashing ? 'animate-odds-flash' : ''}
        relative overflow-hidden
        group
      `}
    >
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <span className="text-xs text-muted-foreground uppercase tracking-wide z-10">
        {label}
      </span>
      <span className={`
        font-bold text-xl z-10
        ${isPositiveOdds ? 'text-positive-odds' : 'text-negative-odds'}
      `}>
        {odds}
      </span>
    </Button>
  );
};

export default OddsButton;
