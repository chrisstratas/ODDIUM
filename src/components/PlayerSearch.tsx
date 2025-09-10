import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import PlayerModal from "./PlayerModal";

interface PlayerSearchProps {
  sport?: string;
}

const PlayerSearch = ({ sport = "NBA" }: PlayerSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    name: string;
    team: string;
    sport: string;
  } | null>(null);

  // Mock player database - would come from actual database
  const players = [
    { name: "LeBron James", team: "Los Angeles Lakers", sport: "NBA" },
    { name: "Stephen Curry", team: "Golden State Warriors", sport: "NBA" },
    { name: "Josh Allen", team: "Buffalo Bills", sport: "NFL" },
    { name: "Gerrit Cole", team: "New York Yankees", sport: "MLB" },
    { name: "Connor McDavid", team: "Edmonton Oilers", sport: "NHL" },
    { name: "A'ja Wilson", team: "Las Vegas Aces", sport: "WNBA" }
  ];

  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (sport === "All" || player.sport === sport)
  );

  const handlePlayerSelect = (player: typeof players[0]) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={`Search ${sport} players...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredPlayers.length > 0 ? (
              <div className="p-2">
                {filteredPlayers.map((player, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-2 hover:bg-muted rounded-sm transition-colors"
                    onClick={() => handlePlayerSelect(player)}
                  >
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {player.team} • {player.sport}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No players found
              </div>
            )}
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

export default PlayerSearch;