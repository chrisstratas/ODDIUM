import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('AI Assistant request:', { messageCount: messages.length, context });

    // Define tools for the AI
    const tools = [
      {
        type: "function",
        function: {
          name: "fetch_edge_opportunities",
          description: "Fetches edge betting opportunities for specified sport/player",
          parameters: {
            type: "object",
            properties: {
              sport: { 
                type: "string", 
                enum: ["NBA", "NFL", "MLB", "NHL", "WNBA"],
                description: "Sport to analyze"
              },
              player: { 
                type: "string", 
                description: "Player name (optional)" 
              },
              category: { 
                type: "string",
                enum: ["player_props", "live_betting", "arbitrage", "derivative_markets"],
                description: "Category of edge opportunities"
              },
              minEdge: { 
                type: "number", 
                description: "Minimum edge percentage (default: 5)" 
              },
              minConfidence: { 
                type: "number", 
                description: "Minimum confidence score (default: 70)" 
              }
            },
            required: []
          }
        }
      },
      {
        type: "function",
        function: {
          name: "explain_edge",
          description: "Explains why a specific edge opportunity exists in detail",
          parameters: {
            type: "object",
            properties: {
              playerName: { type: "string", description: "Player name" },
              statType: { type: "string", description: "Stat type (e.g., Points, Rebounds)" },
              sport: { type: "string", description: "Sport" }
            },
            required: ["playerName", "statType", "sport"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "suggest_betting_strategy",
          description: "Suggests betting strategies based on current opportunities",
          parameters: {
            type: "object",
            properties: {
              sport: { 
                type: "string",
                enum: ["NBA", "NFL", "MLB", "NHL", "WNBA"],
                description: "Sport to analyze" 
              },
              bankroll: { 
                type: "number", 
                description: "User's bankroll in dollars (optional)" 
              },
              riskTolerance: { 
                type: "string",
                enum: ["conservative", "moderate", "aggressive"],
                description: "Risk tolerance level" 
              }
            },
            required: ["sport"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "load_live_data",
          description: "Fetches fresh data from SportsData IO for specified sports",
          parameters: {
            type: "object",
            properties: {
              sports: { 
                type: "array",
                items: { type: "string", enum: ["NBA", "NFL", "MLB", "NHL", "WNBA"] },
                description: "Array of sports to load data for"
              }
            },
            required: ["sports"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "analyze_player",
          description: "Deep dive analysis on a specific player's performance and trends",
          parameters: {
            type: "object",
            properties: {
              playerName: { type: "string", description: "Name of player" },
              sport: { type: "string", description: "Sport" },
              statType: { type: "string", description: "Stat to analyze (Points, Rebounds, etc.)" }
            },
            required: ["playerName", "sport"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_schedule",
          description: "Search game schedules by sport, team, date range, or status",
          parameters: {
            type: "object",
            properties: {
              sport: { 
                type: "string", 
                enum: ["NBA", "NFL", "MLB", "NHL", "WNBA", "all"],
                description: "Sport to search (or 'all' for all sports)"
              },
              team: { 
                type: "string", 
                description: "Team name to filter by (home or away)" 
              },
              dateFrom: { 
                type: "string", 
                description: "Start date in YYYY-MM-DD format (default: today)" 
              },
              dateTo: { 
                type: "string", 
                description: "End date in YYYY-MM-DD format (default: 7 days from now)" 
              },
              status: { 
                type: "string", 
                enum: ["scheduled", "live", "final"],
                description: "Game status filter"
              },
              limit: { 
                type: "number", 
                description: "Maximum number of games to return (default: 10)" 
              }
            },
            required: []
          }
        }
      }
    ];

    const systemPrompt = `You are an expert betting edge analyst assistant. You help users:
- Find profitable betting opportunities
- Understand why edges exist
- Make informed betting decisions
- Load and analyze sports data

Key principles:
- Always be concise, data-driven, and focus on value betting principles
- Never guarantee wins - explain probabilities and edges
- Be friendly but professional
- Use emojis sparingly for clarity (📊 for stats, 🎯 for opportunities, 💡 for insights)
- Current context: ${JSON.stringify(context)}

When responding:
1. If data is missing, suggest loading live data first
2. Always explain your reasoning with specific numbers
3. Highlight edge percentage and confidence scores
4. Mention best sportsbooks for odds when relevant`;

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        tools,
        tool_choice: 'auto'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message;

    // Handle tool calls
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      const toolResults = [];

      for (const toolCall of aiMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log('Tool call:', functionName, args);

        let result;

        switch (functionName) {
          case 'fetch_edge_opportunities':
            const { data: edgeData, error: edgeError } = await supabase.functions.invoke('analyze-edge-opportunities', {
              body: {
                sport: args.sport,
                category: args.category,
                minEdge: args.minEdge || 5,
                minConfidence: args.minConfidence || 70
              }
            });
            
            if (edgeError) {
              result = { error: edgeError.message };
            } else {
              result = { opportunities: edgeData.opportunities || [] };
            }
            break;

          case 'explain_edge':
            const { data: explainData, error: explainError } = await supabase.functions.invoke('ai-explain-edge', {
              body: args
            });
            
            if (explainError) {
              result = { error: explainError.message };
            } else {
              result = explainData;
            }
            break;

          case 'suggest_betting_strategy':
            const { data: strategyData, error: strategyError } = await supabase.functions.invoke('ai-betting-strategy', {
              body: args
            });
            
            if (strategyError) {
              result = { error: strategyError.message };
            } else {
              result = strategyData;
            }
            break;

          case 'load_live_data':
            const { data: loadData, error: loadError } = await supabase.functions.invoke('populate-all-sports-data', {
              body: { sports: args.sports }
            });
            
            if (loadError) {
              result = { error: loadError.message };
            } else {
              result = { success: true, message: 'Data loaded successfully' };
            }
            break;

          case 'analyze_player':
            // Fetch player stats and analytics
            const { data: statsData } = await supabase
              .from('player_stats')
              .select('*')
              .eq('player_name', args.playerName)
              .eq('sport', args.sport)
              .order('game_date', { ascending: false })
              .limit(10);

            const { data: analyticsData } = await supabase
              .from('prop_analytics')
              .select('*')
              .eq('player_name', args.playerName)
              .eq('sport', args.sport)
              .maybeSingle();

            result = {
              recentStats: statsData || [],
              analytics: analyticsData,
              statType: args.statType
            };
            break;

          case 'search_schedule':
            const today = new Date().toISOString().split('T')[0];
            const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            let query = supabase
              .from('games_schedule')
              .select('*')
              .order('game_date', { ascending: true })
              .order('game_time', { ascending: true });
            
            // Apply filters
            if (args.sport && args.sport !== 'all') {
              query = query.eq('sport', args.sport);
            }
            
            if (args.team) {
              query = query.or(`home_team.ilike.%${args.team}%,away_team.ilike.%${args.team}%`);
            }
            
            if (args.dateFrom) {
              query = query.gte('game_date', args.dateFrom);
            } else {
              query = query.gte('game_date', today);
            }
            
            if (args.dateTo) {
              query = query.lte('game_date', args.dateTo);
            } else {
              query = query.lte('game_date', sevenDaysLater);
            }
            
            if (args.status) {
              query = query.eq('status', args.status);
            }
            
            query = query.limit(args.limit || 10);
            
            const { data: games, error: gamesError } = await query;
            
            if (gamesError) {
              result = { error: gamesError.message };
            } else {
              result = {
                gamesFound: games.length,
                games: games.map((g: any) => ({
                  sport: g.sport,
                  matchup: `${g.away_team} @ ${g.home_team}`,
                  date: g.game_date,
                  time: g.game_time,
                  status: g.status,
                  venue: g.venue,
                  network: g.network
                }))
              };
            }
            break;

          default:
            result = { error: 'Unknown function' };
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: JSON.stringify(result)
        });
      }

      // Make second AI call with tool results
      const finalResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
            aiMessage,
            ...toolResults
          ]
        }),
      });

      const finalData = await finalResponse.json();
      const finalMessage = finalData.choices[0].message;

      return new Response(
        JSON.stringify({ 
          message: finalMessage.content,
          toolCalls: aiMessage.tool_calls.map((tc: any) => tc.function.name)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No tool calls, return AI response directly
    return new Response(
      JSON.stringify({ message: aiMessage.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-edge-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
