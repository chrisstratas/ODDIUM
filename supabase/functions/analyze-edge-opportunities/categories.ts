// Edge category definitions used for AI analysis
export const edgeCategories = {
  player_props: {
    id: 'player_props',
    title: 'Player Props',
    subtitle: 'Hidden gems in player betting',
    description: 'Sportsbooks focus on main games, leaving player prop lines less refined - your opportunity to find value.',
    whyItWorks: 'While books perfect their main game lines, they can\'t analyze every player prop with the same detail. You can use deeper stats to spot when lines don\'t match reality.',
    examples: [
      'Backup running back receiving yards',
      'Bench player rebounds in blowouts',
      'Third-string QB attempts in garbage time',
      'Role player three-pointers vs weak defense'
    ],
    difficulty: 'Intermediate',
    profitPotential: 'High',
    timeCommitment: 'Medium'
  },
  live_betting: {
    id: 'live_betting',
    title: 'Live Betting',
    subtitle: 'React faster than the robots',
    description: 'Game situations change instantly, but sportsbook computers take time to catch up - giving you a window.',
    whyItWorks: 'You\'re watching the game with human intuition while books rely on automated systems. When something big happens, you can often bet before their algorithms fully adjust.',
    examples: [
      'Star player gets injured on the field',
      'Weather suddenly changes the game plan',
      'Key player picks up early fouls',
      'Team momentum that computers miss'
    ],
    difficulty: 'Advanced',
    profitPotential: 'High',
    timeCommitment: 'High'
  },
  college_sports: {
    id: 'college_sports',
    title: 'College Sports',
    subtitle: 'Where the spotlight doesn\'t shine',
    description: 'Sportsbooks put their best analysts on primetime games, leaving smaller college games with softer lines.',
    whyItWorks: 'Every oddsmaker focuses on the big games everyone\'s watching. Meanwhile, that Tuesday night MAC basketball game? Much less scrutinized, much more opportunity.',
    examples: [
      'Mid-major conference basketball games',
      'Division II football matchups',
      'Early-round conference tournaments',
      'Weekday afternoon college games'
    ],
    difficulty: 'Intermediate',
    profitPotential: 'Medium',
    timeCommitment: 'Medium'
  },
  arbitrage: {
    id: 'arbitrage',
    title: 'Line Shopping',
    subtitle: 'Make sportsbooks compete for you',
    description: 'Different sportsbooks often disagree on the same game - find the best price or even guarantee profits.',
    whyItWorks: 'Each sportsbook has different customers and uses different models. When they disagree enough, you can sometimes bet both sides and win either way.',
    examples: [
      'Eagles -3 at one book, Cowboys +3.5 at another',
      'Over 45.5 vs Under 46.5 on the same game',
      'Player props with different numbers',
      'Bonus bets creating arbitrage chances'
    ],
    difficulty: 'Beginner',
    profitPotential: 'Low',
    timeCommitment: 'Medium'
  },
  derivative_markets: {
    id: 'derivative_markets',
    title: 'Alternative Markets',
    subtitle: 'When sportsbooks use shortcuts',
    description: 'Books often create these lines using simple formulas instead of deep analysis - your chance to outsmart the math.',
    whyItWorks: 'Instead of analyzing each market separately, books often just split main game lines in half. But some teams play differently in first halves, or certain periods.',
    examples: [
      'First-half totals (some teams start fast)',
      'Individual team totals (strength vs weakness)',
      'Hockey period betting (teams with strong thirds)',
      'Basketball quarter props (bench depth matters)'
    ],
    difficulty: 'Intermediate',
    profitPotential: 'Medium',
    timeCommitment: 'Low'
  }
};
