import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, User } from "lucide-react";
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

  // Comprehensive player database
  const players = [
    // NBA Players
    { name: "LeBron James", team: "Los Angeles Lakers", sport: "NBA" },
    { name: "Stephen Curry", team: "Golden State Warriors", sport: "NBA" },
    { name: "Kevin Durant", team: "Phoenix Suns", sport: "NBA" },
    { name: "Giannis Antetokounmpo", team: "Milwaukee Bucks", sport: "NBA" },
    { name: "Luka Doncic", team: "Dallas Mavericks", sport: "NBA" },
    { name: "Jayson Tatum", team: "Boston Celtics", sport: "NBA" },
    { name: "Joel Embiid", team: "Philadelphia 76ers", sport: "NBA" },
    { name: "Nikola Jokic", team: "Denver Nuggets", sport: "NBA" },
    { name: "Damian Lillard", team: "Milwaukee Bucks", sport: "NBA" },
    { name: "Anthony Davis", team: "Los Angeles Lakers", sport: "NBA" },
    { name: "Kawhi Leonard", team: "Los Angeles Clippers", sport: "NBA" },
    { name: "Paul George", team: "Los Angeles Clippers", sport: "NBA" },
    { name: "Jimmy Butler", team: "Miami Heat", sport: "NBA" },
    { name: "Bam Adebayo", team: "Miami Heat", sport: "NBA" },
    { name: "Trae Young", team: "Atlanta Hawks", sport: "NBA" },
    { name: "Zion Williamson", team: "New Orleans Pelicans", sport: "NBA" },
    { name: "Ja Morant", team: "Memphis Grizzlies", sport: "NBA" },
    { name: "Devin Booker", team: "Phoenix Suns", sport: "NBA" },
    { name: "Donovan Mitchell", team: "Cleveland Cavaliers", sport: "NBA" },
    { name: "Tyrese Haliburton", team: "Indiana Pacers", sport: "NBA" },
    
    // NFL Players
    { name: "Josh Allen", team: "Buffalo Bills", sport: "NFL" },
    { name: "Patrick Mahomes", team: "Kansas City Chiefs", sport: "NFL" },
    { name: "Lamar Jackson", team: "Baltimore Ravens", sport: "NFL" },
    { name: "Joe Burrow", team: "Cincinnati Bengals", sport: "NFL" },
    { name: "Justin Herbert", team: "Los Angeles Chargers", sport: "NFL" },
    { name: "Dak Prescott", team: "Dallas Cowboys", sport: "NFL" },
    { name: "Jalen Hurts", team: "Philadelphia Eagles", sport: "NFL" },
    { name: "Tua Tagovailoa", team: "Miami Dolphins", sport: "NFL" },
    { name: "Christian McCaffrey", team: "San Francisco 49ers", sport: "NFL" },
    { name: "Derrick Henry", team: "Tennessee Titans", sport: "NFL" },
    { name: "Nick Chubb", team: "Cleveland Browns", sport: "NFL" },
    { name: "Josh Jacobs", team: "Las Vegas Raiders", sport: "NFL" },
    { name: "Saquon Barkley", team: "New York Giants", sport: "NFL" },
    { name: "Travis Kelce", team: "Kansas City Chiefs", sport: "NFL" },
    { name: "Tyreek Hill", team: "Miami Dolphins", sport: "NFL" },
    { name: "Davante Adams", team: "Las Vegas Raiders", sport: "NFL" },
    { name: "Cooper Kupp", team: "Los Angeles Rams", sport: "NFL" },
    { name: "Stefon Diggs", team: "Buffalo Bills", sport: "NFL" },
    { name: "DeAndre Hopkins", team: "Arizona Cardinals", sport: "NFL" },
    { name: "Mike Evans", team: "Tampa Bay Buccaneers", sport: "NFL" },
    
    // MLB Players
    { name: "Mike Trout", team: "Los Angeles Angels", sport: "MLB" },
    { name: "Mookie Betts", team: "Los Angeles Dodgers", sport: "MLB" },
    { name: "Aaron Judge", team: "New York Yankees", sport: "MLB" },
    { name: "Ronald Acuña Jr.", team: "Atlanta Braves", sport: "MLB" },
    { name: "Vladimir Guerrero Jr.", team: "Toronto Blue Jays", sport: "MLB" },
    { name: "Fernando Tatis Jr.", team: "San Diego Padres", sport: "MLB" },
    { name: "Juan Soto", team: "Washington Nationals", sport: "MLB" },
    { name: "Freddie Freeman", team: "Los Angeles Dodgers", sport: "MLB" },
    { name: "Gerrit Cole", team: "New York Yankees", sport: "MLB" },
    { name: "Jacob deGrom", team: "Texas Rangers", sport: "MLB" },
    { name: "Shane Bieber", team: "Cleveland Guardians", sport: "MLB" },
    { name: "Walker Buehler", team: "Los Angeles Dodgers", sport: "MLB" },
    { name: "Tyler Glasnow", team: "Tampa Bay Rays", sport: "MLB" },
    { name: "José Altuve", team: "Houston Astros", sport: "MLB" },
    { name: "Francisco Lindor", team: "New York Mets", sport: "MLB" },
    { name: "Trea Turner", team: "Philadelphia Phillies", sport: "MLB" },
    { name: "Bo Bichette", team: "Toronto Blue Jays", sport: "MLB" },
    { name: "Pete Alonso", team: "New York Mets", sport: "MLB" },
    { name: "Matt Olson", team: "Atlanta Braves", sport: "MLB" },
    { name: "Paul Goldschmidt", team: "St. Louis Cardinals", sport: "MLB" },
    
    // NHL Players
    { name: "Connor McDavid", team: "Edmonton Oilers", sport: "NHL" },
    { name: "Leon Draisaitl", team: "Edmonton Oilers", sport: "NHL" },
    { name: "Nathan MacKinnon", team: "Colorado Avalanche", sport: "NHL" },
    { name: "Auston Matthews", team: "Toronto Maple Leafs", sport: "NHL" },
    { name: "David Pastrnak", team: "Boston Bruins", sport: "NHL" },
    { name: "Mikko Rantanen", team: "Colorado Avalanche", sport: "NHL" },
    { name: "Erik Karlsson", team: "Pittsburgh Penguins", sport: "NHL" },
    { name: "Cale Makar", team: "Colorado Avalanche", sport: "NHL" },
    { name: "Victor Hedman", team: "Tampa Bay Lightning", sport: "NHL" },
    { name: "Igor Shesterkin", team: "New York Rangers", sport: "NHL" },
    { name: "Andrei Vasilevskiy", team: "Tampa Bay Lightning", sport: "NHL" },
    { name: "Frederik Andersen", team: "Carolina Hurricanes", sport: "NHL" },
    { name: "Sidney Crosby", team: "Pittsburgh Penguins", sport: "NHL" },
    { name: "Alexander Ovechkin", team: "Washington Capitals", sport: "NHL" },
    { name: "Artemi Panarin", team: "New York Rangers", sport: "NHL" },
    { name: "Mitch Marner", team: "Toronto Maple Leafs", sport: "NHL" },
    { name: "Jonathan Huberdeau", team: "Calgary Flames", sport: "NHL" },
    { name: "Johnny Gaudreau", team: "Columbus Blue Jackets", sport: "NHL" },
    { name: "Brad Marchand", team: "Boston Bruins", sport: "NHL" },
    { name: "Patrice Bergeron", team: "Boston Bruins", sport: "NHL" },
    
    // WNBA Players
    { name: "A'ja Wilson", team: "Las Vegas Aces", sport: "WNBA" },
    { name: "Breanna Stewart", team: "New York Liberty", sport: "WNBA" },
    { name: "Diana Taurasi", team: "Phoenix Mercury", sport: "WNBA" },
    { name: "Sue Bird", team: "Seattle Storm", sport: "WNBA" },
    { name: "Candace Parker", team: "Las Vegas Aces", sport: "WNBA" },
    { name: "Sabrina Ionescu", team: "New York Liberty", sport: "WNBA" },
    { name: "Kelsey Plum", team: "Las Vegas Aces", sport: "WNBA" },
    { name: "Jewell Loyd", team: "Seattle Storm", sport: "WNBA" },
    { name: "Arike Ogunbowale", team: "Dallas Wings", sport: "WNBA" },
    { name: "Skylar Diggins-Smith", team: "Phoenix Mercury", sport: "WNBA" },
    { name: "Jonquel Jones", team: "New York Liberty", sport: "WNBA" },
    { name: "Elena Delle Donne", team: "Washington Mystics", sport: "WNBA" },
    { name: "Chelsea Gray", team: "Las Vegas Aces", sport: "WNBA" },
    { name: "Courtney Vandersloot", team: "New York Liberty", sport: "WNBA" },
    { name: "Briann January", team: "Connecticut Sun", sport: "WNBA" },
    { name: "Tina Charles", team: "Seattle Storm", sport: "WNBA" },
    { name: "Sylvia Fowles", team: "Minnesota Lynx", sport: "WNBA" },
    { name: "Kahleah Copper", team: "Chicago Sky", sport: "WNBA" },
    { name: "Rhyne Howard", team: "Atlanta Dream", sport: "WNBA" },
    { name: "Nneka Ogwumike", team: "Seattle Storm", sport: "WNBA" }
  ];

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(inputValue.toLowerCase());
    const matchesSport = sport === "All" || player.sport === sport;
    return matchesSearch && matchesSport && inputValue.length > 1;
  }).slice(0, 6);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handlePlayerSelect = (player: typeof players[0]) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
    setInputValue(player.name);
    
    if (onChange) {
      onChange(player.name);
    }
    
    if (onPlayerSelect) {
      onPlayerSelect(player);
    }
  };

  const clearInput = () => {
    setInputValue("");
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
          {inputValue && (
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
        {inputValue && filteredPlayers.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              {filteredPlayers.map((player, index) => (
                <button
                  key={index}
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