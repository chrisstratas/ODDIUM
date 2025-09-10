export interface Player {
  id: number;
  name: string;
  team: string;
  sport: string;
  position?: string;
  jersey_number?: number;
}

// TheSportsDB API endpoints (CORS enabled, free)
const SPORTS_APIS = {
  NFL: 'https://www.thesportsdb.com/api/v1/json/3/search_all_players.php?l=NFL',
  MLB: 'https://www.thesportsdb.com/api/v1/json/3/search_all_players.php?l=MLB',
  NHL: 'https://www.thesportsdb.com/api/v1/json/3/search_all_players.php?l=NHL',
  NBA: 'https://www.thesportsdb.com/api/v1/json/3/search_all_players.php?l=NBA',
  WNBA: 'https://www.thesportsdb.com/api/v1/json/3/search_all_players.php?l=WNBA'
};

class PlayerService {
  private cache = new Map<string, Player[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  async searchPlayers(query: string, sport: string = 'All'): Promise<Player[]> {
    if (query.length < 2) return [];

    try {
      if (sport === 'All') {
        // Search across all sports
        const allSports = ['NBA', 'NFL', 'MLB', 'NHL', 'WNBA'];
        const promises = allSports.map(s => this.fetchSportPlayers(query, s));
        const results = await Promise.allSettled(promises);
        
        const allPlayers: Player[] = [];
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            allPlayers.push(...result.value);
          }
        });
        
        return allPlayers.slice(0, 20);
      } else {
        // Search specific sport
        return await this.fetchSportPlayers(query, sport);
      }
    } catch (error) {
      console.error('Error searching players:', error);
      // Fallback to static data if API fails
      return this.getStaticPlayersForOtherSports(query, sport);
    }
  }

  private async fetchSportPlayers(query: string, sport: string): Promise<Player[]> {
    const cacheKey = `${sport}_${query}`;
    
    // Check cache first
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey)! > Date.now()) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const apiUrl = SPORTS_APIS[sport as keyof typeof SPORTS_APIS];
      if (!apiUrl) {
        throw new Error(`API not available for sport: ${sport}`);
      }

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`${sport} API request failed`);
      
      const data = await response.json();
      let players: Player[] = [];

      if (data.player) {
        // TheSportsDB returns all players, we need to filter by query
        players = data.player
          .filter((player: any) => 
            player.strPlayer.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 15)
          .map((player: any) => ({
            id: parseInt(player.idPlayer),
            name: player.strPlayer,
            team: player.strTeam || 'Free Agent',
            sport: sport,
            position: player.strPosition || 'N/A'
          }));
      }

      // Cache the results
      this.cache.set(cacheKey, players);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return players;
    } catch (error) {
      console.error(`${sport} API error:`, error);
      // Fallback to static data
      return this.getStaticPlayersForOtherSports(query, sport);
    }
  }

  private getStaticPlayersForOtherSports(query: string, sport: string): Player[] {
    const allPlayers = this.getComprehensivePlayerDatabase();
    
    return allPlayers.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(query.toLowerCase());
      const matchesSport = sport === 'All' || player.sport === sport;
      return matchesSearch && matchesSport;
    }).slice(0, 15);
  }

  private getComprehensivePlayerDatabase(): Player[] {
    return [
      // NFL Players (expanded list)
      { id: 1001, name: "Josh Allen", team: "Buffalo Bills", sport: "NFL", position: "QB" },
      { id: 1002, name: "Patrick Mahomes", team: "Kansas City Chiefs", sport: "NFL", position: "QB" },
      { id: 1003, name: "Lamar Jackson", team: "Baltimore Ravens", sport: "NFL", position: "QB" },
      { id: 1004, name: "Joe Burrow", team: "Cincinnati Bengals", sport: "NFL", position: "QB" },
      { id: 1005, name: "Justin Herbert", team: "Los Angeles Chargers", sport: "NFL", position: "QB" },
      { id: 1006, name: "Dak Prescott", team: "Dallas Cowboys", sport: "NFL", position: "QB" },
      { id: 1007, name: "Jalen Hurts", team: "Philadelphia Eagles", sport: "NFL", position: "QB" },
      { id: 1008, name: "Tua Tagovailoa", team: "Miami Dolphins", sport: "NFL", position: "QB" },
      { id: 1009, name: "Aaron Rodgers", team: "New York Jets", sport: "NFL", position: "QB" },
      { id: 1010, name: "Russell Wilson", team: "Denver Broncos", sport: "NFL", position: "QB" },
      { id: 1011, name: "Christian McCaffrey", team: "San Francisco 49ers", sport: "NFL", position: "RB" },
      { id: 1012, name: "Derrick Henry", team: "Tennessee Titans", sport: "NFL", position: "RB" },
      { id: 1013, name: "Nick Chubb", team: "Cleveland Browns", sport: "NFL", position: "RB" },
      { id: 1014, name: "Josh Jacobs", team: "Las Vegas Raiders", sport: "NFL", position: "RB" },
      { id: 1015, name: "Saquon Barkley", team: "Philadelphia Eagles", sport: "NFL", position: "RB" },
      { id: 1016, name: "Austin Ekeler", team: "Los Angeles Chargers", sport: "NFL", position: "RB" },
      { id: 1017, name: "Alvin Kamara", team: "New Orleans Saints", sport: "NFL", position: "RB" },
      { id: 1018, name: "Dalvin Cook", team: "New York Jets", sport: "NFL", position: "RB" },
      { id: 1019, name: "Travis Kelce", team: "Kansas City Chiefs", sport: "NFL", position: "TE" },
      { id: 1020, name: "Mark Andrews", team: "Baltimore Ravens", sport: "NFL", position: "TE" },
      { id: 1021, name: "George Kittle", team: "San Francisco 49ers", sport: "NFL", position: "TE" },
      { id: 1022, name: "Tyreek Hill", team: "Miami Dolphins", sport: "NFL", position: "WR" },
      { id: 1023, name: "Davante Adams", team: "Las Vegas Raiders", sport: "NFL", position: "WR" },
      { id: 1024, name: "Cooper Kupp", team: "Los Angeles Rams", sport: "NFL", position: "WR" },
      { id: 1025, name: "Stefon Diggs", team: "Buffalo Bills", sport: "NFL", position: "WR" },
      { id: 1026, name: "DeAndre Hopkins", team: "Tennessee Titans", sport: "NFL", position: "WR" },
      { id: 1027, name: "Mike Evans", team: "Tampa Bay Buccaneers", sport: "NFL", position: "WR" },
      { id: 1028, name: "A.J. Brown", team: "Philadelphia Eagles", sport: "NFL", position: "WR" },
      { id: 1029, name: "DK Metcalf", team: "Seattle Seahawks", sport: "NFL", position: "WR" },
      { id: 1030, name: "Calvin Ridley", team: "Jacksonville Jaguars", sport: "NFL", position: "WR" },

      // MLB Players (expanded list)
      { id: 2001, name: "Mike Trout", team: "Los Angeles Angels", sport: "MLB", position: "OF" },
      { id: 2002, name: "Mookie Betts", team: "Los Angeles Dodgers", sport: "MLB", position: "OF" },
      { id: 2003, name: "Aaron Judge", team: "New York Yankees", sport: "MLB", position: "OF" },
      { id: 2004, name: "Ronald Acuña Jr.", team: "Atlanta Braves", sport: "MLB", position: "OF" },
      { id: 2005, name: "Vladimir Guerrero Jr.", team: "Toronto Blue Jays", sport: "MLB", position: "1B" },
      { id: 2006, name: "Fernando Tatis Jr.", team: "San Diego Padres", sport: "MLB", position: "SS" },
      { id: 2007, name: "Juan Soto", team: "New York Yankees", sport: "MLB", position: "OF" },
      { id: 2008, name: "Freddie Freeman", team: "Los Angeles Dodgers", sport: "MLB", position: "1B" },
      { id: 2009, name: "Shohei Ohtani", team: "Los Angeles Dodgers", sport: "MLB", position: "DH/P" },
      { id: 2010, name: "José Altuve", team: "Houston Astros", sport: "MLB", position: "2B" },
      { id: 2011, name: "Francisco Lindor", team: "New York Mets", sport: "MLB", position: "SS" },
      { id: 2012, name: "Trea Turner", team: "Philadelphia Phillies", sport: "MLB", position: "SS" },
      { id: 2013, name: "Bo Bichette", team: "Toronto Blue Jays", sport: "MLB", position: "SS" },
      { id: 2014, name: "Pete Alonso", team: "New York Mets", sport: "MLB", position: "1B" },
      { id: 2015, name: "Matt Olson", team: "Atlanta Braves", sport: "MLB", position: "1B" },
      { id: 2016, name: "Paul Goldschmidt", team: "St. Louis Cardinals", sport: "MLB", position: "1B" },
      { id: 2017, name: "Gerrit Cole", team: "New York Yankees", sport: "MLB", position: "P" },
      { id: 2018, name: "Jacob deGrom", team: "Texas Rangers", sport: "MLB", position: "P" },
      { id: 2019, name: "Shane Bieber", team: "Cleveland Guardians", sport: "MLB", position: "P" },
      { id: 2020, name: "Walker Buehler", team: "Los Angeles Dodgers", sport: "MLB", position: "P" },
      { id: 2021, name: "Tyler Glasnow", team: "Los Angeles Dodgers", sport: "MLB", position: "P" },
      { id: 2022, name: "Spencer Strider", team: "Atlanta Braves", sport: "MLB", position: "P" },
      { id: 2023, name: "Sandy Alcantara", team: "Miami Marlins", sport: "MLB", position: "P" },
      { id: 2024, name: "Corbin Burnes", team: "Baltimore Orioles", sport: "MLB", position: "P" },
      { id: 2025, name: "Dylan Cease", team: "San Diego Padres", sport: "MLB", position: "P" },

      // NHL Players (expanded list)
      { id: 3001, name: "Connor McDavid", team: "Edmonton Oilers", sport: "NHL", position: "C" },
      { id: 3002, name: "Leon Draisaitl", team: "Edmonton Oilers", sport: "NHL", position: "C" },
      { id: 3003, name: "Nathan MacKinnon", team: "Colorado Avalanche", sport: "NHL", position: "C" },
      { id: 3004, name: "Auston Matthews", team: "Toronto Maple Leafs", sport: "NHL", position: "C" },
      { id: 3005, name: "David Pastrnak", team: "Boston Bruins", sport: "NHL", position: "RW" },
      { id: 3006, name: "Mikko Rantanen", team: "Colorado Avalanche", sport: "NHL", position: "RW" },
      { id: 3007, name: "Erik Karlsson", team: "Pittsburgh Penguins", sport: "NHL", position: "D" },
      { id: 3008, name: "Cale Makar", team: "Colorado Avalanche", sport: "NHL", position: "D" },
      { id: 3009, name: "Victor Hedman", team: "Tampa Bay Lightning", sport: "NHL", position: "D" },
      { id: 3010, name: "Igor Shesterkin", team: "New York Rangers", sport: "NHL", position: "G" },
      { id: 3011, name: "Andrei Vasilevskiy", team: "Tampa Bay Lightning", sport: "NHL", position: "G" },
      { id: 3012, name: "Frederik Andersen", team: "Carolina Hurricanes", sport: "NHL", position: "G" },
      { id: 3013, name: "Sidney Crosby", team: "Pittsburgh Penguins", sport: "NHL", position: "C" },
      { id: 3014, name: "Alexander Ovechkin", team: "Washington Capitals", sport: "NHL", position: "LW" },
      { id: 3015, name: "Artemi Panarin", team: "New York Rangers", sport: "NHL", position: "LW" },
      { id: 3016, name: "Mitch Marner", team: "Toronto Maple Leafs", sport: "NHL", position: "RW" },
      { id: 3017, name: "Jonathan Huberdeau", team: "Calgary Flames", sport: "NHL", position: "LW" },
      { id: 3018, name: "Johnny Gaudreau", team: "Columbus Blue Jackets", sport: "NHL", position: "LW" },
      { id: 3019, name: "Brad Marchand", team: "Boston Bruins", sport: "NHL", position: "LW" },
      { id: 3020, name: "Kirill Kaprizov", team: "Minnesota Wild", sport: "NHL", position: "LW" },
      { id: 3021, name: "Jack Hughes", team: "New Jersey Devils", sport: "NHL", position: "C" },
      { id: 3022, name: "Elias Pettersson", team: "Vancouver Canucks", sport: "NHL", position: "C" },
      { id: 3023, name: "Sebastian Aho", team: "Carolina Hurricanes", sport: "NHL", position: "C" },
      { id: 3024, name: "Matthew Tkachuk", team: "Florida Panthers", sport: "NHL", position: "LW" },
      { id: 3025, name: "Nikita Kucherov", team: "Tampa Bay Lightning", sport: "NHL", position: "RW" },

      // WNBA Players (expanded list)
      { id: 4001, name: "A'ja Wilson", team: "Las Vegas Aces", sport: "WNBA", position: "F" },
      { id: 4002, name: "Breanna Stewart", team: "New York Liberty", sport: "WNBA", position: "F" },
      { id: 4003, name: "Diana Taurasi", team: "Phoenix Mercury", sport: "WNBA", position: "G" },
      { id: 4004, name: "Candace Parker", team: "Las Vegas Aces", sport: "WNBA", position: "F" },
      { id: 4005, name: "Sabrina Ionescu", team: "New York Liberty", sport: "WNBA", position: "G" },
      { id: 4006, name: "Kelsey Plum", team: "Las Vegas Aces", sport: "WNBA", position: "G" },
      { id: 4007, name: "Jewell Loyd", team: "Seattle Storm", sport: "WNBA", position: "G" },
      { id: 4008, name: "Arike Ogunbowale", team: "Dallas Wings", sport: "WNBA", position: "G" },
      { id: 4009, name: "Skylar Diggins-Smith", team: "Phoenix Mercury", sport: "WNBA", position: "G" },
      { id: 4010, name: "Jonquel Jones", team: "New York Liberty", sport: "WNBA", position: "F" },
      { id: 4011, name: "Elena Delle Donne", team: "Washington Mystics", sport: "WNBA", position: "F" },
      { id: 4012, name: "Chelsea Gray", team: "Las Vegas Aces", sport: "WNBA", position: "G" },
      { id: 4013, name: "Courtney Vandersloot", team: "New York Liberty", sport: "WNBA", position: "G" },
      { id: 4014, name: "Tina Charles", team: "Seattle Storm", sport: "WNBA", position: "F" },
      { id: 4015, name: "Kahleah Copper", team: "Phoenix Mercury", sport: "WNBA", position: "G" },
      { id: 4016, name: "Rhyne Howard", team: "Atlanta Dream", sport: "WNBA", position: "G" },
      { id: 4017, name: "Nneka Ogwumike", team: "Seattle Storm", sport: "WNBA", position: "F" },
      { id: 4018, name: "Napheesa Collier", team: "Minnesota Lynx", sport: "WNBA", position: "F" },
      { id: 4019, name: "Dearica Hamby", team: "Los Angeles Sparks", sport: "WNBA", position: "F" },
      { id: 4020, name: "Kayla McBride", team: "Minnesota Lynx", sport: "WNBA", position: "G" },
      { id: 4021, name: "Jackie Young", team: "Las Vegas Aces", sport: "WNBA", position: "G" },
      { id: 4022, name: "Betnijah Laney-Hamilton", team: "New York Liberty", sport: "WNBA", position: "G" },
      { id: 4023, name: "Brionna Jones", team: "Connecticut Sun", sport: "WNBA", position: "F" },
      { id: 4024, name: "Alyssa Thomas", team: "Connecticut Sun", sport: "WNBA", position: "F" },
      { id: 4025, name: "DeWanna Bonner", team: "Connecticut Sun", sport: "WNBA", position: "G" },
    ];
  }
}

export const playerService = new PlayerService();