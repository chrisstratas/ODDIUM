export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
        }
        Relationships: []
      }
      games_schedule: {
        Row: {
          away_record: string | null
          away_score: number | null
          away_team: string
          created_at: string
          data_source: string | null
          game_date: string
          game_id: string
          game_time: string
          home_record: string | null
          home_score: number | null
          home_team: string
          id: string
          network: string | null
          season_year: number
          sport: string
          status: string
          updated_at: string
          venue: string | null
          week_number: number | null
        }
        Insert: {
          away_record?: string | null
          away_score?: number | null
          away_team: string
          created_at?: string
          data_source?: string | null
          game_date: string
          game_id: string
          game_time: string
          home_record?: string | null
          home_score?: number | null
          home_team: string
          id?: string
          network?: string | null
          season_year?: number
          sport: string
          status?: string
          updated_at?: string
          venue?: string | null
          week_number?: number | null
        }
        Update: {
          away_record?: string | null
          away_score?: number | null
          away_team?: string
          created_at?: string
          data_source?: string | null
          game_date?: string
          game_id?: string
          game_time?: string
          home_record?: string | null
          home_score?: number | null
          home_team?: string
          id?: string
          network?: string | null
          season_year?: number
          sport?: string
          status?: string
          updated_at?: string
          venue?: string | null
          week_number?: number | null
        }
        Relationships: []
      }
      live_odds: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          last_updated: string
          line: number
          over_odds: string
          player_name: string
          sport: string | null
          sportsbook: string
          stat_type: string
          team: string
          under_odds: string
          value_rating: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          last_updated?: string
          line: number
          over_odds: string
          player_name: string
          sport?: string | null
          sportsbook: string
          stat_type: string
          team: string
          under_odds: string
          value_rating?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          last_updated?: string
          line?: number
          over_odds?: string
          player_name?: string
          sport?: string | null
          sportsbook?: string
          stat_type?: string
          team?: string
          under_odds?: string
          value_rating?: string | null
        }
        Relationships: []
      }
      parlay_picks: {
        Row: {
          bet_type: string
          confidence: number
          created_at: string
          id: string
          line: number
          odds: string
          parlay_id: string
          player_name: string
          prop_type: string
          user_id: string
        }
        Insert: {
          bet_type: string
          confidence: number
          created_at?: string
          id?: string
          line: number
          odds: string
          parlay_id: string
          player_name: string
          prop_type: string
          user_id: string
        }
        Update: {
          bet_type?: string
          confidence?: number
          created_at?: string
          id?: string
          line?: number
          odds?: string
          parlay_id?: string
          player_name?: string
          prop_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parlay_picks_parlay_id_fkey"
            columns: ["parlay_id"]
            isOneToOne: false
            referencedRelation: "parlays"
            referencedColumns: ["id"]
          },
        ]
      }
      parlays: {
        Row: {
          average_confidence: number | null
          created_at: string
          game_info: Json
          id: string
          name: string
          total_picks: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_confidence?: number | null
          created_at?: string
          game_info: Json
          id?: string
          name: string
          total_picks?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_confidence?: number | null
          created_at?: string
          game_info?: Json
          id?: string
          name?: string
          total_picks?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      player_matchups: {
        Row: {
          created_at: string
          game_date: string
          id: string
          opponent_name: string
          opponent_team: string
          opponent_value: number
          player_line: number | null
          player_name: string
          player_team: string
          player_value: number
          result: string | null
          season_year: number
          sport: string
          stat_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_date: string
          id?: string
          opponent_name: string
          opponent_team: string
          opponent_value: number
          player_line?: number | null
          player_name: string
          player_team: string
          player_value: number
          result?: string | null
          season_year?: number
          sport?: string
          stat_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_date?: string
          id?: string
          opponent_name?: string
          opponent_team?: string
          opponent_value?: number
          player_line?: number | null
          player_name?: string
          player_team?: string
          player_value?: number
          result?: string | null
          season_year?: number
          sport?: string
          stat_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          created_at: string
          game_date: string
          id: string
          player_name: string
          season_year: number
          source: string
          stat_type: string
          team: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          game_date: string
          id?: string
          player_name: string
          season_year: number
          source?: string
          stat_type: string
          team: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          game_date?: string
          id?: string
          player_name?: string
          season_year?: number
          source?: string
          stat_type?: string
          team?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          preferred_sportsbook: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          preferred_sportsbook?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_sportsbook?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prop_analytics: {
        Row: {
          calculated_at: string
          edge_percentage: number | null
          hit_rate: number | null
          id: string
          player_name: string
          recent_form: number | null
          season_average: number | null
          sport: string | null
          stat_type: string
          team: string
          trend_direction: string | null
        }
        Insert: {
          calculated_at?: string
          edge_percentage?: number | null
          hit_rate?: number | null
          id?: string
          player_name: string
          recent_form?: number | null
          season_average?: number | null
          sport?: string | null
          stat_type: string
          team: string
          trend_direction?: string | null
        }
        Update: {
          calculated_at?: string
          edge_percentage?: number | null
          hit_rate?: number | null
          id?: string
          player_name?: string
          recent_form?: number | null
          season_average?: number | null
          sport?: string | null
          stat_type?: string
          team?: string
          trend_direction?: string | null
        }
        Relationships: []
      }
      user_access: {
        Row: {
          access_code_id: string
          activated_at: string
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          access_code_id: string
          activated_at?: string
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          access_code_id?: string
          activated_at?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_access_access_code_id_fkey"
            columns: ["access_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_has_access: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
