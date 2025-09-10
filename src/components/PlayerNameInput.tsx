import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, User, Loader2 } from "lucide-react";
import { usePlayerSearch } from "@/hooks/usePlayerSearch";
import { Player } from "@/services/playerService";
import PlayerModal from "./PlayerModal";

interface PlayerNameInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  sport?: string;
  className?: string;
  onPlayerSelect?: (player: { name: string; team: string; sport: string }) => void;
}

const PlayerNameInput = ({ 
  placeholder = "Enter player name...", 
  value = "", 
  onChange, 
  sport = "All",
  className = "",
  onPlayerSelect
}: PlayerNameInputProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    name: string;
    team: string;
    sport: string;
  } | null>(null);

  const { players, loading, searchPlayers, clearResults } = usePlayerSearch();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    
    if (newValue.length >= 2) {
      searchPlayers(newValue, sport);
    } else {
      clearResults();
    }
  };

  const handlePlayerSelect = (player: Player) => {
    const playerData = {
      name: player.name,
      team: player.team,
      sport: player.sport
    };
    
    setSelectedPlayer(playerData);
    setIsModalOpen(true);
    setInputValue(player.name);
    clearResults();
    
    if (onChange) {
      onChange(player.name);
    }
    
    if (onPlayerSelect) {
      onPlayerSelect(playerData);
    }
  };

  const clearInput = () => {
    setInputValue("");
    clearResults();
    if (onChange) {
      onChange("");
    }
  };

  return (
    <>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className={`pl-10 pr-10 bg-background border-border focus:border-primary ${className}`}
          />
          {loading && (
            <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {inputValue && !loading && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
              onClick={clearInput}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {inputValue && players.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              {players.map((player) => (
                <button
                  key={`${player.sport}-${player.id}`}
                  className="w-full text-left p-3 hover:bg-muted rounded-sm transition-colors border-b border-border/50 last:border-b-0"
                  onClick={() => handlePlayerSelect(player)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">{player.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {player.team} • {player.sport}
                          {player.position && ` • ${player.position}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      View Analytics →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results message */}
        {inputValue && !loading && players.length === 0 && inputValue.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50">
            <div className="p-4 text-center text-muted-foreground text-sm">
              No players found for "{inputValue}"
              {sport !== 'All' && ` in ${sport}`}
            </div>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <PlayerModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlayer(null);
          }}
          playerName={selectedPlayer.name}
          team={selectedPlayer.team}
          sport={selectedPlayer.sport}
        />
      )}
    </>
  );
};

export default PlayerNameInput;